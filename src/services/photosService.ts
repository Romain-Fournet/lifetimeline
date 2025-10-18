import { supabase } from "../lib/supabase";

/**
 * Vérifie si l'utilisateur est authentifié
 */
async function requireAuth(): Promise<string> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error) throw error;
  if (!user) throw new Error("Not authenticated");

  return user.id;
}

/**
 * Génère un nom de fichier unique
 */
function generateFileName(
  userId: string,
  eventId: string,
  originalName: string
): string {
  const fileExt = originalName.split(".").pop();
  const timestamp = Date.now();
  return `${userId}/${eventId}/${timestamp}.${fileExt}`;
}

export const photosService = {
  /**
   * Upload une photo pour un événement
   */
  async upload(eventId: string, file: File): Promise<string> {
    const userId = await requireAuth();

    // Générer le chemin du fichier
    const fileName = generateFileName(userId, eventId, file.name);

    // 1. Upload vers Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("event-photos")
      .upload(fileName, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // 2. Obtenir l'URL publique
    const {
      data: { publicUrl },
    } = supabase.storage.from("event-photos").getPublicUrl(fileName);

    // 3. Enregistrer dans la base de données
    const { error: dbError } = await supabase.from("event_photos").insert({
      event_id: eventId,
      user_id: userId,
      file_url: publicUrl,
      file_name: file.name,
      file_size_bytes: file.size,
      display_order: 0,
    });

    if (dbError) {
      // En cas d'erreur DB, supprimer le fichier uploadé
      await supabase.storage.from("event-photos").remove([fileName]);
      throw dbError;
    }

    return publicUrl;
  },

  /**
   * Upload plusieurs photos en parallèle
   */
  async uploadMultiple(eventId: string, files: File[]): Promise<string[]> {
    if (files.length === 0) return [];

    try {
      const uploadPromises = files.map((file) => this.upload(eventId, file));
      return await Promise.all(uploadPromises);
    } catch (error) {
      // Si une photo échoue, on continue avec les autres
      console.error("Error uploading photos:", error);
      throw error;
    }
  },

  /**
   * Supprime une photo
   */
  async delete(photoId: string): Promise<void> {
    const userId = await requireAuth();

    // 1. Récupérer l'info de la photo
    const { data: photo, error: fetchError } = await supabase
      .from("event_photos")
      .select("file_url")
      .eq("id", photoId)
      .eq("user_id", userId)
      .single();

    if (fetchError) throw fetchError;
    if (!photo) throw new Error("Photo not found");

    // 2. Extraire le chemin du fichier depuis l'URL
    const url = new URL(photo.file_url);
    const pathMatch = url.pathname.match(/event-photos\/(.+)$/);

    if (!pathMatch) throw new Error("Invalid photo URL");

    const filePath = pathMatch[1];

    // 3. Supprimer de Storage
    const { error: storageError } = await supabase.storage
      .from("event-photos")
      .remove([filePath]);

    if (storageError) {
      console.error("Error deleting from storage:", storageError);
      // On continue même si la suppression du storage échoue
    }

    // 4. Supprimer de la base de données
    const { error: dbError } = await supabase
      .from("event_photos")
      .delete()
      .eq("id", photoId)
      .eq("user_id", userId);

    if (dbError) throw dbError;
  },

  /**
   * Récupère toutes les photos d'un événement
   */
  async getByEvent(eventId: string): Promise<
    Array<{
      id: string;
      file_url: string;
      file_name: string;
      display_order: number;
    }>
  > {
    const userId = await requireAuth();

    const { data, error } = await supabase
      .from("event_photos")
      .select("id, file_url, file_name, display_order")
      .eq("event_id", eventId)
      .eq("user_id", userId)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return data;
  },

  /**
   * Met à jour l'ordre d'affichage des photos
   */
  async updateOrder(photoId: string, newOrder: number): Promise<void> {
    const userId = await requireAuth();

    const { error } = await supabase
      .from("event_photos")
      .update({ display_order: newOrder })
      .eq("id", photoId)
      .eq("user_id", userId);

    if (error) throw error;
  },
};
