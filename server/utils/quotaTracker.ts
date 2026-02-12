import { getDb } from "../db";
import { getSupabaseDb } from "../supabaseDb";
import { getSupabaseClient } from "../supabaseClient";
import { quotaUsage } from "../../drizzle/schema";
import { supabaseQuotaUsage } from "../supabaseDb";
import { eq, and } from "drizzle-orm";

/**
 * Quota Tracker with Dual-Database Support
 * 
 * Implements subscription-tier-based rate limiting for:
 * - Tavily web searches
 * - Whisper transcriptions
 * - LLM calls
 * 
 * Quota Limits by Tier (per month):
 * - Free: 150 per service
 * - Starter: 300 per service
 * - Pro: 600 per service
 * - Ultimate: 1200 per service
 * 
 * Admin users bypass all quota checks.
 */

export type Service = "tavily" | "whisper" | "llm";
export type Tier = "free" | "starter" | "pro" | "ultimate";

export interface QuotaConfig {
  free: number;
  starter: number;
  pro: number;
  ultimate: number;
}

// Quota limits per service per month
export const QUOTA_LIMITS: Record<Service, QuotaConfig> = {
  tavily: {
    free: 150,
    starter: 300,
    pro: 600,
    ultimate: 1200,
  },
  whisper: {
    free: 150,
    starter: 300,
    pro: 600,
    ultimate: 1200,
  },
  llm: {
    free: 150,
    starter: 300,
    pro: 600,
    ultimate: 1200,
  },
};

export interface QuotaCheckResult {
  allowed: boolean;
  current: number;
  limit: number;
  remaining: number;
  resetAt: Date;
  tier: Tier;
}

export interface UserContext {
  id: number | string;
  role: "admin" | "user";
  subscriptionTier: Tier;
  accessToken?: string;
}

/**
 * Get current period string (YYYY-MM format)
 */
function getCurrentPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

/**
 * Get reset date (first day of next month)
 */
function getResetDate(): Date {
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return nextMonth;
}

/**
 * Check if user has quota remaining for a service
 * Returns quota status without incrementing
 * 
 * @param ctx User context with role, tier, and access token
 * @param service Service to check quota for
 * @returns Quota check result with allowed status and current usage
 */
export async function checkQuota(
  ctx: UserContext,
  service: Service
): Promise<QuotaCheckResult> {
  // Admin users bypass quota checks
  if (ctx.role === "admin") {
    return {
      allowed: true,
      current: 0,
      limit: Infinity,
      remaining: Infinity,
      resetAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
      tier: ctx.subscriptionTier,
    };
  }

  const period = getCurrentPeriod();
  const resetAt = getResetDate();
  const tier = ctx.subscriptionTier;
  const limit = QUOTA_LIMITS[service][tier];

  try {
    if (typeof ctx.id === "number") {
      // Manus database (should not happen for regular users, but handle it)
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection not available");
      }

      const result = await db
        .select()
        .from(quotaUsage)
        .where(
          and(
            eq(quotaUsage.userId, ctx.id),
            eq(quotaUsage.service, service),
            eq(quotaUsage.period, period)
          )
        )
        .limit(1);

      const current = result.length > 0 ? result[0].count : 0;
      const remaining = Math.max(0, limit - current);

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        resetAt,
        tier,
      };
    } else {
      // Supabase database (regular users with RLS)
      if (!ctx.accessToken) {
        throw new Error("Access token required for quota check");
      }

      const supabase = await getSupabaseClient(String(ctx.id), ctx.accessToken);
      const { data, error } = await supabase
        .from("quota_usage")
        .select("*")
        .eq("user_id", String(ctx.id))
        .eq("service", service)
        .eq("period", period)
        .limit(1)
        .single();

      if (error && error.code !== "PGRST116") {
        // PGRST116 = no rows returned, which is fine
        console.error("[Quota Check] Supabase error:", error);
        throw new Error(`Quota check failed: ${error.message}`);
      }

      const current = data ? data.count : 0;
      const remaining = Math.max(0, limit - current);

      return {
        allowed: current < limit,
        current,
        limit,
        remaining,
        resetAt,
        tier,
      };
    }
  } catch (error) {
    console.error("[Quota Check] Error:", error);
    throw error;
  }
}

/**
 * Increment quota usage for a service
 * Creates a new record if one doesn't exist for the current period
 * 
 * @param ctx User context with role, tier, and access token
 * @param service Service to increment quota for
 * @param amount Amount to increment (default: 1)
 * @returns Updated quota status
 */
export async function incrementQuota(
  ctx: UserContext,
  service: Service,
  amount: number = 1
): Promise<QuotaCheckResult> {
  // Admin users bypass quota tracking
  if (ctx.role === "admin") {
    return {
      allowed: true,
      current: 0,
      limit: Infinity,
      remaining: Infinity,
      resetAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      tier: ctx.subscriptionTier,
    };
  }

  const period = getCurrentPeriod();
  const resetAt = getResetDate();
  const tier = ctx.subscriptionTier;
  const limit = QUOTA_LIMITS[service][tier];

  try {
    if (typeof ctx.id === "number") {
      // Manus database (should not happen for regular users, but handle it)
      const db = await getDb();
      if (!db) {
        throw new Error("Database connection not available");
      }

      // Check if record exists
      const existing = await db
        .select()
        .from(quotaUsage)
        .where(
          and(
            eq(quotaUsage.userId, ctx.id),
            eq(quotaUsage.service, service),
            eq(quotaUsage.period, period)
          )
        )
        .limit(1);

      if (existing.length > 0) {
        // Update existing record
        const newCount = existing[0].count + amount;
        await db
          .update(quotaUsage)
          .set({ count: newCount, updatedAt: new Date() })
          .where(eq(quotaUsage.id, existing[0].id));

        const remaining = Math.max(0, limit - newCount);
        return {
          allowed: newCount <= limit,
          current: newCount,
          limit,
          remaining,
          resetAt,
          tier,
        };
      } else {
        // Create new record
        await db.insert(quotaUsage).values({
          userId: ctx.id,
          service,
          count: amount,
          period,
          tier,
          resetAt,
        });

        const remaining = Math.max(0, limit - amount);
        return {
          allowed: amount <= limit,
          current: amount,
          limit,
          remaining,
          resetAt,
          tier,
        };
      }
    } else {
      // Supabase database (regular users with RLS)
      if (!ctx.accessToken) {
        throw new Error("Access token required for quota increment");
      }

      const supabase = await getSupabaseClient(String(ctx.id), ctx.accessToken);

      // Check if record exists
      const { data: existing, error: selectError } = await supabase
        .from("quota_usage")
        .select("*")
        .eq("user_id", String(ctx.id))
        .eq("service", service)
        .eq("period", period)
        .limit(1)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("[Quota Increment] Supabase select error:", selectError);
        throw new Error(`Quota increment failed: ${selectError.message}`);
      }

      if (existing) {
        // Update existing record
        const newCount = existing.count + amount;
        const { error: updateError } = await supabase
          .from("quota_usage")
          .update({ count: newCount, updated_at: new Date().toISOString() })
          .eq("id", existing.id);

        if (updateError) {
          console.error("[Quota Increment] Supabase update error:", updateError);
          throw new Error(`Quota increment failed: ${updateError.message}`);
        }

        const remaining = Math.max(0, limit - newCount);
        return {
          allowed: newCount <= limit,
          current: newCount,
          limit,
          remaining,
          resetAt,
          tier,
        };
      } else {
        // Create new record
        const { error: insertError } = await supabase
          .from("quota_usage")
          .insert({
            user_id: String(ctx.id),
            service,
            count: amount,
            period,
            tier,
            reset_at: resetAt.toISOString(),
          });

        if (insertError) {
          console.error("[Quota Increment] Supabase insert error:", insertError);
          throw new Error(`Quota increment failed: ${insertError.message}`);
        }

        const remaining = Math.max(0, limit - amount);
        return {
          allowed: amount <= limit,
          current: amount,
          limit,
          remaining,
          resetAt,
          tier,
        };
      }
    }
  } catch (error) {
    console.error("[Quota Increment] Error:", error);
    throw error;
  }
}

/**
 * Get quota usage for all services for a user
 * Used for displaying quota status in the frontend
 * 
 * @param ctx User context with role, tier, and access token
 * @returns Quota usage for all services
 */
export async function getQuotaUsage(
  ctx: UserContext
): Promise<Record<Service, QuotaCheckResult>> {
  const services: Service[] = ["tavily", "whisper", "llm"];
  const results: Record<Service, QuotaCheckResult> = {} as any;

  for (const service of services) {
    results[service] = await checkQuota(ctx, service);
  }

  return results;
}
