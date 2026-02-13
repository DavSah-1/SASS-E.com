-- Fix RLS Infinite Recursion in translate_conversations table
-- Run this in Supabase SQL Editor

-- Step 1: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can insert their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can update their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Users can delete their conversations" ON translate_conversations;
DROP POLICY IF EXISTS "Service role has full access" ON translate_conversations;

-- Step 2: Create simplified, non-recursive policies

-- SELECT policy: Users can view conversations they own
CREATE POLICY "Users can view their conversations" 
ON translate_conversations FOR SELECT 
USING (auth.uid()::text = user_id);

-- INSERT policy: Users can create conversations for themselves
CREATE POLICY "Users can insert their conversations" 
ON translate_conversations FOR INSERT 
WITH CHECK (auth.uid()::text = user_id);

-- UPDATE policy: Users can update their own conversations
CREATE POLICY "Users can update their conversations" 
ON translate_conversations FOR UPDATE 
USING (auth.uid()::text = user_id)
WITH CHECK (auth.uid()::text = user_id);

-- DELETE policy: Users can delete their own conversations
CREATE POLICY "Users can delete their conversations" 
ON translate_conversations FOR DELETE 
USING (auth.uid()::text = user_id);

-- Service role policy: Admin/service role can do everything (for tests and admin operations)
CREATE POLICY "Service role has full access" 
ON translate_conversations 
FOR ALL 
USING (auth.jwt()->>'role' = 'service_role');

-- Step 3: Verify policies are correct
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'translate_conversations'
ORDER BY policyname;
