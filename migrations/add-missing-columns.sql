-- Add Missing Columns to Supabase Tables
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. Add missing columns to debts table
-- ============================================================================
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS is_paid_off BOOLEAN DEFAULT FALSE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_debts_is_paid_off ON debts(is_paid_off);

-- ============================================================================
-- 2. Add missing columns to conversations table
-- ============================================================================
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Update existing rows to have proper timestamps
UPDATE conversations SET created_at = NOW() WHERE created_at IS NULL;

-- ============================================================================
-- 3. Add missing columns to topic_progress table
-- ============================================================================
ALTER TABLE topic_progress 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT NOW();

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_topic_progress_last_accessed ON topic_progress(last_accessed);

-- Update existing rows to have proper timestamps
UPDATE topic_progress SET last_accessed = NOW() WHERE last_accessed IS NULL;

-- ============================================================================
-- 4. Add missing columns to debt_budget_snapshots table
-- ============================================================================
ALTER TABLE debt_budget_snapshots 
ADD COLUMN IF NOT EXISTS snapshot_date DATE DEFAULT CURRENT_DATE;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_debt_snapshots_date ON debt_budget_snapshots(snapshot_date);

-- Update existing rows to have proper dates
UPDATE debt_budget_snapshots SET snapshot_date = CURRENT_DATE WHERE snapshot_date IS NULL;

-- ============================================================================
-- Verification: Check that all columns exist
-- ============================================================================
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name IN ('debts', 'conversations', 'topic_progress', 'debt_budget_snapshots')
  AND column_name IN ('is_paid_off', 'created_at', 'last_accessed', 'snapshot_date')
ORDER BY table_name, column_name;
