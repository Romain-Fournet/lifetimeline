import type { SubscriptionTier } from './subscription';

export interface User {
  id: string;
  email: string | null;
  username: string | null;
  avatar_url: string | null;
  subscription_tier: SubscriptionTier;
  subscription_activated_at: string | null;
  subscription_expires_at: string | null;
  onboarding_completed: boolean;
  birthdate: string | null;
  location: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateProfileInput {
  username?: string;
  avatar_url?: string;
  birthdate?: string;
  location?: string;
  bio?: string;
  onboarding_completed?: boolean;
}
