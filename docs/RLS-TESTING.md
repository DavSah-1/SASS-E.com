# Row Level Security (RLS) Testing

## Overview

This project uses Supabase Row Level Security (RLS) to enforce data isolation between users. RLS policies are defined in Supabase and automatically enforced when using real user authentication tokens.

## Test Environment Behavior

**Important:** Unit tests in this project use the Supabase service key, which **bypasses RLS**. This is a pragmatic approach that allows testing database operations without requiring complex authentication setup.

### Why Tests Bypass RLS

1. **Simplicity**: Creating real Supabase Auth users for each test adds significant complexity
2. **Speed**: Service key authentication is faster than creating/deleting real users
3. **Reliability**: Tests don't depend on external auth services
4. **Common Practice**: Many production applications test RLS in staging/production environments

### What This Means

- ✅ Tests verify database operations work correctly
- ✅ Tests verify data transformations and business logic
- ✅ Tests verify dual-database routing (admin vs user)
- ❌ Tests do NOT verify RLS policy enforcement
- ❌ Tests do NOT verify data isolation between users

## Production Behavior

In production, RLS **IS enforced** because:

1. Real users authenticate through Supabase Auth
2. Each request includes a real JWT token (not the service key)
3. Supabase automatically enforces RLS policies based on the token
4. Users can only access their own data

## How RLS Works in Production

```typescript
// In production, the tRPC context includes a real user token
const supabase = await getSupabaseClient(ctx.user.id, ctx.accessToken);

// This query will ONLY return the current user's data
const { data } = await supabase
  .from('budget_categories')
  .select('*');
// Returns only rows where user_id = current user's ID
```

## Testing RLS Manually

To verify RLS is working correctly:

### Option 1: Manual Testing in Production

1. Create two test user accounts
2. Log in as User A and create some data
3. Log in as User B and verify you cannot see User A's data
4. Try to modify User A's data as User B (should fail)

### Option 2: Integration Tests with Real Auth

If you need automated RLS testing, you can:

1. Create a separate test suite that uses real Supabase Auth
2. Use `supabase.auth.signUp()` to create test users
3. Use the returned JWT tokens for testing
4. Clean up test users after tests complete

Example:
```typescript
// Create real test user
const { data: { user }, error } = await supabase.auth.signUp({
  email: 'test@example.com',
  password: 'test-password-123'
});

// Get their JWT token
const { data: { session } } = await supabase.auth.getSession();
const accessToken = session.access_token;

// Use this token for RLS-enforced queries
const client = await getSupabaseClient(user.id, accessToken);
```

### Option 3: Staging Environment Testing

1. Deploy to a staging environment
2. Use real user accounts for testing
3. Verify RLS policies work as expected
4. Monitor Supabase logs for any RLS violations

## RLS Policy Checklist

Ensure these RLS policies are enabled in Supabase:

### Budget Categories
- ✅ SELECT: Users can only see their own categories (`user_id = auth.uid()`)
- ✅ INSERT: Users can only create categories for themselves
- ✅ UPDATE: Users can only update their own categories
- ✅ DELETE: Users can only delete their own categories

### Financial Goals
- ✅ SELECT: Users can only see their own goals
- ✅ INSERT: Users can only create goals for themselves
- ✅ UPDATE: Users can only update their own goals
- ✅ DELETE: Users can only delete their own goals

### Debts
- ✅ SELECT: Users can only see their own debts
- ✅ INSERT: Users can only create debts for themselves
- ✅ UPDATE: Users can only update their own debts
- ✅ DELETE: Users can only delete their own debts

### Conversations
- ✅ SELECT: Users can only see their own conversations
- ✅ INSERT: Users can only create conversations for themselves
- ✅ UPDATE: Users can only update their own conversations
- ✅ DELETE: Users can only delete their own conversations

### User Vocabulary
- ✅ SELECT: Users can only see their own vocabulary progress
- ✅ INSERT: Users can only create vocabulary records for themselves
- ✅ UPDATE: Users can only update their own vocabulary records
- ✅ DELETE: Users can only delete their own vocabulary records

## Verifying RLS Policies in Supabase

1. Go to Supabase Dashboard → Authentication → Policies
2. Check each table has RLS enabled
3. Verify policies exist for SELECT, INSERT, UPDATE, DELETE
4. Test policies using the Supabase SQL Editor with different user contexts

## Common RLS Issues

### Issue: Users can see other users' data
**Cause**: RLS policies not enabled or incorrectly configured
**Fix**: Enable RLS on the table and add proper policies

### Issue: Users cannot see their own data
**Cause**: RLS policy too restrictive or using wrong user ID field
**Fix**: Verify the policy uses the correct user ID column

### Issue: INSERT/UPDATE fails with permission denied
**Cause**: Missing INSERT/UPDATE policies
**Fix**: Add policies that allow users to modify their own data

## Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [Testing RLS Policies](https://supabase.com/docs/guides/auth/row-level-security#testing-policies)
- [Common RLS Patterns](https://supabase.com/docs/guides/auth/row-level-security#common-patterns)
