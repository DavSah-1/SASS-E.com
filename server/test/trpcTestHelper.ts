/**
 * tRPC Test Helper
 * 
 * Provides utilities for testing tRPC procedures:
 * - Create authenticated test callers with proper context
 * - Mock request/response objects
 * - Test different user roles
 */

import { appRouter } from '../routers';
import { createTestUser } from './supabaseTestHelper';
import type { TrpcContext } from '../_core/context';
import { 
  createNotificationAdapter, 
  createBudgetAdapter, 
  createDebtAdapter, 
  createLearningAdapter, 
  createIoTAdapter, 
  createGoalsAdapter, 
  createTranslationAdapter 
} from '../adapters';

/**
 * Create a tRPC caller with test context
 */
export async function createTestCaller(options: {
  role?: 'user' | 'admin';
  userId?: number;
  email?: string;
  subscriptionTier?: 'free' | 'starter' | 'pro' | 'ultimate';
} = {}) {
  const { 
    role = 'user', 
    userId, 
    email,
    subscriptionTier = 'free'
  } = options;

  // Create test user if userId not provided
  let testUser;
  if (!userId) {
    const { user } = await createTestUser({ 
      role, 
      subscriptionTier,
      email 
    });
    testUser = user;
  } else {
    testUser = {
      id: userId,
      numericId: userId,
      openId: `test-openid-${userId}`,
      email: email || `test-${userId}@example.com`,
      name: 'Test User',
      role,
      subscriptionTier,
      subscriptionStatus: 'active' as const,
      createdAt: new Date(),
      lastSignedIn: new Date(),
    };
  }

  // Create adapters for test context (same logic as context.ts)
  const adapterContext = { user: testUser as any, accessToken: undefined };
  const notificationDb = createNotificationAdapter(adapterContext);
  const budgetDb = createBudgetAdapter(adapterContext);
  const debtDb = createDebtAdapter(adapterContext);
  const learningDb = createLearningAdapter(adapterContext);
  const iotDb = createIoTAdapter(adapterContext);
  const goalsDb = createGoalsAdapter(adapterContext);
  const translationDb = createTranslationAdapter(adapterContext);

  // Create mock context
  const mockContext: TrpcContext = {
    user: testUser as any,
    req: {
      headers: {},
      cookies: {},
      ip: '127.0.0.1',
    } as any,
    res: {
      cookie: () => {},
      clearCookie: () => {},
      setHeader: () => {},
    } as any,
    notificationDb,
    budgetDb,
    debtDb,
    learningDb,
    iotDb,
    goalsDb,
    translationDb,
  };

  // Create caller with context
  return appRouter.createCaller(mockContext);
}

/**
 * Create an unauthenticated caller (no user in context)
 */
export function createUnauthenticatedCaller() {
  const mockContext: TrpcContext = {
    user: null,
    notificationDb: null,
    budgetDb: null,
    debtDb: null,
    learningDb: null,
    iotDb: null,
    goalsDb: null,
    translationDb: null,
    req: {
      headers: {},
      cookies: {},
      ip: '127.0.0.1',
    } as any,
    res: {
      cookie: () => {},
      clearCookie: () => {},
      setHeader: () => {},
    } as any,
  };

  return appRouter.createCaller(mockContext);
}

/**
 * Helper to test protected procedures
 */
export async function testProtectedProcedure<T>(
  procedureFn: (caller: ReturnType<typeof appRouter.createCaller>) => Promise<T>,
  options?: Parameters<typeof createTestCaller>[0]
): Promise<T> {
  const caller = await createTestCaller(options);
  return procedureFn(caller);
}

/**
 * Helper to test admin-only procedures
 */
export async function testAdminProcedure<T>(
  procedureFn: (caller: ReturnType<typeof appRouter.createCaller>) => Promise<T>
): Promise<T> {
  const caller = await createTestCaller({ role: 'admin' });
  return procedureFn(caller);
}

/**
 * Debug helper for tests
 */
export function debugTest(label: string, data: any) {
  if (process.env.DEBUG_TESTS === 'true') {
    console.log(`\n🔍 DEBUG [${label}]:`, JSON.stringify(data, null, 2));
  }
}
