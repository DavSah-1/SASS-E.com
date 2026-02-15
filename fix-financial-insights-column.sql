-- ============================================================================
-- Fix: Add missing expires_at column to financial_insights table
-- ============================================================================
-- Run this if you get error: column "expires_at" does not exist
-- ============================================================================

-- Add expires_at column if it doesn't exist
ALTER TABLE public.financial_insights 
ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP;

-- Create index for expires_at
CREATE INDEX IF NOT EXISTS idx_financial_insights_expires_at 
ON public.financial_insights(expires_at);

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'financial_insights' 
AND column_name = 'expires_at';
