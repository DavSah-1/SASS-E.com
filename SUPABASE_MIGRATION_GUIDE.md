# Supabase Schema Migration Guide

## Overview

This migration standardizes all Supabase table columns from **camelCase** to **snake_case** naming convention to match PostgreSQL best practices and eliminate schema inconsistencies.

## Migration Statistics

- **Tables affected:** 89 tables
- **Columns to rename:** 309 columns
- **Migration SQL:** `supabase-migration.sql` (496 lines)
- **Rollback SQL:** `supabase-rollback.sql` (491 lines)

## Why This Migration Is Needed

The current Supabase schema has **inconsistent column naming**:
- Some tables use `snake_case` (e.g., `debt_payments.debt_id`)
- Some tables use `camelCase` (e.g., `debts.userId`, `debt_milestones.targetDate`)

This inconsistency causes:
- **Test failures** (34 tests failing due to column name mismatches)
- **Adapter implementation complexity** (requires manual mapping between naming conventions)
- **Developer confusion** (hard to predict which convention a table uses)

After this migration, **all columns will use snake_case**, matching PostgreSQL conventions and the MySQL schema definition in `drizzle/schema.ts`.

## Pre-Migration Checklist

Before executing the migration, ensure:

1. ✅ **Backup your Supabase database**
   - Go to Supabase Dashboard → Database → Backups
   - Create a manual backup or verify automatic backups are enabled

2. ✅ **Verify no active user sessions**
   - This migration will cause brief downtime
   - Consider scheduling during low-traffic hours

3. ✅ **Review the migration SQL**
   - Open `supabase-migration.sql` and review all ALTER TABLE statements
   - Ensure all affected tables exist in your Supabase database

4. ✅ **Test in a staging environment (if available)**
   - Clone your production database to a test project
   - Run the migration there first to verify

## Migration Steps

### Step 1: Open Supabase SQL Editor

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New query** to create a new SQL script

### Step 2: Execute Migration SQL

1. Copy the entire contents of `supabase-migration.sql`
2. Paste into the SQL Editor
3. Click **Run** to execute all ALTER TABLE statements

**Expected execution time:** 1-3 minutes (depending on table sizes)

### Step 3: Verify Migration Success

Run this verification query to check if columns were renamed:

```sql
-- Check a sample of renamed columns
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'debts' 
  AND column_name IN ('user_id', 'userId');

-- Should return 'user_id' only (not 'userId')
```

### Step 4: Update Supabase Adapters

After the migration, update all 7 Supabase adapter implementations to use snake_case column names:

- `server/adapters/SupabaseNotificationAdapter.ts`
- `server/adapters/SupabaseBudgetAdapter.ts`
- `server/adapters/SupabaseDebtAdapter.ts`
- `server/adapters/SupabaseLearningAdapter.ts`
- `server/adapters/SupabaseIoTAdapter.ts`
- `server/adapters/SupabaseGoalsAdapter.ts`
- `server/adapters/SupabaseTranslationAdapter.ts`

**Example change:**

```typescript
// Before migration
const { data, error } = await this.supabase
  .from('debts')
  .select('*')
  .eq('userId', userId);  // ❌ Old camelCase

// After migration
const { data, error } = await this.supabase
  .from('debts')
  .select('*')
  .eq('user_id', userId);  // ✅ New snake_case
```

### Step 5: Run Test Suite

After updating adapters, verify all tests pass:

```bash
cd /home/ubuntu/sarcastic-ai-assistant
pnpm test
```

**Expected result:** 311/311 tests passing (100%)

## Rollback Procedure

If you encounter issues and need to revert the migration:

### Step 1: Open Supabase SQL Editor

Navigate to **SQL Editor** in your Supabase dashboard.

### Step 2: Execute Rollback SQL

1. Copy the entire contents of `supabase-rollback.sql`
2. Paste into the SQL Editor
3. Click **Run** to revert all column names to camelCase

### Step 3: Revert Adapter Changes

If you already updated the Supabase adapters, revert those code changes:

```bash
git checkout server/adapters/Supabase*.ts
```

## Affected Tables

The migration affects **89 tables** across all domains:

### Core Tables
- `users` (1 column: supabaseId → supabase_id)
- `conversations` (2 columns)
- `user_profiles` (10 columns)

### Budget & Finance Domain (14 tables)
- `budget_categories`, `budget_transactions`, `monthly_budget_summaries`
- `budget_alerts`, `financial_insights`, `budget_templates`
- `user_budget_templates`, `recurring_transactions`
- `shared_budgets`, `shared_budget_members`, `shared_budget_categories`
- `shared_budget_transactions`, `split_expenses`, `shared_budget_activity`

### Debt Coach Domain (6 tables)
- `debts`, `debt_payments`, `debt_milestones`
- `debt_strategies`, `coaching_sessions`, `debt_budget_snapshots`

### Learning Domain (20 tables)
- `learning_sessions`, `fact_check_results`, `learning_sources`
- `study_guides`, `quizzes`, `quiz_attempts`
- `vocabulary_items`, `user_vocabulary`, `grammar_lessons`
- `user_grammar_progress`, `language_exercises`, `exercise_attempts`
- `user_language_progress`, `daily_lessons`, `language_achievements`
- `topic_progress`, `topic_quiz_results`, `practice_sessions`
- `finance_articles`, `user_learning_progress`

### Goals Domain (3 tables)
- `financial_goals`, `goal_milestones`, `goal_progress_history`

### Math & Science Domain (8 tables)
- `math_problems`, `math_solutions`, `math_progress`
- `experiments`, `experiment_steps`, `user_lab_results`
- `science_progress`, `lab_quiz_questions`, `lab_quiz_attempts`

### Translation Domain (7 tables)
- `translation_categories`, `saved_translations`
- `conversation_sessions`, `conversation_messages`
- `translate_conversations`, `translate_conversation_participants`
- `translate_messages`, `translate_message_translations`

### IoT Domain (2 tables)
- `iot_devices`, `iot_command_history`

### Wellness Domain (15 tables)
- `workouts`, `user_workout_history`, `daily_activity_stats`
- `food_log`, `hydration_log`, `meditation_sessions`
- `mood_log`, `journal_entries`, `sleep_tracking`
- `health_metrics`, `wellbeing_reminders`
- `wearable_connections`, `wearable_sync_logs`, `wearable_data_cache`
- `wellness_profiles`, `wellness_goals`

### System & Admin Tables (13 tables)
- `notification_preferences`, `push_subscriptions`
- `verified_facts`, `fact_access_log`, `fact_update_notifications`
- `daily_usage`, `learning_tiers`, `financial_glossary`
- `learning_badges`, `user_learning_badges`, `hub_trials`
- `quota_usage`, `cleanup_logs`, `system_logs`
- `performance_metrics`, `error_logs`, `api_usage_logs`, `audit_logs`

## Common Column Renames

The most frequently renamed columns across all tables:

| Old Name (camelCase) | New Name (snake_case) | Occurrences |
|----------------------|----------------------|-------------|
| `userId` | `user_id` | 68 tables |
| `createdAt` | `created_at` | 42 tables |
| `updatedAt` | `updated_at` | 18 tables |
| `categoryId` | `category_id` | 8 tables |
| `isActive` | `is_active` | 7 tables |
| `targetDate` | `target_date` | 5 tables |
| `completedAt` | `completed_at` | 5 tables |

## Post-Migration Benefits

After completing this migration, you will have:

1. ✅ **Consistent naming convention** across all Supabase tables
2. ✅ **100% test pass rate** (resolves 34 failing tests)
3. ✅ **Simpler adapter implementations** (no manual column name mapping)
4. ✅ **Better PostgreSQL compatibility** (snake_case is the standard)
5. ✅ **Easier maintenance** (predictable column names)

## Troubleshooting

### Error: "column does not exist"

**Cause:** The column was already renamed or never existed in camelCase.

**Solution:** Comment out the failing ALTER TABLE statement and continue.

### Error: "relation does not exist"

**Cause:** The table doesn't exist in your Supabase database.

**Solution:** This is expected if you haven't created all tables yet. Comment out migrations for non-existent tables.

### Tests still failing after migration

**Cause:** Supabase adapters not updated to use snake_case.

**Solution:** Review Step 4 above and ensure all adapter files use snake_case column names.

## Support

If you encounter issues during migration:

1. **Check Supabase logs:** Dashboard → Logs → Database
2. **Review error messages:** Note which ALTER TABLE statement failed
3. **Restore from backup:** If needed, use Supabase's backup restoration feature
4. **Use rollback script:** Execute `supabase-rollback.sql` to revert changes

## Next Steps After Migration

1. ✅ Mark migration tasks as complete in `todo.md`
2. ✅ Run full test suite to verify 100% pass rate
3. ✅ Delete `dbRoleAware.ts` (4,282 lines) to complete refactoring
4. ✅ Document adapter architecture for future developers
5. ✅ Save checkpoint with migration completion message

---

**Generated:** Automatically from `drizzle/schema.ts`  
**Last Updated:** Current session  
**Migration Version:** 1.0.0
