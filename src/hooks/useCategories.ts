import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { useSubscription } from "./useSubscription";
import type {
  Category,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "../types/category";

export function useCategories() {
  const { user } = useAuth();
  const { canCreateCategory } = useSubscription();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer toutes les catégories de l'utilisateur
  useEffect(() => {
    if (!user?.id) {
      setCategories([]);
      setLoading(false);
      return;
    }

    const fetchCategories = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("categories")
          .select("*")
          .eq("user_id", user.id)
          .order("display_order", { ascending: true });

        if (fetchError) {
          throw fetchError;
        }

        setCategories(data || []);
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError(
          err instanceof Error ? err.message : "Error fetching categories"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, [user?.id]);

  // Créer une nouvelle catégorie
  const createCategory = async (categoryData: CreateCategoryInput) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    // Vérifier la limite d'abonnement
    if (!canCreateCategory(categories.length)) {
      const errorMessage =
        "Limite de catégories atteinte. Passez à Premium pour créer plus de catégories.";
      setError(errorMessage);
      return { data: null, error: errorMessage };
    }

    try {
      setError(null);

      // Déterminer le prochain display_order
      const maxOrder =
        categories.length > 0
          ? Math.max(...categories.map((cat) => cat.display_order))
          : -1;
      const nextOrder = categoryData.display_order ?? maxOrder + 1;

      const { data, error: createError } = await supabase
        .from("categories")
        .insert({
          user_id: user.id,
          name: categoryData.name,
          slug: categoryData.slug,
          icon: categoryData.icon,
          color: categoryData.color,
          description: categoryData.description,
          display_order: nextOrder,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      // Ajouter la nouvelle catégorie à la liste
      setCategories((prev) =>
        [...prev, data].sort((a, b) => a.display_order - b.display_order)
      );
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating category";
      setError(errorMessage);
      console.error("Error creating category:", err);
      return { data: null, error: errorMessage };
    }
  };

  // Mettre à jour une catégorie
  const updateCategory = async (
    categoryId: string,
    updates: UpdateCategoryInput
  ) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("categories")
        .update(updates)
        .eq("id", categoryId)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour la catégorie dans la liste
      setCategories((prev) =>
        prev
          .map((cat) => (cat.id === categoryId ? data : cat))
          .sort((a, b) => a.display_order - b.display_order)
      );
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating category";
      setError(errorMessage);
      console.error("Error updating category:", err);
      return { data: null, error: errorMessage };
    }
  };

  // Supprimer une catégorie
  const deleteCategory = async (categoryId: string) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      // Vérifier s'il y a des événements associés à cette catégorie
      const { count: eventsCount, error: countError } = await supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("category_id", categoryId);

      if (countError) {
        console.error("Error counting events for category:", countError);
        throw countError;
      }

      // Empêcher la suppression si des événements sont associés
      if (eventsCount && eventsCount > 0) {
        const errorMessage = `Impossible de supprimer cette catégorie. ${eventsCount} événement${
          eventsCount > 1 ? "s sont" : " est"
        } associé${
          eventsCount > 1 ? "s" : ""
        } à cette catégorie. Veuillez d'abord supprimer ou réassigner ${
          eventsCount > 1 ? "ces événements" : "cet événement"
        }.`;
        setError(errorMessage);
        return { error: errorMessage };
      }

      const { error: deleteError } = await supabase
        .from("categories")
        .delete()
        .eq("id", categoryId)
        .eq("user_id", user.id);

      if (deleteError) {
        throw deleteError;
      }

      // Retirer la catégorie de la liste
      setCategories((prev) => prev.filter((cat) => cat.id !== categoryId));
      return { error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error deleting category";
      setError(errorMessage);
      console.error("Error deleting category:", err);
      return { error: errorMessage };
    }
  };

  // Récupérer une catégorie par son slug
  const getCategoryBySlug = (slug: string): Category | undefined => {
    return categories.find((cat) => cat.slug === slug);
  };

  // Récupérer une catégorie par son ID
  const getCategoryById = (id: string): Category | undefined => {
    return categories.find((cat) => cat.id === id);
  };

  // Mettre à jour l'ordre des catégories
  const updateCategoriesOrder = async (orderedCategoryIds: string[]) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    // Sauvegarder l'état précédent pour rollback en cas d'erreur
    const previousCategories = categories;

    try {
      setError(null);

      // Mise à jour optimiste : mettre à jour l'état local immédiatement
      setCategories((prev) => {
        const categoriesMap = new Map(prev.map((cat) => [cat.id, cat]));
        return orderedCategoryIds
          .map((id, index) => {
            const cat = categoriesMap.get(id);
            if (cat) {
              return { ...cat, display_order: index };
            }
            return null;
          })
          .filter((cat): cat is Category => cat !== null);
      });

      // Créer les updates avec les nouveaux display_order
      const updates = orderedCategoryIds.map((categoryId, index) => ({
        id: categoryId,
        display_order: index,
      }));

      // Mettre à jour chaque catégorie en base de données
      const updatePromises = updates.map(({ id, display_order }) =>
        supabase
          .from("categories")
          .update({ display_order })
          .eq("id", id)
          .eq("user_id", user.id)
      );

      const results = await Promise.all(updatePromises);

      // Vérifier s'il y a des erreurs
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error("Failed to update some categories order");
      }

      return { error: null };
    } catch (err) {
      // Rollback en cas d'erreur
      setCategories(previousCategories);

      const errorMessage =
        err instanceof Error ? err.message : "Error updating categories order";
      setError(errorMessage);
      console.error("Error updating categories order:", err);
      return { error: errorMessage };
    }
  };

  return {
    categories,
    loading,
    error,
    createCategory,
    updateCategory,
    deleteCategory,
    getCategoryBySlug,
    getCategoryById,
    updateCategoriesOrder,
  };
}
