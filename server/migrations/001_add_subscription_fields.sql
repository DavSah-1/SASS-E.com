-- Migration: Add subscription-related fields to Supabase users table
-- Date: 2026-01-29
-- Purpose: Support Final Flow Diagram subscription system

-- Create enums if they don't exist
DO $$ BEGIN
  CREATE TYPE billing_period AS ENUM ('monthly', 'six_month', 'annual');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add Stripe subscription fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_status subscription_status DEFAULT 'trialing';
ALTER TABLE users ADD COLUMN IF NOT EXISTS billing_period billing_period DEFAULT 'monthly';

-- Add trial tracking fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_days INTEGER DEFAULT 5 NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS hub_trial_start_dates JSONB DEFAULT '{}'::jsonb NOT NULL;

-- Add billing cycle fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_start TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS current_period_end TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS cancel_at_period_end TEXT;

-- Add user type tracking
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_new_user TEXT DEFAULT 'yes' NOT NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_users_subscription_status ON users(subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_current_period_end ON users(current_period_end);

-- Add comments for documentation
COMMENT ON COLUMN users.stripe_customer_id IS 'Stripe customer ID for billing';
COMMENT ON COLUMN users.stripe_subscription_id IS 'Stripe subscription ID';
COMMENT ON COLUMN users.subscription_status IS 'Current subscription status';
COMMENT ON COLUMN users.billing_period IS 'Billing period: monthly (5-day trial), six_month/annual (7-day trial)';
COMMENT ON COLUMN users.trial_days IS 'Number of trial days: 5 for monthly, 7 for 6-month/annual';
COMMENT ON COLUMN users.hub_trial_start_dates IS 'JSON object tracking when each hub trial started';
COMMENT ON COLUMN users.current_period_start IS 'Start of current billing period';
COMMENT ON COLUMN users.current_period_end IS 'End of current billing period (for downgrade scheduling)';
COMMENT ON COLUMN users.cancel_at_period_end IS 'Tier to downgrade to at period end (null = no downgrade)';
COMMENT ON COLUMN users.is_new_user IS 'Whether user is new (yes) or upgrading (no)';
