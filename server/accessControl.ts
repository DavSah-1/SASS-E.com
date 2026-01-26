import { eq, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import { getSupabaseDb } from "./supabaseDb";
import { users, dailyUsage } from "../drizzle/schema";
import { supabaseUsers } from "./supabaseDb";
import { PRICING_TIERS, type SubscriptionTier, type SpecializedHub } from "../shared/pricing";
import type { UnifiedUser } from "./_core/dbRouter";

export type FeatureType =
  | "voice_assistant"
  | "iot_device"
  | "verified_learning"
  | "math_tutor"
  | "translate"
  | "image_ocr"
  | "specialized_hub";

export interface FeatureAccessResult {
  allowed: boolean;
  reason?: string;
  currentUsage?: number;
  limit?: number | "unlimited";
  upgradeRequired?: boolean;
}

/**
 * Check if a user can access a specific feature based on their subscription tier
 * Works with both Manus DB (admin) and Supabase DB (users)
 * Admin role always gets unlimited access
 */
export async function checkFeatureAccess(
  user: UnifiedUser,
  featureType: FeatureType,
  specializedHub?: SpecializedHub
): Promise<FeatureAccessResult> {
  // Admin bypass: always allow unlimited access
  if (user.role === 'admin') {
    return {
      allowed: true,
      reason: "Admin has unlimited access",
      limit: "unlimited",
    };
  }

  const subscriptionTier = user.subscriptionTier || "free";
  const tierConfig = PRICING_TIERS[subscriptionTier];

  // Check specialized hub access
  if (featureType === "specialized_hub" && specializedHub) {
    const hubsCount = tierConfig.limits.specializedHubsCount;
    
    if (hubsCount === "unlimited") {
      return { allowed: true, limit: "unlimited" };
    }
    
    if (hubsCount === 0) {
      return {
        allowed: false,
        reason: `${specializedHub} requires at least Starter tier`,
        upgradeRequired: true,
      };
    }

    // Check if user has selected this hub
    const selectedHubs = user.selectedSpecializedHubs || [];
    
    if (!selectedHubs.includes(specializedHub)) {
      return {
        allowed: false,
        reason: `You haven't selected ${specializedHub}. Please select it in your subscription settings.`,
        upgradeRequired: true,
      };
    }

    return { allowed: true };
  }

  // Check daily usage limits for other features
  let dailyLimit: number | "unlimited" | undefined;
  
  switch (featureType) {
    case "voice_assistant":
      dailyLimit = tierConfig.limits.voiceAssistant;
      break;
    case "iot_device":
      dailyLimit = tierConfig.limits.iotDevices;
      break;
    case "verified_learning":
      dailyLimit = tierConfig.limits.verifiedLearning;
      break;
    case "math_tutor":
      dailyLimit = tierConfig.limits.mathTutor;
      break;
    case "translate":
      dailyLimit = tierConfig.limits.translate;
      break;
    case "image_ocr":
      dailyLimit = tierConfig.limits.imageOcr;
      break;
    default:
      dailyLimit = undefined;
  }

  if (dailyLimit === "unlimited") {
    return { allowed: true, limit: "unlimited" };
  }

  if (dailyLimit === undefined || dailyLimit === 0) {
    return {
      allowed: false,
      reason: `${featureType} is not available in your current tier`,
      upgradeRequired: true,
    };
  }

  // Check current usage from appropriate database
  const currentUsage = await getCurrentUsage(user, featureType);

  if (currentUsage >= dailyLimit) {
    return {
      allowed: false,
      reason: `Daily limit reached (${dailyLimit}/${dailyLimit})`,
      currentUsage,
      limit: dailyLimit,
      upgradeRequired: true,
    };
  }

  return {
    allowed: true,
    currentUsage,
    limit: dailyLimit,
  };
}

/**
 * Get current usage for a user from the appropriate database
 */
async function getCurrentUsage(user: UnifiedUser, featureType: FeatureType): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For Manus users (admin), query Manus DB
  if (user.authProvider === "manus") {
    const db = await getDb();
    if (!db) return 0;

    const userId = typeof user.id === "number" ? user.id : parseInt(String(user.id));
    const usageRecords = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, today)
        )
      )
      .limit(1);

    if (usageRecords.length === 0) return 0;
    return extractUsageFromRecord(usageRecords[0], featureType);
  }

  // For Supabase users, query Supabase DB
  // Note: You'll need to create a dailyUsage table in Supabase DB as well
  // For now, return 0 (no usage tracking for Supabase users yet)
  return 0;
}

/**
 * Extract usage count from a daily usage record
 */
function extractUsageFromRecord(record: any, featureType: FeatureType): number {
  switch (featureType) {
    case "voice_assistant":
      return record.voiceAssistantCount || 0;
    case "verified_learning":
      return record.verifiedLearningCount || 0;
    case "math_tutor":
      return record.mathTutorCount || 0;
    case "translate":
      return record.translateCount || 0;
    case "image_ocr":
      return record.imageOcrCount || 0;
    default:
      return 0;
  }
}

/**
 * Record usage of a feature
 * Routes to appropriate database based on user's auth provider
 */
export async function recordUsage(
  user: UnifiedUser,
  featureType: FeatureType
): Promise<void> {
  // Admin usage is tracked but never blocks access
  if (user.role === 'admin') {
    console.log(`[Access Control] Admin ${user.email} used ${featureType} (unlimited)`);
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For Manus users, record in Manus DB
  if (user.authProvider === "manus") {
    const db = await getDb();
    if (!db) {
      console.warn("[Access Control] Cannot record usage: Manus database unavailable");
      return;
    }

    const userId = typeof user.id === "number" ? user.id : parseInt(String(user.id));
    await recordUsageInManusDb(db, userId, featureType, today);
    return;
  }

  // For Supabase users, record in Supabase DB
  // TODO: Implement Supabase usage tracking
  console.log(`[Access Control] Supabase user ${user.email} used ${featureType}`);
}

/**
 * Record usage in Manus database
 */
async function recordUsageInManusDb(
  db: any,
  userId: number,
  featureType: FeatureType,
  today: Date
): Promise<void> {
  try {
    const existingRecords = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, today)
        )
      )
      .limit(1);

    if (existingRecords.length > 0) {
      // Increment existing record
      const record = existingRecords[0];
      const updates: Record<string, number> = {};
      
      switch (featureType) {
        case "voice_assistant":
          updates.voiceAssistantCount = record.voiceAssistantCount + 1;
          break;
        case "verified_learning":
          updates.verifiedLearningCount = record.verifiedLearningCount + 1;
          break;
        case "math_tutor":
          updates.mathTutorCount = record.mathTutorCount + 1;
          break;
        case "translate":
          updates.translateCount = record.translateCount + 1;
          break;
        case "image_ocr":
          updates.imageOcrCount = record.imageOcrCount + 1;
          break;
      }
      
      await db
        .update(dailyUsage)
        .set(updates)
        .where(eq(dailyUsage.id, record.id));
    } else {
      // Create new record
      const initialValues: Record<string, number | Date> = {
        userId,
        date: today,
        voiceAssistantCount: 0,
        verifiedLearningCount: 0,
        mathTutorCount: 0,
        translateCount: 0,
        imageOcrCount: 0,
      };
      
      switch (featureType) {
        case "voice_assistant":
          initialValues.voiceAssistantCount = 1;
          break;
        case "verified_learning":
          initialValues.verifiedLearningCount = 1;
          break;
        case "math_tutor":
          initialValues.mathTutorCount = 1;
          break;
        case "translate":
          initialValues.translateCount = 1;
          break;
        case "image_ocr":
          initialValues.imageOcrCount = 1;
          break;
      }
      
      await db.insert(dailyUsage).values(initialValues as any);
    }
  } catch (error) {
    console.error("[Access Control] Failed to record usage:", error);
  }
}

/**
 * Get usage statistics for a user
 */
export async function getUsageStats(user: UnifiedUser): Promise<Record<FeatureType, number>> {
  // Admin has unlimited access, no need to track
  if (user.role === 'admin') {
    return {
      voice_assistant: 0,
      iot_device: 0,
      verified_learning: 0,
      math_tutor: 0,
      translate: 0,
      image_ocr: 0,
      specialized_hub: 0,
    };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // For Manus users, query Manus DB
  if (user.authProvider === "manus") {
    const db = await getDb();
    if (!db) {
      console.warn("[Access Control] Cannot get usage stats: database unavailable");
      return {} as Record<FeatureType, number>;
    }

    const userId = typeof user.id === "number" ? user.id : parseInt(String(user.id));
    
    try {
      const records = await db
        .select()
        .from(dailyUsage)
        .where(and(eq(dailyUsage.userId, userId), gte(dailyUsage.date, today)));

      const stats: Record<string, number> = {
        voice_assistant: 0,
        iot_device: 0,
        verified_learning: 0,
        math_tutor: 0,
        translate: 0,
        image_ocr: 0,
        specialized_hub: 0,
      };
      
      if (records.length > 0) {
        const record = records[0];
        stats.voice_assistant = record.voiceAssistantCount;
        stats.verified_learning = record.verifiedLearningCount;
        stats.math_tutor = record.mathTutorCount;
        stats.translate = record.translateCount;
        stats.image_ocr = record.imageOcrCount;
      }

      return stats as Record<FeatureType, number>;
    } catch (error) {
      console.error("[Access Control] Failed to get usage stats:", error);
      return {} as Record<FeatureType, number>;
    }
  }

  // For Supabase users, return empty stats for now
  return {
    voice_assistant: 0,
    iot_device: 0,
    verified_learning: 0,
    math_tutor: 0,
    translate: 0,
    image_ocr: 0,
    specialized_hub: 0,
  };
}
