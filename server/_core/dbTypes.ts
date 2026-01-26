/**
 * Type definitions for dual database compatibility
 * 
 * This file provides type-level compatibility for database functions
 * to accept both string (Supabase UUID) and number (Manus numeric ID) user IDs.
 */

export type UserId = string | number;

/**
 * Convert UserId to number for Manus database operations
 * Throws error if conversion fails (e.g., for Supabase UUIDs)
 */
export function ensureNumericUserId(userId: UserId): number {
  if (typeof userId === "number") {
    return userId;
  }
  
  const parsed = parseInt(String(userId));
  if (!isNaN(parsed)) {
    return parsed;
  }
  
  throw new Error(`Cannot convert user ID "${userId}" to number. Supabase users should use Supabase database functions.`);
}
