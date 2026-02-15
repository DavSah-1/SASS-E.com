import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, text, timestamp, varchar, pgEnum, integer, jsonb } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

/**
 * Supabase Database Connection
 * This database stores all regular user accounts and their data.
 * Admin/owner accounts are stored in the Manus database.
 */

// Define the role enum for Supabase users
const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Define the subscription tier enum
const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "starter",
  "pro",
  "ultimate",
]);

// Define the billing period enum
const billingPeriodEnum = pgEnum("billing_period", [
  "monthly",
  "six_month",
  "annual",
]);

// Define the subscription period enum (matches Manus DB naming)
const subscriptionPeriodEnum = pgEnum("subscription_period", [
  "monthly",
  "six_month",
  "annual",
]);

// Define the subscription status enum
const subscriptionStatusEnum = pgEnum("subscription_status", [
  "active",
  "canceled",
  "past_due",
  "unpaid",
  "trialing",
]);

// Define the service enum for quota tracking
const serviceEnum = pgEnum("service", ["tavily", "whisper", "llm"]);

// Define the tier enum for quota tracking (reusing subscription tiers)
const quotaTierEnum = pgEnum("quota_tier", [
  "free",
  "starter",
  "pro",
  "ultimate",
]);

// Define the cleanup type enum for cleanup logs
const cleanupTypeEnum = pgEnum("cleanup_type", [
  "age_based",
  "storage_based",
  "manual",
]);

// Define the cleanup status enum
const cleanupStatusEnum = pgEnum("cleanup_status", [
  "success",
  "partial",
  "failed",
]);

// Supabase users table schema
export const supabaseUsers = pgTable("users", {
  id: text("id").primaryKey(), // Supabase Auth user ID
  email: varchar("email", { length: 320 }),
  name: text("name"),
  role: userRoleEnum("role").default("user").notNull(),
  loginMethod: varchar("login_method", { length: 64 }),
  preferredLanguage: varchar("preferred_language", { length: 10 }).default("en"),
  preferredCurrency: varchar("preferred_currency", { length: 3 }).default("USD"),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  selectedSpecializedHubs: text("selected_specialized_hubs")
    .array()
    .default([])
    .notNull(),
  hubsSelectedAt: timestamp("hubs_selected_at"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  subscriptionPrice: varchar("subscription_price", { length: 20 }), // Using varchar for decimal storage
  subscriptionCurrency: varchar("subscription_currency", { length: 3 }).default("GBP"),
  staySignedIn: text("stay_signed_in").default("false").notNull(), // Using text for boolean
  twoFactorEnabled: text("two_factor_enabled").default("false").notNull(), // Using text for boolean
  twoFactorSecret: varchar("two_factor_secret", { length: 255 }),
  backupCodes: text("backup_codes"),
  
  // Stripe subscription fields
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  subscriptionStatus: subscriptionStatusEnum("subscription_status").default("trialing"),
  billingPeriod: billingPeriodEnum("billing_period").default("monthly"),
  subscriptionPeriod: subscriptionPeriodEnum("subscription_period").default("monthly"),
  
  // Trial tracking fields
  trialDays: integer("trial_days").default(5).notNull(), // 5 for monthly, 7 for 6-month/annual
  hubTrialStartDates: jsonb("hub_trial_start_dates").default({}).notNull(), // { "language": "2026-01-29T10:00:00Z", ... }
  
  // Billing cycle fields
  currentPeriodStart: timestamp("current_period_start"),
  currentPeriodEnd: timestamp("current_period_end"),
  cancelAtPeriodEnd: text("cancel_at_period_end"), // null or lowercase tier name to downgrade to
  
  // User type tracking
  isNewUser: text("is_new_user").default("yes").notNull(), // "yes" or "no"
  
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type SupabaseUser = typeof supabaseUsers.$inferSelect;
export type InsertSupabaseUser = typeof supabaseUsers.$inferInsert;

// Lazy connection to Supabase database
let _supabaseDb: ReturnType<typeof drizzle> | null = null;

export async function getSupabaseDb() {
  if (!_supabaseDb && process.env.SUPABASE_DB_URL) {
    try {
      const sql = postgres(process.env.SUPABASE_DB_URL);
      _supabaseDb = drizzle(sql);
    } catch (error) {
      console.warn("[Supabase Database] Failed to connect:", error);
      _supabaseDb = null;
    }
  }
  return _supabaseDb;
}

/**
 * Upsert a Supabase user
 */
export async function upsertSupabaseUser(
  user: InsertSupabaseUser
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot upsert user: database not available"
    );
    return;
  }

  try {
    await db
      .insert(supabaseUsers)
      .values(user)
      .onConflictDoUpdate({
        target: supabaseUsers.id,
        set: {
          email: user.email,
          name: user.name,
          lastSignedIn: user.lastSignedIn || new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Supabase Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get a Supabase user by ID
 */
export async function getSupabaseUserById(
  id: string
): Promise<SupabaseUser | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot get user: database not available"
    );
    return undefined;
  }

  const result = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update a Supabase user with partial data
 */
export async function updateSupabaseUser(
  data: Partial<SupabaseUser> & { id: string }
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update user: database not available"
    );
    return;
  }

  try {
    const { id, ...updateData } = data;
    await db
      .update(supabaseUsers)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(supabaseUsers.id, id));
  } catch (error) {
    console.error("[Supabase Database] Failed to update user:", error);
    throw error;
  }
}


/**
 * Quota Usage table for tracking API usage limits (Supabase Database - Regular Users)
 * Tracks usage for Tavily searches, Whisper transcriptions, and LLM calls
 * Supports subscription-tier-based limits (Free: 150, Starter: 300, Pro: 600, Ultimate: 1200)
 * RLS Policy: Users can only read/write their own quota records
 */
export const supabaseQuotaUsage = pgTable("quota_usage", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  userId: text("user_id").notNull().references(() => supabaseUsers.id),
  service: serviceEnum("service").notNull(),
  count: integer("count").default(0).notNull(),
  period: varchar("period", { length: 7 }).notNull(), // Format: "YYYY-MM" for monthly tracking
  tier: quotaTierEnum("tier").notNull(),
  resetAt: timestamp("reset_at").notNull(), // When the quota resets (first day of next month)
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type SupabaseQuotaUsage = typeof supabaseQuotaUsage.$inferSelect;
export type InsertSupabaseQuotaUsage = typeof supabaseQuotaUsage.$inferInsert;


/**
 * Cleanup Logs table for tracking audio file cleanup operations (Supabase Database)
 * Provides audit trail for automated and manual cleanup operations
 * RLS Policy: Only admins can read cleanup logs
 */
export const supabaseCleanupLogs = pgTable("cleanup_logs", {
  id: integer("id").primaryKey().generatedAlwaysAsIdentity(),
  cleanupType: cleanupTypeEnum("cleanup_type").notNull(),
  filesDeleted: integer("files_deleted").default(0).notNull(),
  spaceFreedMB: text("space_freed_mb").default("0.00").notNull(), // Using text for decimal precision
  errors: jsonb("errors"), // JSON array of error messages
  triggeredBy: text("triggered_by"), // User ID if manual cleanup, null if automated
  status: cleanupStatusEnum("status").notNull(),
  executionTimeMs: integer("execution_time_ms"), // How long the cleanup took
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export type SupabaseCleanupLog = typeof supabaseCleanupLogs.$inferSelect;
export type InsertSupabaseCleanupLog = typeof supabaseCleanupLogs.$inferInsert;
