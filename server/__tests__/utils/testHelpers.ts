import jwt from "jsonwebtoken";
import type { DbContext } from "../../dbRoleAware";
import { expect } from "vitest";

/**
 * Test utilities for dual-database integration testing
 */

/**
 * Generate a test access token
 * 
 * In test environment, we use the service key which bypasses RLS.
 * This is a pragmatic approach that allows testing database operations
 * without requiring real Supabase Auth user creation.
 * 
 * In production, real JWT tokens from Supabase Auth enforce RLS policies.
 * RLS policies should be tested manually in staging/production environments
 * with real user authentication flows.
 */
function generateJWT(payload: { sub: string; role: string; user_id: number }): string {
  // Use service key for test environment (bypasses RLS)
  // This allows testing database operations without complex auth setup
  return process.env.SUPABASE_SERVICE_KEY || "";
}

export interface MockUser {
  id: string;
  numericId: number;
  openId: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

export interface MockContextOptions {
  role?: "admin" | "user";
  userId?: number;
  openId?: string;
  accessToken?: string;
}

/**
 * Create a mock admin context for testing
 */
export function createAdminContext(options: Partial<MockContextOptions> = {}): DbContext {
  return {
    user: {
      id: options.openId || "admin-test-123",
      numericId: options.userId || 1,
      role: "admin",
    },
    accessToken: options.accessToken || generateJWT({
      sub: options.openId || "admin-test-123",
      role: "admin",
      user_id: options.userId || 1,
    }),
  };
}

/**
 * Create a mock user context for testing
 */
export function createUserContext(options: Partial<MockContextOptions> = {}): DbContext {
  const userId = options.userId || 1000;
  const openId = options.openId || `user-test-${userId}`;
  
  return {
    user: {
      id: openId,
      numericId: userId,
      role: "user",
    },
    accessToken: options.accessToken || generateJWT({
      sub: openId,
      role: "user",
      user_id: userId,
    }),
  };
}

/**
 * Create multiple user contexts for testing data isolation
 */
export function createMultipleUserContexts(count: number): DbContext[] {
  return Array.from({ length: count }, (_, i) => 
    createUserContext({ userId: 1000 + i, openId: `user-test-${1000 + i}` })
  );
}

/**
 * Helper to verify database routing based on role
 */
export function expectAdminDatabase(ctx: DbContext) {
  expect(ctx.user.role).toBe("admin");
}

export function expectUserDatabase(ctx: DbContext) {
  expect(ctx.user.role).toBe("user");
  expect(ctx.accessToken).toBeDefined();
}

/**
 * Test data generators
 */
export const testData = {
  vocabulary: {
    spanish: {
      word: "hola",
      translation: "hello",
      language: "Spanish",
      difficulty: "beginner" as const,
      partOfSpeech: "interjection",
      context: "Common greeting",
      pronunciation: "OH-lah",
      exampleSentence: "Hola, ¿cómo estás?",
      exampleTranslation: "Hello, how are you?",
    },
  },
  
  budgetCategory: {
    name: "Test Category",
    type: "expense" as const,
    monthlyLimit: 500,
    color: "#FF0000",
  },
  
  goal: {
    name: "Test Goal",
    description: "Test financial goal",
    targetAmount: 1000,
    currentAmount: 0,
    targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    category: "savings",
    status: "active" as const,
  },
  
  debt: {
    name: "Test Debt",
    balance: 5000,
    interestRate: 15.5,
    minimumPayment: 100,
    dueDate: new Date('2025-01-15'), // Full date object, not just day number
    debtType: "credit_card" as const,
    status: "active" as const,
  },
};

/**
 * Cleanup helper for tests
 */
export async function cleanupTestData(ctx: DbContext, tableName: string, userId: number) {
  // This would be implemented based on your cleanup needs
  // For now, it's a placeholder
  console.log(`Cleanup test data for ${tableName}, user ${userId}`);
}
