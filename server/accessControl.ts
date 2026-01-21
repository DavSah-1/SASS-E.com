import { eq, and, gte } from "drizzle-orm";
import { getDb } from "./db";
import { users, dailyUsage } from "../drizzle/schema";
import { PRICING_TIERS, type SubscriptionTier, type SpecializedHub } from "../shared/pricing";
import { ENV } from "./_core/env";

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
 * Owner (OWNER_OPEN_ID) always gets unlimited access
 */
export async function checkFeatureAccess(
  userId: number,
  userOpenId: string,
  subscriptionTier: SubscriptionTier,
  featureType: FeatureType,
  specializedHub?: SpecializedHub
): Promise<FeatureAccessResult> {
  // Owner bypass: always allow unlimited access
  if (userOpenId === ENV.ownerOpenId) {
    return {
      allowed: true,
      reason: "Owner has unlimited access",
      limit: "unlimited",
    };
  }

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

    // Check if user has selected this hub (would need to query user's selectedSpecializedHubs)
    const db = await getDb();
    if (!db) {
      return { allowed: false, reason: "Database unavailable" };
    }

    const user = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    if (user.length === 0) {
      return { allowed: false, reason: "User not found" };
    }

    const selectedHubsStr = user[0].selectedSpecializedHubs;
    let selectedHubs: SpecializedHub[] = [];
    if (selectedHubsStr) {
      try {
        selectedHubs = JSON.parse(selectedHubsStr) as SpecializedHub[];
      } catch (e) {
        console.error("Failed to parse selectedSpecializedHubs:", e);
      }
    }
    
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

  // Check current usage
  const db = await getDb();
  if (!db) {
    return { allowed: false, reason: "Database unavailable" };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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

  let currentUsage = 0;
  if (usageRecords.length > 0) {
    const record = usageRecords[0];
    switch (featureType) {
      case "voice_assistant":
        currentUsage = record.voiceAssistantCount;
        break;
      case "verified_learning":
        currentUsage = record.verifiedLearningCount;
        break;
      case "math_tutor":
        currentUsage = record.mathTutorCount;
        break;
      case "translate":
        currentUsage = record.translateCount;
        break;
      case "image_ocr":
        currentUsage = record.imageOcrCount;
        break;
    }
  }

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
 * Record usage of a feature
 * Owner usage is tracked but never blocks access
 */
export async function recordUsage(
  userId: number,
  featureType: FeatureType
): Promise<void> {
  const db = await getDb();
  if (!db) {
    console.warn("[Access Control] Cannot record usage: database unavailable");
    return;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
export async function getUsageStats(userId: number): Promise<Record<FeatureType, number>> {
  const db = await getDb();
  if (!db) {
    console.warn("[Access Control] Cannot get usage stats: database unavailable");
    return {} as Record<FeatureType, number>;
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
