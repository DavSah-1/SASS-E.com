#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;

const USER_A_EMAIL = 'user_a@test.com';
const USER_A_PASSWORD = 'TestPassword123!';
const USER_B_EMAIL = 'user_b@test.com';
const USER_B_PASSWORD = 'TestPassword123!';

const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('🚀 Simple RLS Test\n');

// Create test users
console.log('📝 Creating test users...');
try {
  await adminClient.auth.admin.createUser({
    email: USER_A_EMAIL,
    password: USER_A_PASSWORD,
    email_confirm: true
  });
} catch (e) {
  if (!e.message?.includes('already')) console.log('  User A exists');
}

try {
  await adminClient.auth.admin.createUser({
    email: USER_B_EMAIL,
    password: USER_B_PASSWORD,
    email_confirm: true
  });
} catch (e) {
  if (!e.message?.includes('already')) console.log('  User B exists');
}

console.log('✅ Test users ready\n');

// Test 1: User isolation
console.log('📋 TEST 1: User Isolation');
const { data: { session: sessionA } } = await anonClient.auth.signInWithPassword({
  email: USER_A_EMAIL,
  password: USER_A_PASSWORD
});

const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
});

// User A creates a conversation
const { data: convA, error: errA } = await clientA
  .from('conversations')
  .insert({
    user_id: sessionA.user.id,
    user_message: 'User A private message',
    assistant_response: 'Response to User A'
  })
  .select()
  .single();

if (convA) {
  console.log(`✅ User A created conversation ID: ${convA.id}`);
} else {
  console.log(`❌ User A failed to create: ${errA?.message}`);
}

// User B tries to see User A's conversation
await anonClient.auth.signOut();
const { data: { session: sessionB } } = await anonClient.auth.signInWithPassword({
  email: USER_B_EMAIL,
  password: USER_B_PASSWORD
});

const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
});

const { data: convB } = await clientB
  .from('conversations')
  .select('*')
  .eq('id', convA?.id || 0);

if (convB && convB.length === 0) {
  console.log('✅ User B cannot see User A\'s conversation (RLS working!)');
} else {
  console.log(`❌ User B can see User A's conversation (RLS FAILED!)`);
}

// Cleanup
if (convA) {
  await adminClient.from('conversations').delete().eq('id', convA.id);
}

console.log('\n✅ RLS test complete!');
process.exit(0);
