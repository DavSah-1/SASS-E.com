-- ============================================================================
-- CORRECTED TEST FIXES MIGRATION
-- Run this entire file in Supabase SQL Editor
-- ============================================================================
-- This migration fixes the column name issue in translate_conversations
-- Uses creatorId instead of user_id to match actual schema
-- ============================================================================

-- ============================================================================
-- PART 1: Fix RLS Infinite Recursion in translate_conversations
-- ============================================================================

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can insert their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Service role has full access" ON translate_conversations;

-- Create simplified, non-recursive policies using correct column names

-- SELECT policy: Users can view conversations they created OR are participants in
CREATE POLICY "Users can view their conversations" 
ON translate_conversations FOR SELECT 
USING (
  -- User is the creator
  auth.uid()::integer = "creatorId"
  OR
  -- User is a participant (check via join table)
  id IN (
    SELECT "conversationId" 
    FROM translate_conversation_participants 
    WHERE "userId" = auth.uid()::integer
  )
);

-- INSERT policy: Users can create conversations for themselves
CREATE POLICY "Users can insert their conversations" 
ON translate_conversations FOR INSERT 
WITH CHECK (auth.uid()::integer = "creatorId");

-- UPDATE policy: Only creators can update their conversations
CREATE POLICY "Users can update their conversations" 
ON translate_conversations FOR UPDATE 
USING (auth.uid()::integer = "creatorId")
WITH CHECK (auth.uid()::integer = "creatorId");

-- DELETE policy: Only creators can delete their conversations
CREATE POLICY "Users can delete their conversations" 
ON translate_conversations FOR DELETE 
USING (auth.uid()::integer = "creatorId");

-- Service role policy: Admin/service role can do everything (for tests and admin operations)
CREATE POLICY "Service role has full access" 
ON translate_conversations 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- PART 2: Add Missing Columns to Tables
-- ============================================================================

-- 2.1: Add missing columns to debts table
ALTER TABLE debts 
ADD COLUMN IF NOT EXISTS is_paid_off BOOLEAN DEFAULT FALSE;

CREATE INDEX IF NOT EXISTS idx_debts_is_paid_off ON debts(is_paid_off);

-- 2.2: Add missing columns to conversations table
ALTER TABLE conversations 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_conversations_created_at ON conversations(created_at);

UPDATE conversations SET created_at = NOW() WHERE created_at IS NULL;

-- 2.3: Add missing columns to topic_progress table
ALTER TABLE topic_progress 
ADD COLUMN IF NOT EXISTS last_accessed TIMESTAMP DEFAULT NOW();

CREATE INDEX IF NOT EXISTS idx_topic_progress_last_accessed ON topic_progress(last_accessed);

UPDATE topic_progress SET last_accessed = NOW() WHERE last_accessed IS NULL;

-- 2.4: Add missing columns to debt_budget_snapshots table
ALTER TABLE debt_budget_snapshots 
ADD COLUMN IF NOT EXISTS snapshot_date DATE DEFAULT CURRENT_DATE;

CREATE INDEX IF NOT EXISTS idx_debt_snapshots_date ON debt_budget_snapshots(snapshot_date);

UPDATE debt_budget_snapshots SET snapshot_date = CURRENT_DATE WHERE snapshot_date IS NULL;

-- ============================================================================
-- PART 3: Create Missing Tables and Relationships
-- ============================================================================

-- 3.1: Create quiz_results table
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

-- Enable RLS
ALTER TABLE quiz_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for quiz_results
DROP POLICY IF EXISTS "Users can view their own quiz results" ON quiz_results;
DROP POLICY IF EXISTS "Users can insert their own quiz results" ON quiz_results;
DROP POLICY IF EXISTS "Service role has full access to quiz results" ON quiz_results;

CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Service role has full access to quiz results" ON quiz_results
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- 3.2: Add foreign key relationship between debt_payments and debts
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

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify RLS policies for translate_conversations
SELECT 
  policyname, 
  cmd, 
  SUBSTRING(qual::text, 1, 80) as using_clause,
  SUBSTRING(with_check::text, 1, 80) as with_check_clause
FROM pg_policies 
WHERE tablename = 'translate_conversations'
ORDER BY policyname;

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
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;

-- Verify foreign key relationship
SELECT
  tc.table_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'debt_payments' 
  AND tc.constraint_type = 'FOREIGN KEY';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================
-- Expected results:
-- - 7 translate-chat.test.ts tests should now pass
-- - 18 debtCoach.test.ts and topic-learning.test.ts tests should now pass
-- - 8 quiz and debt payment tests should now pass
-- Total: 33 additional tests passing (from 244 to 277)
-- ============================================================================
