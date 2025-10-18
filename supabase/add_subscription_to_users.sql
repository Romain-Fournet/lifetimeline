-- Migration: Add subscription fields to users table
-- This enables the subscription/premium feature with limits

-- Add subscription_tier column with default 'free'
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_tier TEXT NOT NULL DEFAULT 'free';

-- Add subscription_activated_at column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_activated_at TIMESTAMPTZ;

-- Add subscription_expires_at column
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ;

-- Add check constraint to ensure valid subscription tiers
ALTER TABLE public.users
ADD CONSTRAINT valid_subscription_tier
CHECK (subscription_tier IN ('free', 'premium'));

-- Create index for faster queries on subscription tier
CREATE INDEX IF NOT EXISTS users_subscription_tier_idx
ON public.users(subscription_tier);

-- Add comments for documentation
COMMENT ON COLUMN public.users.subscription_tier IS
'Subscription tier of the user: free (4 categories, 10 events) or premium (unlimited)';

COMMENT ON COLUMN public.users.subscription_activated_at IS
'Timestamp when premium subscription was activated';

COMMENT ON COLUMN public.users.subscription_expires_at IS
'Timestamp when premium subscription expires (null = lifetime access)';
