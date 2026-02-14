# Comprehensive Issue Analysis - SASS-E Project

**Date:** February 14, 2026  
**Overall Test Pass Rate:** 248/302 passing (82.1%)  
**Target Pass Rate:** 98.7% (298/302 tests)  
**Gap:** 50 tests need to be fixed

---

## 🔴 CRITICAL ISSUES (Blocking Deployment)

### 1. TypeScript Compilation Errors (10 errors)
**Impact:** Prevents production build  
**Location:** `server/db.ts`, `server/dbRoleAware.ts`

#### Root Cause:
MySQL schema defines `userId` columns as `int()` (integer), but code is passing UUID strings after Supabase migration.

#### Affected Files:
- `server/db.ts` lines: 3423, 3487, 3498, 3554, 3600, 3609, 3632, 3657
- `server/dbRoleAware.ts` lines: 2885, 2934
- `drizzle/schema.ts` - MySQL schema definitions

#### Specific Errors:
```typescript
// Error 1: translate_conversation_participants.userId is int() but receiving string
server/db.ts(3423,64): No overload matches this call
  - Function expects: userId: number
  - Receiving: userId: string (UUID)

// Error 2: translate_message_translations.userId is int() but receiving string  
server/db.ts(3609,70): No overload matches this call
  - Function expects: userId: number
  - Receiving: userId: string (UUID)

// Error 3: dbRoleAware calling MySQL functions with string userId
server/dbRoleAware.ts(2885,67): Argument of type 'string' is not assignable to parameter of type 'number'
server/dbRoleAware.ts(2934,55): Argument of type 'string' is not assignable to parameter of type 'number'
```

#### Solution Required:
Update MySQL schema in `drizzle/schema.ts`:
```typescript
// Current (WRONG):
userId: int("userId").notNull()

// Should be:
userId: text("userId").notNull()
```

Then run `pnpm db:push` to apply schema changes and restart dev server to regenerate Drizzle types.

---

## 🟠 HIGH PRIORITY ISSUES (Affecting Core Features)

### 2. RLS Policy Enforcement Tests (9 failures / 19 tests)
**Impact:** User data isolation not properly tested  
**Pass Rate:** 10/19 (52.6%)  
**Location:** `server/__tests__/integration/rlsPolicyEnforcement.test.ts`

#### Root Cause:
Fundamental architecture mismatch between test expectations and Supabase RLS implementation:

1. **Test Design:** Tests create data with numeric user IDs (3000, 3001, 3002)
2. **Supabase Reality:** RLS policies enforce data access based on authenticated user's openId (UUID string like "rls-test-user-1")
3. **The Problem:** When data is inserted with `user_id: "3000"`, Supabase RLS overrides it to use the authenticated user's openId

#### Failing Tests:
1. ✗ should allow user to read their own budget categories
2. ✗ should allow user to create their own budget category  
3. ✗ should allow user to read their own goals
4. ✗ should allow user to create their own goal
5. ✗ should allow user to create their own debt
6. ✗ should allow user to save their own exercise attempt
7. ✗ should maintain complete isolation between 3 different users
8. ✗ should enforce userId matching in WHERE clauses
9. ✗ should enforce userId matching in INSERT operations

#### Example Error:
```javascript
// Test expects:
expect(created.userId).toBe(3000) // numeric ID

// But Supabase returns:
created.userId = "rls-test-user-1" // openId string

// Result: NaN when comparing parseInt("rls-test-user-1") === 3000
```

#### Solution Required:
**Option A (Recommended):** Update test assertions to use openIds:
```javascript
// Instead of:
expect(created.userId).toBe(user1Ctx.user.numericId) // 3000

// Use:
expect(created.userId).toBe(user1Ctx.user.id) // "rls-test-user-1"
```

**Option B:** Redesign Supabase schema to use numeric user IDs (major refactor, not recommended)

---

### 3. Supabase Schema Cache Issues (Multiple tests)
**Impact:** Database operations failing due to missing/renamed columns  
**Affected Tests:** 6+ failures

#### Missing/Misnamed Columns:
1. **exercise_attempts table:**
   - Missing: `is_correct` column
   - Error: "Could not find the 'is_correct' column in the schema cache"

2. **vocabulary_items table:**
   - Missing: `difficulty_level` column
   - Error: "column vocabulary_items.difficulty_level does not exist"

3. **coaching_sessions table:**
   - Missing: `message` column (NOT NULL constraint)
   - Error: "null value in column 'message' violates not-null constraint"

4. **debt_budget_snapshots table:**
   - Missing: `month_year` column (NOT NULL constraint)
   - Error: "null value in column 'month_year' violates not-null constraint"

5. **topic_progress table:**
   - Issue: `.single()` failing with "Cannot coerce the result to a single JSON object"
   - Likely cause: Multiple rows or no rows returned

#### Solution Required:
Run in Supabase SQL Editor:
```sql
-- 1. Add missing columns
ALTER TABLE exercise_attempts ADD COLUMN IF NOT EXISTS is_correct BOOLEAN DEFAULT false;
ALTER TABLE vocabulary_items ADD COLUMN IF NOT EXISTS difficulty_level VARCHAR(20);
ALTER TABLE coaching_sessions ADD COLUMN IF NOT EXISTS message TEXT;
ALTER TABLE debt_budget_snapshots ADD COLUMN IF NOT EXISTS month_year VARCHAR(7);

-- 2. Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');
```

---

## 🟡 MEDIUM PRIORITY ISSUES (Feature-Specific)

### 4. Debt Coach Tests (4 failures / 7 tests)
**Pass Rate:** 3/7 (42.9%)  
**Location:** `server/debtCoach.test.ts`

#### Failing Tests:
1. ✗ should update a debt
2. ✗ should save and retrieve budget snapshots  
3. ✗ should delete a debt (soft delete)
4. ✗ (one more unspecified)

#### Issues:
- `saveBudgetSnapshot`: Missing `month_year` column (see issue #3)
- `updateDebt`: Likely similar schema mismatch
- Soft delete: May be using wrong column name or RLS blocking update

---

### 5. Topic Learning Tests (3 failures / 5 tests)
**Pass Rate:** 2/5 (40%)  
**Location:** `server/topic-learning.test.ts`

#### Failing Tests:
1. ✗ should mark lesson as completed
   - Error: "Cannot coerce the result to a single JSON object"
   - Cause: `updateTopicProgress` using `.single()` but query returns 0 or multiple rows

2. ✗ should get topic progress
   - Similar `.single()` issue

3. ✗ should submit quiz and calculate score
   - Error: "numeric field overflow"
   - Cause: Trying to insert a number too large for the column type (likely score > 32767 for SMALLINT)

#### Solution Required:
```sql
-- Fix numeric overflow
ALTER TABLE quiz_results ALTER COLUMN score TYPE INTEGER;

-- Fix topic_progress queries
-- Check if using correct WHERE clause and table structure
```

---

### 6. Dual Database Routing Tests (3 failures)
**Location:** `server/__tests__/integration/dualDatabaseRouting.test.ts`

#### Failing Tests:
1. ✗ should route user getUserById to Supabase
2. ✗ should route user vocabulary queries to Supabase
   - Error: "column vocabulary_items.difficulty_level does not exist" (see issue #3)
3. ✗ should isolate admin data from user database
   - Same vocabulary column error

---

### 7. Dual Authentication Test (1 failure)
**Location:** `server/dual-auth.test.ts`

#### Failing Test:
✗ should verify Supabase user functions work

Likely related to schema cache or RLS policy issues.

---

### 8. Fact Notifications Test (1 failure)
**Location:** `server/factNotifications.test.ts`

#### Failing Test:
✗ should parse old and new versions correctly

Likely a parsing logic issue, not database-related.

---

### 9. Admin PIN Test (1 failure)
**Location:** `server/__tests__/adminPin.test.ts`

#### Failing Test:
✗ should be a valid bcrypt hash

Likely environment variable not set correctly for tests.

---

## 📊 SUMMARY BY CATEGORY

### Database Schema Issues (Highest Impact)
- **TypeScript errors:** 10 errors blocking build
- **Missing columns:** 4+ tables affected
- **Schema cache:** Needs refresh after fixes
- **Estimated fix time:** 2-3 hours

### Test Architecture Issues
- **RLS tests:** 9 failures due to UUID vs numeric ID mismatch
- **Dual-database routing:** 3 failures
- **Estimated fix time:** 3-4 hours

### Feature-Specific Bugs
- **Debt Coach:** 4 test failures
- **Topic Learning:** 3 test failures
- **Fact Notifications:** 1 test failure
- **Admin PIN:** 1 test failure
- **Estimated fix time:** 2-3 hours

---

## 🎯 RECOMMENDED FIX ORDER

### Phase 1: Database Schema (CRITICAL - Do First)
1. ✅ Update MySQL schema `userId` columns to `text()` in `drizzle/schema.ts`
2. ✅ Run `pnpm db:push` to apply changes
3. ✅ Add missing Supabase columns (is_correct, difficulty_level, message, month_year)
4. ✅ Refresh Supabase schema cache
5. ✅ Restart dev server to regenerate Drizzle types
6. ✅ Verify TypeScript errors are resolved

**Expected Result:** TypeScript builds successfully, ~10-15 test failures resolved

### Phase 2: RLS Test Fixes (HIGH PRIORITY)
1. ✅ Update all RLS test assertions to compare against `user.id` (openId) instead of `user.numericId`
2. ✅ Remove debug logging from test files
3. ✅ Verify all 19 RLS tests pass

**Expected Result:** 9 additional tests passing, RLS enforcement validated

### Phase 3: Feature-Specific Fixes (MEDIUM PRIORITY)
1. ✅ Fix topic learning numeric overflow (change column type)
2. ✅ Fix topic progress `.single()` queries
3. ✅ Fix debt coach missing columns
4. ✅ Fix vocabulary difficulty_level column
5. ✅ Fix admin PIN test environment variable

**Expected Result:** Remaining ~10 tests passing

### Phase 4: Final Validation
1. ✅ Run full test suite: `pnpm test`
2. ✅ Verify pass rate ≥ 98.7% (298/302 tests)
3. ✅ Run production build: `pnpm build`
4. ✅ Deploy to production

---

## 📈 PROGRESS TRACKING

| Milestone | Target | Current | Gap |
|-----------|--------|---------|-----|
| TypeScript Errors | 0 | 10 | -10 |
| Test Pass Rate | 98.7% | 82.1% | -16.6% |
| Tests Passing | 298/302 | 248/302 | -50 |
| RLS Tests | 19/19 | 10/19 | -9 |
| Debt Coach Tests | 7/7 | 3/7 | -4 |
| Topic Learning Tests | 5/5 | 2/5 | -3 |

---

## 🔧 TOOLS & COMMANDS

### Run Specific Test Suites
```bash
# RLS tests only
pnpm test rlsPolicyEnforcement.test.ts

# Debt coach tests only
pnpm test debtCoach.test.ts

# Topic learning tests only
pnpm test topic-learning.test.ts

# Full test suite
pnpm test
```

### Database Operations
```bash
# Push MySQL schema changes
pnpm db:push

# Restart dev server (regenerates types)
# Use webdev_restart_server tool
```

### Supabase SQL Commands
```sql
-- Refresh schema cache
SELECT pg_notify('pgrst', 'reload schema');

-- Check column existence
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'exercise_attempts';
```

---

## 💡 NOTES

1. **UUID Migration Completed:** Translate chat system successfully migrated to UUID (8/8 tests passing)
2. **Dual Database Working:** Admin (MySQL) and User (Supabase) routing functional
3. **Main Blocker:** TypeScript schema type mismatch preventing build
4. **Quick Win:** Fixing schema issues will resolve ~40% of remaining failures

---

**Last Updated:** February 14, 2026 09:15 AM GMT  
**Next Review:** After Phase 1 completion
