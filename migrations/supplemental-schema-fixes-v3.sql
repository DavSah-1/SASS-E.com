-- ============================================================================
-- SUPPLEMENTAL SCHEMA FIXES V3 (ULTRA-SIMPLIFIED)
-- Run this in Supabase SQL Editor AFTER running schema-only-fixes.sql
-- ============================================================================

-- 1. Add missing 'answers' column to quiz_results table
ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS answers JSONB;

-- 2. Create exercise_attempts table (minimal structure, NO indexes)
CREATE TABLE IF NOT EXISTS exercise_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  exercise_id VARCHAR(255) NOT NULL,
  user_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 3. Add room column to iot_devices (only if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'iot_devices') THEN
    ALTER TABLE iot_devices ADD COLUMN IF NOT EXISTS room VARCHAR(100);
  END IF;
END $$;

-- ============================================================================
-- VERIFICATION - Check what was created
-- ============================================================================

-- Show all columns in quiz_results
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'quiz_results'
ORDER BY ordinal_position;

-- Show all columns in exercise_attempts
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exercise_attempts'
ORDER BY ordinal_position;

-- Count rows
SELECT 'quiz_results' as table_name, COUNT(*) as row_count FROM quiz_results
UNION ALL
SELECT 'exercise_attempts', COUNT(*) FROM exercise_attempts;
