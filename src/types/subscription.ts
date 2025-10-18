export type SubscriptionTier = 'free' | 'premium';

export interface SubscriptionLimits {
  maxCategories: number;
  maxEvents: number;
  maxPhotosPerEvent: number;
}

export interface Subscription {
  tier: SubscriptionTier;
  limits: SubscriptionLimits;
  activatedAt?: string;
  expiresAt?: string;
}

export const SUBSCRIPTION_PLANS: Record<SubscriptionTier, SubscriptionLimits> = {
  free: {
    maxCategories: 4,
    maxEvents: 10,
    maxPhotosPerEvent: 3,
  },
  premium: {
    maxCategories: 999,
    maxEvents: 999,
    maxPhotosPerEvent: 20,
  },
};

export interface UpgradeCodeInput {
  code: string;
}
