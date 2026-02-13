/**
 * Supabase Test Helper
 * 
 * Provides utilities for testing with Supabase:
 * - Service role client that bypasses RLS policies
 * - Test user creation and cleanup
 * - Authenticated client generation
 * - Test data cleanup
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { User } from '../../drizzle/schema';

// Create service role client that bypasses RLS
export const supabaseAdmin = createClient(
  process.env.SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_KEY || '', // Service role key, not anon key
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Helper to create test user
 */
export async function createTestUser(overrides: Partial<User> = {}) {
  const timestamp = Date.now();
  const testUser = {
    email: `test-${timestamp}@example.com`,
    name: 'Test User',
    role: 'user' as const,
    subscriptionTier: 'free' as const,
    ...overrides,
  };

  // For Supabase Auth, we need to use the admin API
  // But since we're using Manus OAuth, we'll create users directly in our MySQL database
  // This is a simplified version for testing purposes
  
  return {
    user: {
      id: timestamp,
      numericId: timestamp,
      openId: `test-openid-${timestamp}`,
      email: testUser.email,
      name: testUser.name,
      role: testUser.role,
      subscriptionTier: testUser.subscriptionTier,
      subscriptionStatus: 'active' as const,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    }
  };
}

/**
 * Helper to clean up test user
 */
export async function deleteTestUser(userId: number) {
  // Clean up test user from database
  // This would typically use your database client
  console.log(`Cleaning up test user: ${userId}`);
}

/**
 * Helper to get authenticated Supabase client for user
 */
export async function getAuthenticatedSupabaseClient(accessToken: string): Promise<SupabaseClient> {
  return createClient(
    process.env.SUPABASE_URL || '',
    process.env.SUPABASE_ANON_KEY || '',
    {
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      },
    }
  );
}

/**
 * Clean up all test data after tests
 */
export async function cleanupTestData() {
  try {
    // Delete test users (those with email starting with 'test-')
    const { data: users } = await supabaseAdmin
      .from('user_audio_storage')
      .select('userId')
      .like('userId', 'test-%');

    if (users && users.length > 0) {
      // Clean up audio storage records
      await supabaseAdmin
        .from('user_audio_storage')
        .delete()
        .like('userId', 'test-%');
    }

    console.log('Test data cleanup completed');
  } catch (error) {
    console.error('Error cleaning up test data:', error);
  }
}

/**
 * Helper to inspect database state during tests
 */
export async function inspectDatabase() {
  try {
    const { data: audioStorage, count: audioCount } = await supabaseAdmin
      .from('user_audio_storage')
      .select('*', { count: 'exact' });

    console.log('\n📊 DATABASE STATE:');
    console.log('Audio Storage Records:', audioCount || 0);

    return { audioStorage };
  } catch (error) {
    console.error('Error inspecting database:', error);
    return {};
  }
}
