#!/usr/bin/env node

/**
 * SASS-E RLS Policy Testing Script
 * 
 * This script tests Row Level Security policies by simulating different users
 * and verifying data isolation works correctly.
 * 
 * Prerequisites:
 * 1. Create 3 test users in Supabase Auth:
 *    - user_a@test.com (regular user)
 *    - user_b@test.com (regular user)  
 *    - admin@test.com (admin user)
 * 2. Set environment variables:
 *    - SUPABASE_URL
 *    - SUPABASE_SERVICE_KEY (for admin operations)
 *    - USER_A_EMAIL and USER_A_PASSWORD
 *    - USER_B_EMAIL and USER_B_PASSWORD
 *    - ADMIN_EMAIL and ADMIN_PASSWORD
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

// Test user credentials (you'll need to create these in Supabase Auth)
const USER_A_EMAIL = 'user_a@test.com';
const USER_A_PASSWORD = 'TestPassword123!';
const USER_B_EMAIL = 'user_b@test.com';
const USER_B_PASSWORD = 'TestPassword123!';
const ADMIN_EMAIL = 'admin@test.com';
const ADMIN_PASSWORD = 'AdminPassword123!';

// Create admin client (bypasses RLS)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Create regular client (enforces RLS)
const anonClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Test results tracker
const results = {
  passed: 0,
  failed: 0,
  tests: []
};

function logTest(name, passed, message) {
  const status = passed ? '✅ PASS' : '❌ FAIL';
  console.log(`${status}: ${name}`);
  if (message) console.log(`   ${message}`);
  
  results.tests.push({ name, passed, message });
  if (passed) results.passed++;
  else results.failed++;
}

async function setupTestUsers() {
  console.log('\n🔧 Setting up test users...\n');
  
  try {
    // Create User A
    const { data: userA, error: errorA } = await adminClient.auth.admin.createUser({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD,
      email_confirm: true
    });
    
    if (errorA && !errorA.message.includes('already registered')) {
      throw errorA;
    }
    
    // Create User B
    const { data: userB, error: errorB } = await adminClient.auth.admin.createUser({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD,
      email_confirm: true
    });
    
    if (errorB && !errorB.message.includes('already registered')) {
      throw errorB;
    }
    
    // Create Admin
    const { data: admin, error: errorAdmin } = await adminClient.auth.admin.createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      email_confirm: true
    });
    
    if (errorAdmin && !errorAdmin.message.includes('already registered')) {
      throw errorAdmin;
    }
    
    // Insert/update users in database with correct roles
    if (userA?.user) {
      await adminClient.from('users').upsert({
        id: userA.user.id,
        open_id: `test_user_a_${userA.user.id}`,
        email: USER_A_EMAIL,
        name: 'Test User A',
        role: 'user'
      });
    }
    
    if (userB?.user) {
      await adminClient.from('users').upsert({
        id: userB.user.id,
        open_id: `test_user_b_${userB.user.id}`,
        email: USER_B_EMAIL,
        name: 'Test User B',
        role: 'user'
      });
    }
    
    if (admin?.user) {
      await adminClient.from('users').upsert({
        id: admin.user.id,
        open_id: `test_admin_${admin.user.id}`,
        email: ADMIN_EMAIL,
        name: 'Test Admin',
        role: 'admin'
      });
    }
    
    console.log('✅ Test users created/verified\n');
    return true;
  } catch (error) {
    console.error('❌ Failed to setup test users:', error.message);
    return false;
  }
}

async function test1_UserIsolation() {
  console.log('\n📋 TEST 1: User A cannot see User B\'s conversations\n');
  
  try {
    // Login as User A
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    // User A creates a conversation
    const { data: convA, error: createError } = await clientA
      .from('conversations')
      .insert({
        user_id: sessionA.user.id,
        title: 'User A Private Conversation',
        context: 'This is private to User A',
        status: 'active'
      })
      .select()
      .single();
    
    if (createError) throw createError;
    
    logTest('User A can create conversation', !!convA, `Created conversation ID: ${convA.id}`);
    
    // Login as User B
    await anonClient.auth.signOut();
    const { data: { session: sessionB }, error: errorB } = await anonClient.auth.signInWithPassword({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD
    });
    
    if (errorB) throw errorB;
    
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
    });
    
    // User B tries to see User A's conversation
    const { data: convB, error: queryError } = await clientB
      .from('conversations')
      .select('*')
      .eq('id', convA.id);
    
    logTest('User B cannot see User A\'s conversation', convB.length === 0, 
      `User B sees ${convB.length} conversations (expected 0)`);
    
    // User B can only see their own conversations
    const { data: ownConvs } = await clientB
      .from('conversations')
      .select('*')
      .eq('user_id', sessionB.user.id);
    
    logTest('User B can see own conversations', true, 
      `User B sees ${ownConvs.length} of their own conversations`);
    
    // Cleanup
    await adminClient.from('conversations').delete().eq('id', convA.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('User isolation test', false, `Error: ${error.message}`);
  }
}

async function test2_FinancialDataIsolation() {
  console.log('\n📋 TEST 2: User A cannot see User B\'s financial data\n');
  
  try {
    // Login as User B
    const { data: { session: sessionB }, error: errorB } = await anonClient.auth.signInWithPassword({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD
    });
    
    if (errorB) throw errorB;
    
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
    });
    
    // User B creates financial data
    const { data: debt, error: debtError } = await clientB
      .from('debts')
      .insert({
        user_id: sessionB.user.id,
        name: 'User B Credit Card',
        amount: 5000.00,
        interest_rate: 18.5,
        status: 'active'
      })
      .select()
      .single();
    
    if (debtError) throw debtError;
    
    logTest('User B can create debt', !!debt, `Created debt ID: ${debt.id}`);
    
    // Login as User A
    await anonClient.auth.signOut();
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    // User A tries to see User B's debt
    const { data: debtA, error: queryError } = await clientA
      .from('debts')
      .select('*')
      .eq('id', debt.id);
    
    logTest('User A cannot see User B\'s debt', debtA.length === 0,
      `User A sees ${debtA.length} debts (expected 0)`);
    
    // Cleanup
    await adminClient.from('debts').delete().eq('id', debt.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('Financial data isolation test', false, `Error: ${error.message}`);
  }
}

async function test3_SharedBudgetAccess() {
  console.log('\n📋 TEST 3: Shared budget members can access shared data\n');
  
  try {
    // Login as User A
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    // User A creates shared budget
    const { data: budget, error: budgetError } = await clientA
      .from('shared_budgets')
      .insert({
        created_by: sessionA.user.id,
        name: 'Test Family Budget',
        description: 'Testing shared access',
        currency: 'USD',
        status: 'active'
      })
      .select()
      .single();
    
    if (budgetError) throw budgetError;
    
    logTest('User A can create shared budget', !!budget, `Created budget ID: ${budget.id}`);
    
    // Get User B's ID
    const { data: { session: sessionB }, error: errorB } = await anonClient.auth.signInWithPassword({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD
    });
    
    if (errorB) throw errorB;
    
    // User A adds User B as member (need to switch back to User A)
    await anonClient.auth.signOut();
    await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    const { data: member, error: memberError } = await clientA
      .from('shared_budget_members')
      .insert({
        shared_budget_id: budget.id,
        user_id: sessionB.user.id,
        role: 'editor',
        status: 'active'
      })
      .select()
      .single();
    
    if (memberError) throw memberError;
    
    logTest('User A can add User B as member', !!member, 'User B added as editor');
    
    // Login as User B
    await anonClient.auth.signOut();
    await anonClient.auth.signInWithPassword({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD
    });
    
    const clientB = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionB.access_token}` } }
    });
    
    // User B should see the shared budget
    const { data: budgetB, error: queryError } = await clientB
      .from('shared_budgets')
      .select('*')
      .eq('id', budget.id);
    
    logTest('User B can see shared budget', budgetB.length === 1,
      `User B sees ${budgetB.length} shared budget (expected 1)`);
    
    // Cleanup
    await adminClient.from('shared_budget_members').delete().eq('shared_budget_id', budget.id);
    await adminClient.from('shared_budgets').delete().eq('id', budget.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('Shared budget access test', false, `Error: ${error.message}`);
  }
}

async function test4_PublicContentAccess() {
  console.log('\n📋 TEST 4: Public content is readable by all\n');
  
  try {
    // Admin creates public content
    const { data: workout, error: workoutError } = await adminClient
      .from('workouts')
      .insert({
        name: 'Test Morning Yoga',
        description: 'Testing public access',
        difficulty: 'beginner',
        duration_minutes: 30,
        category: 'flexibility'
      })
      .select()
      .single();
    
    if (workoutError) throw workoutError;
    
    logTest('Admin can create public workout', !!workout, `Created workout ID: ${workout.id}`);
    
    // Login as User A (regular user)
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    // User A should be able to read public workout
    const { data: workoutA, error: queryError } = await clientA
      .from('workouts')
      .select('*')
      .eq('id', workout.id);
    
    logTest('User A can read public workout', workoutA.length === 1,
      `User A sees ${workoutA.length} workout (expected 1)`);
    
    // User A should NOT be able to modify public workout
    const { error: updateError } = await clientA
      .from('workouts')
      .update({ name: 'Modified Yoga' })
      .eq('id', workout.id);
    
    logTest('User A cannot modify public workout', !!updateError,
      `Update blocked: ${updateError?.message || 'No error (unexpected)'}`);
    
    // Cleanup
    await adminClient.from('workouts').delete().eq('id', workout.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('Public content access test', false, `Error: ${error.message}`);
  }
}

async function test5_AdminAccess() {
  console.log('\n📋 TEST 5: Admins can access all data\n');
  
  try {
    // Create test data as User A
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    const { data: conv, error: convError } = await clientA
      .from('conversations')
      .insert({
        user_id: sessionA.user.id,
        title: 'User A Conversation for Admin Test',
        context: 'Testing admin access',
        status: 'active'
      })
      .select()
      .single();
    
    if (convError) throw convError;
    
    // Login as Admin
    await anonClient.auth.signOut();
    const { data: { session: sessionAdmin }, error: errorAdmin } = await anonClient.auth.signInWithPassword({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD
    });
    
    if (errorAdmin) throw errorAdmin;
    
    const clientAdmin = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionAdmin.access_token}` } }
    });
    
    // Admin should see User A's conversation
    const { data: convAdmin, error: queryError } = await clientAdmin
      .from('conversations')
      .select('*')
      .eq('id', conv.id);
    
    logTest('Admin can see User A\'s conversation', convAdmin.length === 1,
      `Admin sees ${convAdmin.length} conversation (expected 1)`);
    
    // Admin should be able to modify User A's conversation
    const { data: updated, error: updateError } = await clientAdmin
      .from('conversations')
      .update({ title: 'Admin Modified Title' })
      .eq('id', conv.id)
      .select()
      .single();
    
    logTest('Admin can modify User A\'s conversation', !!updated && !updateError,
      `Updated title: ${updated?.title || 'Failed'}`);
    
    // Cleanup
    await adminClient.from('conversations').delete().eq('id', conv.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('Admin access test', false, `Error: ${error.message}`);
  }
}

async function test6_UserCanCreateRecords() {
  console.log('\n📋 TEST 6: Users can create their own records\n');
  
  try {
    // Login as User A
    const { data: { session: sessionA }, error: errorA } = await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    if (errorA) throw errorA;
    
    const clientA = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: `Bearer ${sessionA.access_token}` } }
    });
    
    // Test creating various record types
    const { data: conv, error: convError } = await clientA
      .from('conversations')
      .insert({
        user_id: sessionA.user.id,
        title: 'Test Conversation',
        context: 'Testing record creation',
        status: 'active'
      })
      .select()
      .single();
    
    logTest('User A can create conversation', !!conv && !convError,
      `Created conversation ID: ${conv?.id || 'Failed'}`);
    
    const { data: goal, error: goalError } = await clientA
      .from('wellness_goals')
      .insert({
        user_id: sessionA.user.id,
        goal_type: 'weight_loss',
        target_value: 10.0,
        current_value: 0.0,
        unit: 'kg',
        status: 'active'
      })
      .select()
      .single();
    
    logTest('User A can create wellness goal', !!goal && !goalError,
      `Created goal ID: ${goal?.id || 'Failed'}`);
    
    // Get User B's ID
    const { data: { session: sessionB } } = await anonClient.auth.signInWithPassword({
      email: USER_B_EMAIL,
      password: USER_B_PASSWORD
    });
    
    // Switch back to User A
    await anonClient.auth.signOut();
    await anonClient.auth.signInWithPassword({
      email: USER_A_EMAIL,
      password: USER_A_PASSWORD
    });
    
    // User A should NOT be able to create records for User B
    const { error: fakeError } = await clientA
      .from('conversations')
      .insert({
        user_id: sessionB.user.id, // Trying to create for User B
        title: 'Fake Conversation',
        context: 'Should fail',
        status: 'active'
      });
    
    logTest('User A cannot create records for User B', !!fakeError,
      `Creation blocked: ${fakeError?.message || 'No error (unexpected)'}`);
    
    // Cleanup
    if (conv) await adminClient.from('conversations').delete().eq('id', conv.id);
    if (goal) await adminClient.from('wellness_goals').delete().eq('id', goal.id);
    await anonClient.auth.signOut();
    
  } catch (error) {
    logTest('User record creation test', false, `Error: ${error.message}`);
  }
}

async function cleanupTestData() {
  console.log('\n🧹 Cleaning up test data...\n');
  
  try {
    // Delete test conversations
    await adminClient.from('conversations').delete().like('title', '%Test%');
    await adminClient.from('conversations').delete().like('title', '%User A%');
    
    // Delete test debts
    await adminClient.from('debts').delete().eq('name', 'User B Credit Card');
    
    // Delete test workouts
    await adminClient.from('workouts').delete().like('name', '%Test%');
    
    // Delete test shared budgets
    const { data: budgets } = await adminClient
      .from('shared_budgets')
      .select('id')
      .like('name', '%Test%');
    
    if (budgets && budgets.length > 0) {
      for (const budget of budgets) {
        await adminClient.from('shared_budget_members').delete().eq('shared_budget_id', budget.id);
        await adminClient.from('shared_budgets').delete().eq('id', budget.id);
      }
    }
    
    console.log('✅ Cleanup complete\n');
  } catch (error) {
    console.error('⚠️  Cleanup error:', error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting SASS-E RLS Policy Tests\n');
  console.log('=' .repeat(60));
  
  // Setup
  const setupSuccess = await setupTestUsers();
  if (!setupSuccess) {
    console.error('\n❌ Failed to setup test users. Aborting tests.');
    return;
  }
  
  // Run tests
  await test1_UserIsolation();
  await test2_FinancialDataIsolation();
  await test3_SharedBudgetAccess();
  await test4_PublicContentAccess();
  await test5_AdminAccess();
  await test6_UserCanCreateRecords();
  
  // Cleanup
  await cleanupTestData();
  
  // Summary
  console.log('=' .repeat(60));
  console.log('\n📊 TEST SUMMARY\n');
  console.log(`Total Tests: ${results.passed + results.failed}`);
  console.log(`✅ Passed: ${results.passed}`);
  console.log(`❌ Failed: ${results.failed}`);
  console.log(`Success Rate: ${((results.passed / (results.passed + results.failed)) * 100).toFixed(1)}%\n`);
  
  if (results.failed > 0) {
    console.log('Failed tests:');
    results.tests.filter(t => !t.passed).forEach(t => {
      console.log(`  ❌ ${t.name}: ${t.message}`);
    });
  }
  
  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runAllTests().catch(error => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
