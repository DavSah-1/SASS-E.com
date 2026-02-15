-- ============================================================================
-- Supabase Schema Synchronization Migration
-- Generated: 2026-02-15
-- Purpose: Sync application schema (drizzle/supabaseSchema.ts) with Supabase DB
-- ============================================================================

-- This migration creates missing tables that exist in the app but not in Supabase
-- It does NOT delete any existing tables in Supabase

-- ============================================================================
-- MISSING TABLES (1 table)
-- ============================================================================

-- Table: vocabulary
-- Description: Language learning vocabulary
CREATE TABLE IF NOT EXISTS public.vocabulary (
    id INTEGER PRIMARY KEY,
    user_id INTEGER NOT NULL,
    word VARCHAR(255) NOT NULL,
    translation VARCHAR(255) NOT NULL,
    language VARCHAR(50) NOT NULL,
    difficulty VARCHAR(50),
    part_of_speech VARCHAR(50),
    context TEXT,
    pronunciation VARCHAR(255),
    example_sentence TEXT,
    example_translation TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for vocabulary table
CREATE INDEX IF NOT EXISTS idx_vocabulary_user_id ON public.vocabulary(user_id);
CREATE INDEX IF NOT EXISTS idx_vocabulary_language ON public.vocabulary(language);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================
-- Run these to verify the migration:
-- SELECT tablename FROM pg_tables WHERE schemaname = 'public' AND tablename = 'vocabulary';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'vocabulary' ORDER BY ordinal_position;
-- ============================================================================
