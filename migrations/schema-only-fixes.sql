-- ============================================================================
-- SCHEMA-ONLY TEST FIXES MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================================================
-- This migration ONLY adds missing columns and tables
-- RLS policies are skipped because this app uses Manus OAuth (integer IDs)
-- instead of Supabase Auth (UUID), so application-level security is used
-- ============================================================================

-- ============================================================================
-- PART 1: Add Missing Columns to Tables
-- ============================================================================

-- 1.1: Add missing columns to debts table
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS is_paid_off BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_debts_is_paid_off ON debts(is_paid_off);

COMMENT ON COLUMN debts.is_paid_off IS 'Indicates if the debt has been fully paid off';

-- 1.2: Add missing columns to conversations table  
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

-- Backfill existing rows
UPDATE conversations SET created_at = NOW() WHERE created_at IS NULL;

COMMENT ON COLUMN conversations.created_at IS 'Timestamp when the conversation was created';

-- 1.3: Add missing columns to topic_progress table
ALTER TABLE topic_progress 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_topic_progress_last_accessed ON topic_progress(last_accessed);

-- Backfill existing rows
UPDATE topic_progress SET last_accessed = NOW() WHERE last_accessed IS NULL;

COMMENT ON COLUMN topic_progress.last_accessed IS 'Last time the user accessed this topic';

-- 1.4: Add missing columns to debt_budget_snapshots table
ALTER TABLE debt_budget_snapshots 
ADD COLUMN IF NOT EXISTS snapshot_date DATE DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_debt_snapshots_date ON debt_budget_snapshots(snapshot_date);

-- Backfill existing rows
UPDATE debt_budget_snapshots SET snapshot_date = CURRENT_DATE WHERE snapshot_date IS NULL;

COMMENT ON COLUMN debt_budget_snapshots.snapshot_date IS 'Date when this snapshot was taken';

-- ============================================================================
-- PART 2: Create Missing Tables
-- ============================================================================

-- 2.1: Create quiz_results table
CREATE TABLE IF NOT EXISTS quiz_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id INTEGER NOT NULL,
  topic_id VARCHAR(255) NOT NULL,
  score INTEGER NOT NULL CHECK (score >= 0),
  total_questions INTEGER NOT NULL CHECK (total_questions > 0),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (
    (score::DECIMAL / NULLIF(total_questions, 0)) * 100
  ) STORED,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_results_user_id ON quiz_results(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_topic_id ON quiz_results(topic_id);
CREATE INDEX IF NOT EXISTS idx_quiz_results_created_at ON quiz_results(created_at);

COMMENT ON TABLE quiz_results IS 'Stores quiz results for learning hub topics';
COMMENT ON COLUMN quiz_results.user_id IS 'Manus user ID (integer from users table)';
COMMENT ON COLUMN quiz_results.percentage IS 'Calculated percentage score';

-- ============================================================================
-- PART 3: Add Missing Relationships
-- ============================================================================

-- 3.1: Add foreign key relationship between debt_payments and debts
ALTER TABLE debt_payments 
ADD COLUMN IF NOT EXISTS debt_id INTEGER;

-- Add foreign key constraint
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'fk_debt_payments_debts'
  ) THEN
    ALTER TABLE debt_payments 
    ADD CONSTRAINT fk_debt_payments_debts 
    FOREIGN KEY (debt_id) 
    REFERENCES debts(id) 
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add index for performance
CREATE INDEX IF NOT EXISTS idx_debt_payments_debt_id ON debt_payments(debt_id);

COMMENT ON COLUMN debt_payments.debt_id IS 'Foreign key reference to debts table';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify new columns exist
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

-- Verify quiz_results table exists
SELECT 
  table_name, 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;

-- Verify foreign key relationship
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  tc.constraint_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'debt_payments' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- Count rows in each affected table
SELECT 'debts' as table_name, COUNT(*) as row_count FROM debts
UNION ALL
SELECT 'conversations', COUNT(*) FROM conversations
UNION ALL
SELECT 'topic_progress', COUNT(*) FROM topic_progress
UNION ALL
SELECT 'debt_budget_snapshots', COUNT(*) FROM debt_budget_snapshots
UNION ALL
SELECT 'quiz_results', COUNT(*) FROM quiz_results
UNION ALL
SELECT 'debt_payments', COUNT(*) FROM debt_payments;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Expected results after running tests:
-- - 18 tests related to missing columns should now pass
-- - 8 tests related to quiz_results and debt_payments should now pass
-- - 7 translate-chat tests may still fail (RLS policies not included)
-- Total: ~26 additional tests passing (from 244 to ~270)
--
-- Note: RLS policies are NOT included in this migration because this app
-- uses Manus OAuth with integer user IDs, not Supabase Auth with UUIDs.
-- Security is enforced at the application level via dbRoleAware.ts
-- ============================================================================
