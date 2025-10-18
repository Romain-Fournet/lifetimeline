import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { User, UpdateProfileInput } from "../types/user";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer le profil de l'utilisateur
  useEffect(() => {
    if (!user?.id) {
      setProfile(null);
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("users")
          .select("*")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        setProfile(data);
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err instanceof Error ? err.message : "Error fetching profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Mettre à jour le profil
  const updateProfile = async (updates: UpdateProfileInput) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const { data, error: updateError } = await supabase
        .from("users")
        .update(updates)
        .eq("id", user.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error updating profile";
      setError(errorMessage);
      console.error("Error updating profile:", err);
      return { data: null, error: errorMessage };
    }
  };

  // Créer un profil (si nécessaire)
  const createProfile = async (profileData: Partial<User>) => {
    if (!user?.id) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      const { data, error: createError } = await supabase
        .from("users")
        .insert({
          id: user.id,
          email: user.email,
          ...profileData,
        })
        .select()
        .single();

      if (createError) {
        throw createError;
      }

      setProfile(data);
      return { data, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Error creating profile";
      setError(errorMessage);
      console.error("Error creating profile:", err);
      return { data: null, error: errorMessage };
    }
  };

  return {
    profile,
    loading,
    error,
    updateProfile,
    createProfile,
  };
}
