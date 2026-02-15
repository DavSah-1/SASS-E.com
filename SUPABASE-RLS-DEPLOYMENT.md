# Supabase RLS Policies Deployment Guide

This guide explains how to apply Row Level Security (RLS) policies to your Supabase database to enforce user data isolation.

## Overview

The RLS policies in `supabase-rls-policies.sql` provide comprehensive security for 4 modules:

1. **Sharing Module** (5 tables)
   - `shared_budgets` - Shared budget management
   - `shared_budget_members` - Budget membership and permissions
   - `shared_budget_categories` - Shared budget categories
   - `shared_budget_transactions` - Shared budget transactions
   - `shared_budget_activity` - Activity audit logs

2. **Wearable Module** (3 tables)
   - `wearable_connections` - Device connections
   - `wearable_sync_logs` - Sync history
   - `wearable_data_cache` - Cached wearable data

3. **Alerts Module** (1 table)
   - `budget_alerts` - Budget alert notifications

4. **Recurring Module** (1 table)
   - `recurring_transactions` - Recurring transaction patterns

## Prerequisites

Before applying RLS policies, ensure:

1. ✅ All tables exist in your Supabase database
2. ✅ The `users` table has an `open_id` column that matches `auth.uid()`
3. ✅ You have admin access to Supabase SQL Editor

## Deployment Steps

### Step 1: Access Supabase SQL Editor

1. Log in to your Supabase dashboard
2. Navigate to **SQL Editor** in the left sidebar
3. Click **New Query**

### Step 2: Apply RLS Policies

1. Open the file `supabase-rls-policies.sql`
2. Copy the entire contents
3. Paste into the Supabase SQL Editor
4. Click **Run** to execute

**Expected Result**: All policies should be created successfully. You'll see success messages for each `ALTER TABLE` and `CREATE POLICY` statement.

### Step 3: Verify RLS is Active

Run these verification queries in the SQL Editor:

```sql
-- Check which tables have RLS enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN (
    'shared_budgets', 'shared_budget_members', 'shared_budget_categories',
    'shared_budget_transactions', 'shared_budget_activity',
    'wearable_connections', 'wearable_sync_logs', 'wearable_data_cache',
    'budget_alerts', 'recurring_transactions'
  );

-- Check all policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result**: 
- All 10 tables should have `rowsecurity = true`
- You should see multiple policies for each table

## Policy Summary

### Sharing Module Policies

**shared_budgets**:
- ✅ Users can view budgets they own or are members of
- ✅ Users can create new shared budgets
- ✅ Only owners can update/delete budgets

**shared_budget_members**:
- ✅ Users can view members of accessible budgets
- ✅ Owners can add/update/remove members
- ✅ Members can remove themselves

**shared_budget_categories**:
- ✅ All members can view categories
- ✅ Editors and admins can create/update categories
- ✅ Only owners can delete categories

**shared_budget_transactions**:
- ✅ All members can view transactions
- ✅ Editors and admins can create transactions
- ✅ Users can update their own transactions
- ✅ Owners can delete any transaction

**shared_budget_activity**:
- ✅ All members can view activity logs
- ❌ Users cannot modify activity logs (audit trail)

### Wearable Module Policies

**wearable_connections**:
- ✅ Users can only access their own connections
- ✅ Full CRUD permissions for own data

**wearable_sync_logs**:
- ✅ Users can view logs for their connections
- ❌ Users cannot modify logs (audit trail)

**wearable_data_cache**:
- ✅ Users can view cached data for their connections
- ❌ System-managed (no user write access)

### Alerts Module Policies

**budget_alerts**:
- ✅ Users can only access their own alerts
- ✅ Full CRUD permissions for own alerts

### Recurring Module Policies

**recurring_transactions**:
- ✅ Users can only access their own recurring transactions
- ✅ Full CRUD permissions for own data

## Testing RLS Policies

### Test 1: User Isolation

```sql
-- As User A (open_id = 'user-a-123')
SELECT * FROM budget_alerts;
-- Should only return alerts where user_id matches User A's numeric ID

-- As User B (open_id = 'user-b-456')
SELECT * FROM budget_alerts;
-- Should only return alerts where user_id matches User B's numeric ID
```

### Test 2: Shared Budget Access

```sql
-- As Budget Owner
SELECT * FROM shared_budgets WHERE owner_id = <your_user_id>;
-- Should return all budgets you own

-- As Budget Member
SELECT * FROM shared_budgets 
WHERE id IN (
  SELECT shared_budget_id 
  FROM shared_budget_members 
  WHERE user_id = <your_user_id>
);
-- Should return budgets you're a member of
```

### Test 3: Permission Levels

```sql
-- Try to update a budget you don't own
UPDATE shared_budgets 
SET name = 'Hacked Budget' 
WHERE owner_id != <your_user_id>;
-- Should fail with RLS violation

-- Try to view another user's wearable connections
SELECT * FROM wearable_connections 
WHERE user_id != <your_user_id>;
-- Should return 0 rows
```

## Rollback (If Needed)

If you need to remove RLS policies:

```sql
-- Disable RLS on all tables
ALTER TABLE shared_budgets DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE shared_budget_activity DISABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_connections DISABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_sync_logs DISABLE ROW LEVEL SECURITY;
ALTER TABLE wearable_data_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_alerts DISABLE ROW LEVEL SECURITY;
ALTER TABLE recurring_transactions DISABLE ROW LEVEL SECURITY;

-- Drop all policies (optional)
DROP POLICY IF EXISTS "Users can view their shared budgets" ON shared_budgets;
-- ... (drop each policy individually)
```

## Troubleshooting

### Issue: "relation does not exist"
**Solution**: Ensure all tables have been created in Supabase before applying RLS policies.

### Issue: "column does not exist"
**Solution**: Verify column names match between MySQL schema and Supabase schema. Run the migration scripts first.

### Issue: RLS blocks all access
**Solution**: Check that `auth.uid()` returns the correct `open_id` value. Verify the `users` table has the `open_id` column.

### Issue: Shared budgets not accessible to members
**Solution**: Ensure `shared_budget_members` table is populated correctly with `user_id` and `shared_budget_id`.

## Next Steps

After successfully applying RLS policies:

1. ✅ Test the application with regular user accounts
2. ✅ Verify admin users can still access MySQL database
3. ✅ Monitor Supabase logs for RLS violations
4. ✅ Update application code to handle RLS errors gracefully

## Security Best Practices

1. **Never disable RLS in production** - It's your primary defense against data leaks
2. **Test policies thoroughly** - Use multiple test accounts with different roles
3. **Monitor policy violations** - Set up alerts for RLS errors in Supabase
4. **Regular audits** - Review policies quarterly to ensure they match business requirements
5. **Principle of least privilege** - Grant minimum necessary permissions

## Support

If you encounter issues:
1. Check Supabase logs for detailed error messages
2. Verify user authentication is working correctly
3. Test policies in SQL Editor before deploying to production
4. Review the [Supabase RLS documentation](https://supabase.com/docs/guides/auth/row-level-security)

---

**Last Updated**: February 15, 2026  
**Version**: 1.0.0  
**Maintainer**: SASS-E Development Team
