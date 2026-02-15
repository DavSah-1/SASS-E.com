-- Supabase Schema Rollback: Revert snake_case columns to camelCase
-- FILTERED VERSION: Only includes tables that exist in Supabase
-- Use this if you need to undo the migration

-- WARNING: This will rename columns back to their original names.

-- Table: cleanup_logs
ALTER TABLE cleanup_logs RENAME COLUMN cleanup_type TO cleanupType;
ALTER TABLE cleanup_logs RENAME COLUMN files_deleted TO filesDeleted;
ALTER TABLE cleanup_logs RENAME COLUMN space_freed_mb TO spaceFreedMB;

-- Table: finance_articles
ALTER TABLE finance_articles RENAME COLUMN tier_id TO tierId;

-- Table: quota_usage
ALTER TABLE quota_usage RENAME COLUMN user_id TO userId;

-- Table: user_learning_badges
ALTER TABLE user_learning_badges RENAME COLUMN user_id TO userId;
ALTER TABLE user_learning_badges RENAME COLUMN badge_id TO badgeId;
ALTER TABLE user_learning_badges RENAME COLUMN earned_at TO earnedAt;

-- Table: user_learning_progress
ALTER TABLE user_learning_progress RENAME COLUMN user_id TO userId;
ALTER TABLE user_learning_progress RENAME COLUMN article_id TO articleId;
ALTER TABLE user_learning_progress RENAME COLUMN progress_percentage TO progressPercentage;
ALTER TABLE user_learning_progress RENAME COLUMN time_spent TO timeSpent;
ALTER TABLE user_learning_progress RENAME COLUMN last_read_at TO lastReadAt;
ALTER TABLE user_learning_progress RENAME COLUMN completed_at TO completedAt;
ALTER TABLE user_learning_progress RENAME COLUMN created_at TO createdAt;
ALTER TABLE user_learning_progress RENAME COLUMN updated_at TO updatedAt;

-- Table: users
ALTER TABLE users RENAME COLUMN supabase_id TO supabaseId;
