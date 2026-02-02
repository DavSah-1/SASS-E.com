-- Add missing fields from Manus database to Supabase users table
-- This ensures both databases have the same schema

-- Step 1: Add all new columns
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_method VARCHAR(64);
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en';
ALTER TABLE users ADD COLUMN IF NOT EXISTS preferred_currency VARCHAR(3) DEFAULT 'USD';
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_price DECIMAL(10,2);
ALTER TABLE users ADD COLUMN IF NOT EXISTS subscription_currency VARCHAR(3) DEFAULT 'GBP';
ALTER TABLE users ADD COLUMN IF NOT EXISTS stay_signed_in BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_secret VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS backup_codes TEXT;

-- Step 2: Create indexes for commonly queried fields
CREATE INDEX IF NOT EXISTS idx_users_login_method ON users(login_method);
CREATE INDEX IF NOT EXISTS idx_users_preferred_language ON users(preferred_language);
CREATE INDEX IF NOT EXISTS idx_users_subscription_expires_at ON users(subscription_expires_at);
CREATE INDEX IF NOT EXISTS idx_users_two_factor_enabled ON users(two_factor_enabled);
