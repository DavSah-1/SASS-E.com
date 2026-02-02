-- Supabase Database Schema Creation Script
-- Generated from server/supabaseDb.ts

-- Create enums first
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE subscription_tier AS ENUM ('free', 'starter', 'pro', 'ultimate');
CREATE TYPE billing_period AS ENUM ('monthly', 'six_month', 'annual');
CREATE TYPE subscription_status AS ENUM ('active', 'canceled', 'past_due', 'unpaid', 'trialing');

-- Create users table
CREATE TABLE users (
  id TEXT PRIMARY KEY,
  email VARCHAR(320),
  name TEXT,
  role user_role NOT NULL DEFAULT 'user',
  subscription_tier subscription_tier NOT NULL DEFAULT 'free',
  selected_specialized_hubs TEXT[] NOT NULL DEFAULT '{}',
  hubs_selected_at TIMESTAMP,
  
  -- Stripe subscription fields
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  subscription_status subscription_status DEFAULT 'trialing',
  billing_period billing_period DEFAULT 'monthly',
  
  -- Trial tracking fields
  trial_days INTEGER NOT NULL DEFAULT 5,
  hub_trial_start_dates JSONB NOT NULL DEFAULT '{}',
  
  -- Billing cycle fields
  current_period_start TIMESTAMP,
  current_period_end TIMESTAMP,
  cancel_at_period_end TEXT,
  
  -- User type tracking
  is_new_user TEXT NOT NULL DEFAULT 'yes',
  
  -- Timestamps
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  last_signed_in TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_stripe_subscription_id ON users(stripe_subscription_id);
CREATE INDEX idx_users_subscription_tier ON users(subscription_tier);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $func$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$func$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Grant permissions (adjust as needed for your Supabase setup)
-- These are typically handled by Supabase RLS policies
-- ALTER TABLE users ENABLE ROW LEVEL SECURITY;
