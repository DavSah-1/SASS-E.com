-- Create Missing Tables and Relationships
-- Run this in Supabase SQL Editor

-- ============================================================================
-- 1. Create quiz_results table
-- ============================================================================
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
CREATE POLICY "Users can view their own quiz results" ON quiz_results
  FOR SELECT USING (user_id = auth.uid()::integer);

CREATE POLICY "Users can insert their own quiz results" ON quiz_results
  FOR INSERT WITH CHECK (user_id = auth.uid()::integer);

CREATE POLICY "Service role has full access to quiz results" ON quiz_results
  FOR ALL USING (auth.jwt()->>'role' = 'service_role');

-- ============================================================================
-- 2. Add foreign key relationship between debt_payments and debts
-- ============================================================================

-- First, ensure the debt_id column exists in debt_payments
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
-- Verification: Check tables and relationships
-- ============================================================================

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

-- Verify RLS policies for quiz_results
SELECT policyname, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'quiz_results';
