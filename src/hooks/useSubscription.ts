import { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import type { Subscription, SubscriptionTier, UpgradeCodeInput } from "../types/subscription";
import { SUBSCRIPTION_PLANS } from "../types/subscription";

// Codes d'accès simulés (à remplacer par une vraie vérification backend en production)
const VALID_UPGRADE_CODES = [
  "PREMIUM2024",
  "LIFETIMELINE-PRO",
  "UPGRADE-NOW",
];

export function useSubscription() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Récupérer l'abonnement de l'utilisateur
  useEffect(() => {
    if (!user) {
      setSubscription(null);
      setLoading(false);
      return;
    }

    const fetchSubscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data: profile, error: fetchError } = await supabase
          .from("users")
          .select("subscription_tier, subscription_activated_at, subscription_expires_at")
          .eq("id", user.id)
          .single();

        if (fetchError) {
          throw fetchError;
        }

        const tier = (profile.subscription_tier || 'free') as SubscriptionTier;
        const limits = SUBSCRIPTION_PLANS[tier];

        setSubscription({
          tier,
          limits,
          activatedAt: profile.subscription_activated_at,
          expiresAt: profile.subscription_expires_at,
        });
      } catch (err) {
        console.error("Error fetching subscription:", err);
        setError(err instanceof Error ? err.message : "Error fetching subscription");

        // Fallback sur free en cas d'erreur
        setSubscription({
          tier: 'free',
          limits: SUBSCRIPTION_PLANS.free,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, [user]);

  // Vérifier si l'utilisateur peut créer plus de catégories
  const canCreateCategory = (currentCount: number): boolean => {
    if (!subscription) return false;
    return currentCount < subscription.limits.maxCategories;
  };

  // Vérifier si l'utilisateur peut créer plus d'événements
  const canCreateEvent = (currentCount: number): boolean => {
    if (!subscription) return false;
    return currentCount < subscription.limits.maxEvents;
  };

  // Vérifier si l'utilisateur a atteint la limite
  const isAtLimit = (currentCount: number, limitType: 'categories' | 'events'): boolean => {
    if (!subscription) return true;
    const limit = limitType === 'categories'
      ? subscription.limits.maxCategories
      : subscription.limits.maxEvents;
    return currentCount >= limit;
  };

  // Upgrader vers premium avec un code
  const upgradeToPremium = async (input: UpgradeCodeInput) => {
    if (!user) {
      throw new Error("No user logged in");
    }

    try {
      setError(null);

      // Vérifier le code
      if (!VALID_UPGRADE_CODES.includes(input.code.toUpperCase())) {
        throw new Error("Code d'accès invalide");
      }

      // Mettre à jour l'abonnement
      const { error: updateError } = await supabase
        .from("users")
        .update({
          subscription_tier: 'premium',
          subscription_activated_at: new Date().toISOString(),
          subscription_expires_at: null, // Accès à vie pour l'instant
        })
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }

      // Mettre à jour l'état local
      setSubscription({
        tier: 'premium',
        limits: SUBSCRIPTION_PLANS.premium,
        activatedAt: new Date().toISOString(),
        expiresAt: null,
      });

      return { success: true, error: null };
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Erreur lors de l'upgrade";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  return {
    subscription,
    loading,
    error,
    canCreateCategory,
    canCreateEvent,
    isAtLimit,
    upgradeToPremium,
    isPremium: subscription?.tier === 'premium',
    isFree: subscription?.tier === 'free',
  };
}
