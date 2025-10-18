import { supabase } from "../lib/supabase";

export interface Category {
  id: string;
  label: string;
  label_plural: string;
  icon_name: string;
  color_primary: string;
  color_light: string;
  color_border: string;
  color_text: string;
  display_order: number;
}

export const categoriesService = {
  /**
   * Récupère toutes les catégories actives
   */
  async getAll(): Promise<Category[]> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) throw error;

    return data;
  },

  /**
   * Récupère une catégorie par son ID
   */
  async getById(id: string): Promise<Category | null> {
    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Cache les catégories en mémoire pour éviter les appels répétés
   */
  _cache: null as Category[] | null,

  async getAllCached(): Promise<Category[]> {
    if (this._cache) return this._cache;

    this._cache = await this.getAll();
    return this._cache;
  },

  /**
   * Invalide le cache (à appeler si les catégories changent)
   */
  clearCache() {
    this._cache = null;
  },
};
