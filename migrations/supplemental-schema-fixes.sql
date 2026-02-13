-- ============================================================================
-- SUPPLEMENTAL SCHEMA FIXES
-- Run this in Supabase SQL Editor AFTER running schema-only-fixes.sql
-- ============================================================================

-- 1. Add missing 'answers' column to quiz_results table
ALTER TABLE quiz_results 
ADD COLUMN IF NOT EXISTS answers JSONB;

COMMENT ON COLUMN quiz_results.answers IS 'JSON array of user answers for the quiz';

-- 2. Create exercise_attempts table (for language learning exercises)
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  exercise_id VARCHAR(255) NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_exercise_id ON exercise_attempts(exercise_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_created_at ON exercise_attempts(created_at);

COMMENT ON TABLE exercise_attempts IS 'Stores user attempts at language learning exercises';

-- 3. Find and fix the 'room' column issue
-- First, let's check which table has a 'room' column reference
-- This is likely in iot_devices or conversation_sessions

-- Add room column to iot_devices if it exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iot_devices') THEN
    ALTER TABLE iot_devices ADD COLUMN IF NOT EXISTS room VARCHAR(100);
    COMMENT ON COLUMN iot_devices.room IS 'Room or location where the IoT device is placed';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify quiz_results has answers column
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_results' AND column_name = 'answers';

-- Verify exercise_attempts table exists
SELECT table_name 
FROM information_schema.tables 
WHERE table_name = 'exercise_attempts';

-- Verify iot_devices has room column (if table exists)
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'iot_devices' AND column_name = 'room';

-- Count rows in key tables
SELECT 
  'quiz_results' as table_name, COUNT(*) as row_count FROM quiz_results
UNION ALL
SELECT 
  'exercise_attempts', COUNT(*) FROM exercise_attempts;
