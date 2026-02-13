# Manual RLS Verification Guide

This guide will help you verify that Row Level Security (RLS) is properly enforced in your production application.

## Prerequisites

Before starting, ensure:
- ✅ Application is deployed to production
- ✅ Supabase RLS policies are enabled on all tables
- ✅ You have access to create test user accounts
- ✅ You can access the application in two different browsers (or incognito windows)

## Step-by-Step Verification Process

### Step 1: Enable RLS Policies in Supabase

1. Go to **Supabase Dashboard** → **Authentication** → **Policies**
2. For each table, verify RLS is **enabled** (toggle should be ON)
3. Check that policies exist for all operations (SELECT, INSERT, UPDATE, DELETE)

**Tables to verify:**
- `budget_categories`
- `financial_goals`
- `debts`
- `conversations`
- `user_vocabulary`
- `exercise_attempts`

**Example policy for `budget_categories`:**
```sql
-- SELECT policy: Users can only see their own categories
CREATE POLICY "Users can view own budget categories"
ON budget_categories FOR SELECT
USING (auth.uid()::text = user_id::text);

-- INSERT policy: Users can only create categories for themselves
CREATE POLICY "Users can create own budget categories"
ON budget_categories FOR INSERT
WITH CHECK (auth.uid()::text = user_id::text);

-- UPDATE policy: Users can only update their own categories
CREATE POLICY "Users can update own budget categories"
ON budget_categories FOR UPDATE
USING (auth.uid()::text = user_id::text);

-- DELETE policy: Users can only delete their own categories
CREATE POLICY "Users can delete own budget categories"
ON budget_categories FOR DELETE
USING (auth.uid()::text = user_id::text);
```

### Step 2: Create Two Test User Accounts

**Option A: Through Application UI**
1. Open your application in Browser 1
2. Sign up as `testuser1@example.com`
3. Open your application in Browser 2 (or incognito)
4. Sign up as `testuser2@example.com`

**Option B: Through Supabase Dashboard**
1. Go to **Supabase Dashboard** → **Authentication** → **Users**
2. Click **Add User** → **Create new user**
3. Create user: `testuser1@example.com` / `TestPass123!`
4. Create user: `testuser2@example.com` / `TestPass123!`

### Step 3: Test Data Isolation

#### Test 3.1: Budget Categories Isolation

**As User 1:**
1. Log in as `testuser1@example.com`
2. Navigate to Money Hub → Budget Categories
3. Create a category: "User 1 Groceries" with budget $500
4. Create a category: "User 1 Rent" with budget $1500
5. Note: You should see **only 2 categories** (the ones you just created)

**As User 2:**
1. Log in as `testuser2@example.com` (in different browser/incognito)
2. Navigate to Money Hub → Budget Categories
3. Create a category: "User 2 Entertainment" with budget $200
4. **Expected Result:** You should see **only 1 category** (User 2 Entertainment)
5. **Expected Result:** You should **NOT** see User 1's categories (Groceries, Rent)

**✅ PASS:** Each user sees only their own categories
**❌ FAIL:** User 2 can see User 1's categories → RLS not working

#### Test 3.2: Financial Goals Isolation

**As User 1:**
1. Navigate to Money Hub → Financial Goals
2. Create a goal: "Save for vacation" - $5000 target
3. Note the goal ID or name

**As User 2:**
1. Navigate to Money Hub → Financial Goals
2. **Expected Result:** You should **NOT** see User 1's "Save for vacation" goal
3. Create your own goal: "Emergency fund" - $10000 target
4. **Expected Result:** You should see only your own goal

**✅ PASS:** Each user sees only their own goals
**❌ FAIL:** User 2 can see User 1's goals → RLS not working

#### Test 3.3: Conversation History Isolation

**As User 1:**
1. Start a conversation with the AI assistant
2. Ask: "What's the weather today?"
3. Note the conversation ID

**As User 2:**
1. Navigate to conversation history
2. **Expected Result:** You should **NOT** see User 1's conversation
3. Start your own conversation
4. **Expected Result:** You should see only your own conversations

**✅ PASS:** Each user sees only their own conversations
**❌ FAIL:** User 2 can see User 1's conversations → RLS not working

### Step 4: Test Data Modification Protection

#### Test 4.1: Attempt to Modify Another User's Data

This test requires using browser developer tools or API testing tools like Postman.

**Setup:**
1. As User 1, create a budget category and note its ID
2. As User 2, try to update User 1's category using the API

**Using Browser DevTools:**
1. Log in as User 2
2. Open Browser DevTools (F12) → Network tab
3. Try to update a category (any category)
4. Copy the request as cURL
5. Modify the request to use User 1's category ID
6. Send the modified request

**Expected Result:** 
- ❌ Request should **fail** with 403 Forbidden or return no rows
- ✅ User 1's data should remain unchanged

**If the request succeeds:** RLS is not properly configured!

### Step 5: Verify RLS in Database Directly

**Using Supabase SQL Editor:**

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Run this query to check RLS is enabled:

```sql
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('budget_categories', 'financial_goals', 'debts', 'conversations');
```

**Expected Result:** `rowsecurity` should be `true` for all tables

3. Check existing policies:

```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, policyname;
```

**Expected Result:** Each table should have at least 4 policies (SELECT, INSERT, UPDATE, DELETE)

## Common Issues and Troubleshooting

### Issue 1: Users Can See Each Other's Data

**Symptoms:**
- User 2 sees User 1's budget categories
- Conversation history shows all users' conversations

**Possible Causes:**
1. RLS not enabled on the table
2. RLS policies missing or incorrect
3. Application using service key instead of user tokens

**Fix:**
1. Enable RLS: `ALTER TABLE budget_categories ENABLE ROW LEVEL SECURITY;`
2. Add policies (see Step 1 examples)
3. Verify `getSupabaseClient()` is using user access tokens, not service key

### Issue 2: Users Cannot See Their Own Data

**Symptoms:**
- User creates data but cannot see it
- Empty lists even though data exists

**Possible Causes:**
1. RLS policy too restrictive
2. User ID mismatch (string vs integer)
3. Policy using wrong column name

**Fix:**
1. Check policy condition: `auth.uid()::text = user_id::text`
2. Verify `user_id` column exists and is populated correctly
3. Test policy in SQL Editor with specific user context

### Issue 3: INSERT/UPDATE Operations Fail

**Symptoms:**
- "Permission denied" errors
- "New row violates row-level security policy"

**Possible Causes:**
1. Missing INSERT/UPDATE policies
2. Policy WITH CHECK condition too restrictive
3. Trying to set user_id to different user

**Fix:**
1. Add INSERT policy with `WITH CHECK (auth.uid()::text = user_id::text)`
2. Ensure application sets `user_id` to current user's ID
3. Check policy allows the operation

### Issue 4: Policies Not Taking Effect

**Symptoms:**
- Policies exist but RLS still not working
- Changes to policies don't seem to apply

**Possible Causes:**
1. PostgREST cache not refreshed
2. Application still using cached client
3. Service key being used instead of user token

**Fix:**
1. Refresh schema cache: `SELECT pg_notify('pgrst', 'reload schema');`
2. Restart application server
3. Verify access token in request headers

## Verification Checklist

Use this checklist to ensure RLS is properly configured:

### Database Configuration
- [ ] RLS enabled on all user data tables
- [ ] SELECT policies exist for all tables
- [ ] INSERT policies exist for all tables
- [ ] UPDATE policies exist for all tables
- [ ] DELETE policies exist for all tables
- [ ] Policies use correct user ID column
- [ ] Policies handle type casting (string vs integer)

### Application Configuration
- [ ] `getSupabaseClient()` uses user access tokens
- [ ] Service key only used for admin operations
- [ ] tRPC context includes `accessToken`
- [ ] User ID correctly passed to database operations

### Manual Testing
- [ ] Created two test user accounts
- [ ] User 1 cannot see User 2's data
- [ ] User 2 cannot see User 1's data
- [ ] Users can create their own data
- [ ] Users can update their own data
- [ ] Users can delete their own data
- [ ] Users cannot modify other users' data

### Production Monitoring
- [ ] Monitor Supabase logs for RLS violations
- [ ] Set up alerts for unauthorized access attempts
- [ ] Regular security audits of RLS policies
- [ ] Test RLS after any schema changes

## Next Steps

After verifying RLS is working:

1. **Document your RLS policies** - Keep a record of all policies for each table
2. **Set up monitoring** - Track any RLS policy violations in production
3. **Regular testing** - Re-verify RLS after major updates or schema changes
4. **User feedback** - Monitor for any reports of users seeing others' data

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Documentation](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Testing RLS Policies](https://supabase.com/docs/guides/auth/row-level-security#testing-policies)
