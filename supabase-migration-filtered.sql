-- Supabase Schema Migration: Convert camelCase columns to snake_case
-- FILTERED VERSION: Only includes tables that exist in Supabase
-- Execute these statements in Supabase SQL Editor

-- WARNING: This will rename columns in your Supabase database.
-- Ensure you have a backup before proceeding.

-- Total Supabase tables affected: 6
-- Total columns to rename: 17

-- Table: cleanup_logs (3 columns)
ALTER TABLE cleanup_logs RENAME COLUMN cleanupType TO cleanup_type;
ALTER TABLE cleanup_logs RENAME COLUMN filesDeleted TO files_deleted;
ALTER TABLE cleanup_logs RENAME COLUMN spaceFreedMB TO space_freed_mb;

-- Table: finance_articles (1 columns)
ALTER TABLE finance_articles RENAME COLUMN tierId TO tier_id;

-- Table: quota_usage (1 columns)
ALTER TABLE quota_usage RENAME COLUMN userId TO user_id;

-- Table: user_learning_badges (3 columns)
ALTER TABLE user_learning_badges RENAME COLUMN userId TO user_id;
ALTER TABLE user_learning_badges RENAME COLUMN badgeId TO badge_id;
ALTER TABLE user_learning_badges RENAME COLUMN earnedAt TO earned_at;

-- Table: user_learning_progress (8 columns)
ALTER TABLE user_learning_progress RENAME COLUMN userId TO user_id;
ALTER TABLE user_learning_progress RENAME COLUMN articleId TO article_id;
ALTER TABLE user_learning_progress RENAME COLUMN progressPercentage TO progress_percentage;
ALTER TABLE user_learning_progress RENAME COLUMN timeSpent TO time_spent;
ALTER TABLE user_learning_progress RENAME COLUMN lastReadAt TO last_read_at;
ALTER TABLE user_learning_progress RENAME COLUMN completedAt TO completed_at;
ALTER TABLE user_learning_progress RENAME COLUMN createdAt TO created_at;
ALTER TABLE user_learning_progress RENAME COLUMN updatedAt TO updated_at;

-- Table: users (1 columns)
ALTER TABLE users RENAME COLUMN supabaseId TO supabase_id;
