/**
 * Automated RLS Verification Script
 * 
 * This script helps verify that Row Level Security is properly enforced
 * by creating test users and attempting cross-user data access.
 * 
 * Usage:
 *   pnpm tsx scripts/verify-rls.ts
 * 
 * Requirements:
 *   - SUPABASE_URL environment variable
 *   - SUPABASE_ANON_KEY environment variable
 *   - Application deployed and accessible
 */

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - SUPABASE_URL or VITE_SUPABASE_URL');
  console.error('   - SUPABASE_ANON_KEY or VITE_SUPABASE_ANON_KEY');
  process.exit(1);
}

interface TestResult {
  test: string;
  passed: boolean;
  message: string;
  details?: any;
}

const results: TestResult[] = [];

function logTest(test: string, passed: boolean, message: string, details?: any) {
  const icon = passed ? '✅' : '❌';
  console.log(`${icon} ${test}: ${message}`);
  if (details) {
    console.log(`   Details:`, details);
  }
  results.push({ test, passed, message, details });
}

async function createTestUser(email: string, password: string) {
  const supabase = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!);
  
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    
    if (error) {
      // User might already exist, try to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        throw signInError;
      }
      
      return signInData;
    }
    
    return data;
  } catch (error: any) {
    console.error(`Failed to create/sign in user ${email}:`, error.message);
    throw error;
  }
}

async function testBudgetCategoryIsolation() {
  console.log('\n📊 Testing Budget Category Isolation...\n');
  
  // Create two test users
  const user1Email = `rls-test-user1-${Date.now()}@example.com`;
  const user2Email = `rls-test-user2-${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  try {
    // Sign up user 1
    const user1Auth = await createTestUser(user1Email, password);
    if (!user1Auth.session) {
      logTest('User 1 Creation', false, 'Failed to create user 1 session');
      return;
    }
    logTest('User 1 Creation', true, `Created ${user1Email}`);
    
    // Create client for user 1
    const user1Client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${user1Auth.session.access_token}`
        }
      }
    });
    
    // User 1 creates a budget category
    const { data: user1Category, error: createError } = await user1Client
      .from('budget_categories')
      .insert({
        user_id: user1Auth.user!.id,
        name: 'User 1 Test Category',
        type: 'needs',
        monthly_limit: 500,
        is_active: true,
      })
      .select()
      .single();
    
    if (createError) {
      logTest('User 1 Create Category', false, `Failed: ${createError.message}`);
      return;
    }
    logTest('User 1 Create Category', true, `Created category: ${user1Category.name}`);
    
    // User 1 reads their own categories
    const { data: user1Categories, error: readError } = await user1Client
      .from('budget_categories')
      .select('*');
    
    if (readError) {
      logTest('User 1 Read Own Categories', false, `Failed: ${readError.message}`);
    } else {
      const ownCategoryCount = user1Categories?.filter(c => c.user_id === user1Auth.user!.id).length || 0;
      logTest('User 1 Read Own Categories', true, `Found ${ownCategoryCount} own categories`);
    }
    
    // Sign up user 2
    const user2Auth = await createTestUser(user2Email, password);
    if (!user2Auth.session) {
      logTest('User 2 Creation', false, 'Failed to create user 2 session');
      return;
    }
    logTest('User 2 Creation', true, `Created ${user2Email}`);
    
    // Create client for user 2
    const user2Client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: {
        headers: {
          Authorization: `Bearer ${user2Auth.session.access_token}`
        }
      }
    });
    
    // User 2 tries to read all categories (should only see their own)
    const { data: user2Categories, error: user2ReadError } = await user2Client
      .from('budget_categories')
      .select('*');
    
    if (user2ReadError) {
      logTest('User 2 Read Categories', false, `Failed: ${user2ReadError.message}`);
    } else {
      const user1CategoriesVisible = user2Categories?.filter(c => c.user_id === user1Auth.user!.id).length || 0;
      const user2OwnCategories = user2Categories?.filter(c => c.user_id === user2Auth.user!.id).length || 0;
      
      if (user1CategoriesVisible > 0) {
        logTest(
          'RLS Isolation Check',
          false,
          `User 2 can see ${user1CategoriesVisible} categories from User 1 - RLS NOT WORKING!`,
          { user1CategoriesVisible, user2OwnCategories }
        );
      } else {
        logTest(
          'RLS Isolation Check',
          true,
          `User 2 cannot see User 1's categories - RLS WORKING!`,
          { user2OwnCategories }
        );
      }
    }
    
    // User 2 tries to update User 1's category (should fail)
    const { error: updateError } = await user2Client
      .from('budget_categories')
      .update({ name: 'Hacked by User 2' })
      .eq('id', user1Category.id);
    
    if (updateError) {
      logTest(
        'Cross-User Update Protection',
        true,
        'User 2 cannot update User 1\'s category - RLS WORKING!',
        { error: updateError.message }
      );
    } else {
      // Verify the category wasn't actually updated
      const { data: verifyCategory } = await user1Client
        .from('budget_categories')
        .select('name')
        .eq('id', user1Category.id)
        .single();
      
      if (verifyCategory?.name === 'User 1 Test Category') {
        logTest(
          'Cross-User Update Protection',
          true,
          'Update appeared to succeed but data unchanged - RLS WORKING!'
        );
      } else {
        logTest(
          'Cross-User Update Protection',
          false,
          'User 2 successfully modified User 1\'s data - RLS NOT WORKING!',
          { originalName: 'User 1 Test Category', currentName: verifyCategory?.name }
        );
      }
    }
    
    // Cleanup: Delete test categories
    await user1Client.from('budget_categories').delete().eq('id', user1Category.id);
    
  } catch (error: any) {
    logTest('Budget Category Isolation', false, `Test failed with error: ${error.message}`);
  }
}

async function testFinancialGoalIsolation() {
  console.log('\n💰 Testing Financial Goal Isolation...\n');
  
  const user1Email = `rls-test-goal1-${Date.now()}@example.com`;
  const user2Email = `rls-test-goal2-${Date.now()}@example.com`;
  const password = 'TestPassword123!';
  
  try {
    // Create user 1
    const user1Auth = await createTestUser(user1Email, password);
    if (!user1Auth.session) {
      logTest('Goal Test - User 1', false, 'Failed to create user 1');
      return;
    }
    
    const user1Client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${user1Auth.session.access_token}` } }
    });
    
    // User 1 creates a goal
    const { data: user1Goal, error: createError } = await user1Client
      .from('financial_goals')
      .insert({
        user_id: user1Auth.user!.id,
        name: 'User 1 Vacation Fund',
        target_amount: 5000,
        current_amount: 0,
        status: 'active',
      })
      .select()
      .single();
    
    if (createError) {
      logTest('Goal Test - Create Goal', false, `Failed: ${createError.message}`);
      return;
    }
    logTest('Goal Test - Create Goal', true, `User 1 created goal: ${user1Goal.name}`);
    
    // Create user 2
    const user2Auth = await createTestUser(user2Email, password);
    if (!user2Auth.session) {
      logTest('Goal Test - User 2', false, 'Failed to create user 2');
      return;
    }
    
    const user2Client = createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      global: { headers: { Authorization: `Bearer ${user2Auth.session.access_token}` } }
    });
    
    // User 2 tries to read goals
    const { data: user2Goals } = await user2Client
      .from('financial_goals')
      .select('*');
    
    const user1GoalsVisible = user2Goals?.filter(g => g.user_id === user1Auth.user!.id).length || 0;
    
    if (user1GoalsVisible > 0) {
      logTest(
        'Goal Isolation Check',
        false,
        `User 2 can see ${user1GoalsVisible} goals from User 1 - RLS NOT WORKING!`
      );
    } else {
      logTest(
        'Goal Isolation Check',
        true,
        'User 2 cannot see User 1\'s goals - RLS WORKING!'
      );
    }
    
    // Cleanup
    await user1Client.from('financial_goals').delete().eq('id', user1Goal.id);
    
  } catch (error: any) {
    logTest('Financial Goal Isolation', false, `Test failed: ${error.message}`);
  }
}

async function checkRLSEnabled() {
  console.log('\n🔍 Checking RLS Configuration...\n');
  
  // This requires service key access to query pg_tables
  // For now, we'll just note that this should be checked manually
  console.log('⚠️  Manual check required:');
  console.log('   Run this query in Supabase SQL Editor:');
  console.log('');
  console.log('   SELECT tablename, rowsecurity');
  console.log('   FROM pg_tables');
  console.log('   WHERE schemaname = \'public\'');
  console.log('   AND tablename IN (\'budget_categories\', \'financial_goals\', \'debts\');');
  console.log('');
  console.log('   All tables should have rowsecurity = true');
  console.log('');
}

async function main() {
  console.log('🔒 RLS Verification Script\n');
  console.log('This script will test Row Level Security enforcement\n');
  console.log('='.repeat(60));
  
  await checkRLSEnabled();
  await testBudgetCategoryIsolation();
  await testFinancialGoalIsolation();
  
  console.log('\n' + '='.repeat(60));
  console.log('\n📋 Summary:\n');
  
  const passed = results.filter(r => r.passed).length;
  const failed = results.filter(r => !r.passed).length;
  const total = results.length;
  
  console.log(`Total Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`Success Rate: ${((passed / total) * 100).toFixed(1)}%`);
  
  if (failed > 0) {
    console.log('\n⚠️  SECURITY WARNING: Some RLS tests failed!');
    console.log('   Please review the failed tests and fix RLS policies.');
    console.log('   See docs/RLS-MANUAL-VERIFICATION.md for troubleshooting.');
    process.exit(1);
  } else {
    console.log('\n✅ All RLS tests passed! Your data is properly isolated.');
  }
}

main().catch(error => {
  console.error('\n❌ Script failed with error:', error);
  process.exit(1);
});
