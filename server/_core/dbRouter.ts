import { getDb } from "../db";
import { getSupabaseDb } from "../supabaseDb";

/**
 * Database Router for Dual Database Architecture
 * 
 * Routes database queries to the correct database based on user role:
 * - Admin/Owner → Manus Database (MySQL)
 * - Regular Users → Supabase Database (PostgreSQL)
 */

export type AuthProvider = "manus" | "supabase";

export interface UnifiedUser {
  id: string | number; // Supabase uses string UUIDs, Manus uses numeric IDs
  numericId: number; // Backward compatibility: numeric ID for Manus DB operations
  email: string | null;
  name: string | null;
  role: "admin" | "user";
  authProvider: AuthProvider;
  subscriptionTier?: "free" | "starter" | "pro" | "ultimate";
  selectedSpecializedHubs?: string[];
  hubsSelectedAt?: Date | null;
  subscriptionExpiresAt?: Date | null;
  preferredLanguage?: string | null;
  preferredCurrency?: string | null;
  loginMethod?: string | null;
  staySignedIn?: boolean;
  twoFactorEnabled?: boolean;
  createdAt: Date;
  lastSignedIn: Date;
}

/**
 * Get the appropriate database based on auth provider
 */
export async function getDbForProvider(provider: AuthProvider) {
  if (provider === "manus") {
    return await getDb();
  } else {
    return await getSupabaseDb();
  }
}

/**
 * Detect auth provider from user identifier
 * Manus uses openId (alphanumeric), Supabase uses UUID format
 */
export function detectAuthProvider(userId: string): AuthProvider {
  // Supabase UUIDs are in format: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
  const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  
  if (uuidPattern.test(userId)) {
    return "supabase";
  }
  return "manus";
}

/**
 * Normalize user data from either database to UnifiedUser format
 */
export function normalizeManusUser(user: any): UnifiedUser {
  return {
    id: user.id,
    numericId: user.id, // Manus users have numeric IDs
    email: user.email,
    name: user.name,
    role: user.role || "admin", // Manus DB users are typically admins
    authProvider: "manus",
    subscriptionTier: user.subscriptionTier,
    selectedSpecializedHubs: user.selectedSpecializedHubs 
      ? JSON.parse(user.selectedSpecializedHubs) 
      : [],
    hubsSelectedAt: user.hubsSelectedAt || null,
    subscriptionExpiresAt: user.subscriptionExpiresAt || null,
    preferredLanguage: user.preferredLanguage || null,
    preferredCurrency: user.preferredCurrency || null,
    loginMethod: user.loginMethod || null,
    staySignedIn: user.staySignedIn || false,
    twoFactorEnabled: user.twoFactorEnabled || false,
    createdAt: user.createdAt,
    lastSignedIn: user.lastSignedIn,
  };
}

export function normalizeSupabaseUser(user: any): UnifiedUser {
  return {
    id: user.id, // Supabase UUID
    numericId: -1, // Supabase users don't have numeric IDs (will cause errors if used with Manus DB)
    email: user.email,
    name: user.name,
    role: user.role || "user",
    authProvider: "supabase",
    subscriptionTier: user.subscriptionTier || user.subscription_tier,
    selectedSpecializedHubs: user.selectedSpecializedHubs || user.selected_specialized_hubs || [],
    hubsSelectedAt: user.hubsSelectedAt || user.hubs_selected_at || null,
    subscriptionExpiresAt: user.subscriptionExpiresAt || user.subscription_expires_at || null,
    preferredLanguage: user.preferredLanguage || user.preferred_language || null,
    preferredCurrency: user.preferredCurrency || user.preferred_currency || null,
    loginMethod: user.loginMethod || user.login_method || null,
    staySignedIn: user.staySignedIn || user.stay_signed_in || false,
    twoFactorEnabled: user.twoFactorEnabled || user.two_factor_enabled || false,
    createdAt: user.createdAt || user.created_at,
    lastSignedIn: user.lastSignedIn || user.last_signed_in,
  };
}
