-- ============================================================================
-- SUPPLEMENTAL SCHEMA FIXES V2 (CORRECTED)
-- Run this in Supabase SQL Editor AFTER running schema-only-fixes.sql
-- ============================================================================

-- 1. Add missing 'answers' column to quiz_results table
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'quiz_results') THEN
    ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answers JSONB;
    RAISE NOTICE 'Added answers column to quiz_results';
  ELSE
    RAISE NOTICE 'quiz_results table does not exist, skipping';
  END IF;
END $$;

-- 2. Create exercise_attempts table (simplified, no foreign keys)
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  exercise_id VARCHAR(255) NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Add indexes only on columns that definitely exist
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_user_id ON exercise_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exercise_attempts_created_at ON exercise_attempts(created_at);

COMMENT ON TABLE exercise_attempts IS 'Stores user attempts at language learning exercises';

-- 3. Add room column to iot_devices if table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iot_devices') THEN
    ALTER TABLE iot_devices ADD COLUMN IF NOT EXISTS room VARCHAR(100);
    COMMENT ON COLUMN iot_devices.room IS 'Room or location where the IoT device is placed';
    RAISE NOTICE 'Added room column to iot_devices';
  ELSE
    RAISE NOTICE 'iot_devices table does not exist, skipping';
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify quiz_results has answers column
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'quiz_results' AND column_name = 'answers'
    ) THEN 'quiz_results.answers column EXISTS ✓'
    ELSE 'quiz_results.answers column MISSING ✗'
  END as status;

-- Verify exercise_attempts table exists
SELECT 
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_name = 'exercise_attempts'
    ) THEN 'exercise_attempts table EXISTS ✓'
    ELSE 'exercise_attempts table MISSING ✗'
  END as status;

-- Verify iot_devices has room column (if table exists)
SELECT 
  CASE 
    WHEN NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iot_devices')
    THEN 'iot_devices table does not exist (OK)'
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'iot_devices' AND column_name = 'room'
    ) THEN 'iot_devices.room column EXISTS ✓'
    ELSE 'iot_devices.room column MISSING ✗'
  END as status;

-- Count rows in new tables
SELECT 'exercise_attempts' as table_name, COUNT(*) as row_count FROM exercise_attempts;
