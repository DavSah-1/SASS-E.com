import type { UnifiedUser } from "./dbRouter";

/**
 * Helper functions for working with UnifiedUser across dual database architecture
 */

/**
 * Get numeric user ID for Manus database operations
 * Throws error if user is from Supabase (UUID string)
 */
export function getNumericUserId(user: UnifiedUser): number {
  if (typeof user.id === "number") {
    return user.id;
  }
  
  // Try to parse as number
  const parsed = parseInt(String(user.id));
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  throw new Error("Cannot get numeric ID for Supabase user (UUID). This operation requires a Manus user.");
}

/**
 * Get string user ID (works for both Manus and Supabase)
 */
export function getStringUserId(user: UnifiedUser): string {
  return String(user.id);
}

/**
 * Check if user is from Manus database (admin)
 */
export function isManusUser(user: UnifiedUser): boolean {
  return user.authProvider === "manus";
}

/**
 * Check if user is from Supabase database (regular user)
 */
export function isSupabaseUser(user: UnifiedUser): boolean {
  return user.authProvider === "supabase";
}
