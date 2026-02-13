# RLS Testing Quick Start Guide

## TL;DR - 5 Minute RLS Check

### Option 1: Automated Script (Recommended)

```bash
# Run the automated RLS verification script
cd /home/ubuntu/sarcastic-ai-assistant
pnpm tsx scripts/verify-rls.ts
```

**Expected Output:**
```
✅ User 1 Create Category: Created category: User 1 Test Category
✅ RLS Isolation Check: User 2 cannot see User 1's categories - RLS WORKING!
✅ Cross-User Update Protection: User 2 cannot update User 1's category - RLS WORKING!
✅ Goal Isolation Check: User 2 cannot see User 1's goals - RLS WORKING!

Success Rate: 100%
✅ All RLS tests passed! Your data is properly isolated.
```

### Option 2: Manual Testing (5 minutes)

1. **Open two browsers** (Chrome + Firefox, or Chrome + Incognito)
2. **Browser 1:** Sign up as `test1@example.com`
3. **Browser 1:** Create a budget category "Test Category 1"
4. **Browser 2:** Sign up as `test2@example.com`
5. **Browser 2:** Go to budget categories
6. **Expected:** You should NOT see "Test Category 1"

✅ **PASS:** RLS is working
❌ **FAIL:** RLS is broken - see troubleshooting below

## Common Test Results

### ✅ RLS Working Correctly

**Symptoms:**
- Each user sees only their own data
- Users cannot modify other users' data
- Empty lists when no data created yet

**What this means:**
- Your application is secure
- Data is properly isolated
- No further action needed

### ❌ RLS Not Working

**Symptoms:**
- User 2 sees User 1's categories/goals/conversations
- Users can modify each other's data
- All users see the same data

**Immediate Actions:**
1. Check if RLS is enabled on tables (see below)
2. Verify RLS policies exist
3. Ensure application uses user tokens, not service key

## Enable RLS Policies (If Missing)

### Step 1: Enable RLS on Tables

Run this in **Supabase SQL Editor**:

```sql
-- Enable RLS on all user data tables
ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE financial_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE debts ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_attempts ENABLE ROW LEVEL SECURITY;
```

### Step 2: Create RLS Policies

```sql
-- Budget Categories Policies
CREATE POLICY "Users can view own budget categories"
ON budget_categories FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own budget categories"
ON budget_categories FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own budget categories"
ON budget_categories FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own budget categories"
ON budget_categories FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Financial Goals Policies
CREATE POLICY "Users can view own financial goals"
ON financial_goals FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own financial goals"
ON financial_goals FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own financial goals"
ON financial_goals FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own financial goals"
ON financial_goals FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Debts Policies
CREATE POLICY "Users can view own debts"
ON debts FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own debts"
ON debts FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own debts"
ON debts FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own debts"
ON debts FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Conversations Policies
CREATE POLICY "Users can view own conversations"
ON conversations FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own conversations"
ON conversations FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own conversations"
ON conversations FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own conversations"
ON conversations FOR DELETE
USING (auth.uid()::text = user_id::text);

-- User Vocabulary Policies
CREATE POLICY "Users can view own vocabulary"
ON user_vocabulary FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own vocabulary"
ON user_vocabulary FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own vocabulary"
ON user_vocabulary FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own vocabulary"
ON user_vocabulary FOR DELETE
USING (auth.uid()::text = user_id::text);

-- Exercise Attempts Policies
CREATE POLICY "Users can view own exercise attempts"
ON exercise_attempts FOR SELECT
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can create own exercise attempts"
ON exercise_attempts FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "Users can update own exercise attempts"
ON exercise_attempts FOR UPDATE
USING (auth.uid()::text = user_id::text);

CREATE POLICY "Users can delete own exercise attempts"
ON exercise_attempts FOR DELETE
USING (auth.uid()::text = user_id::text);
```

### Step 3: Refresh Schema Cache

```sql
SELECT pg_notify('pgrst', 'reload schema');
```

### Step 4: Re-run Tests

```bash
pnpm tsx scripts/verify-rls.ts
```

## Troubleshooting

### Issue: "User 2 can see User 1's data"

**Fix:**
1. Verify RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'budget_categories';`
2. Check policies exist: `SELECT * FROM pg_policies WHERE tablename = 'budget_categories';`
3. Refresh schema cache: `SELECT pg_notify('pgrst', 'reload schema');`

### Issue: "Users cannot see their own data"

**Fix:**
1. Check user_id column is populated correctly
2. Verify policy condition: `auth.uid()::text = user_id::text`
3. Check if user_id is UUID string or integer (adjust policy accordingly)

### Issue: "Permission denied on INSERT"

**Fix:**
1. Verify INSERT policy exists with `WITH CHECK` clause
2. Ensure application sets user_id to current user
3. Check policy allows the operation

## Next Steps

After RLS is verified:

1. ✅ **Document policies** - Keep record of all RLS policies
2. ✅ **Set up monitoring** - Track RLS violations in Supabase logs
3. ✅ **Regular testing** - Re-test after schema changes
4. ✅ **User feedback** - Monitor for any data leakage reports

## Additional Resources

- **Detailed Guide:** `docs/RLS-MANUAL-VERIFICATION.md`
- **Testing Guide:** `docs/RLS-TESTING.md`
- **Supabase Docs:** https://supabase.com/docs/guides/auth/row-level-security
