import type { UnifiedUser } from "./dbRouter";

/**
 * Database Wrapper for Dual Database Architecture
 * 
 * Provides helper functions to safely convert UnifiedUser IDs to numeric IDs
 * for Manus database operations, while supporting Supabase users in the future.
 */

/**
 * Convert UnifiedUser ID to numeric ID for Manus database operations
 * For Manus users: returns the numeric ID
 * For Supabase users: throws an error (they should use Supabase DB functions)
 */
export function toNumericId(userId: string | number): number {
  if (typeof userId === "number") {
    return userId;
  }
  
  const parsed = parseInt(String(userId));
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  throw new Error(`Cannot convert user ID "${userId}" to number. This operation requires a Manus user with numeric ID.`);
}

/**
 * Extract numeric ID from UnifiedUser for Manus database operations
 * Throws error if user is from Supabase (has UUID)
 */
export function getUserNumericId(user: UnifiedUser): number {
  if (user.authProvider === "supabase") {
    throw new Error("Cannot perform Manus database operation on Supabase user. Use Supabase database functions instead.");
  }
  return toNumericId(user.id);
}

/**
 * Check if a user can use Manus database operations
 * Returns true for Manus users (admin), false for Supabase users
 */
export function canUseManusDb(user: UnifiedUser): boolean {
  return user.authProvider === "manus";
}

/**
 * Safely get numeric ID from UnifiedUser, with fallback
 * Returns null if user is from Supabase
 */
export function tryGetNumericId(user: UnifiedUser): number | null {
  try {
    return getUserNumericId(user);
  } catch {
    return null;
  }
}
