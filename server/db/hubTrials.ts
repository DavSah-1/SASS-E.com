import { and, eq, gte, or, sql, count } from "drizzle-orm";
import {
  DailyUsage,
  HubTrial,
  InsertHubTrial,
  dailyUsage,
  hubTrials,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";



// ============================================================================
// Hub Trial Management Functions
// ============================================================================

/**
 * Start a free trial for a specialized hub with dynamic duration
 * Trial duration depends on subscription tier and period:
 * - Free: 5 days (all periods)
 * - Starter/Pro Monthly: 5 days
 * - Starter/Pro 6-Month: 10 days
 * - Starter/Pro Annual: 20 days
 */
export async function startHubTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<HubTrial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot start hub trial: database not available");
    return null;
  }

  try {
    // Check if user already has a trial for this hub
    const existingTrial = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    if (existingTrial.length > 0) {
      console.warn(`[Database] User ${userId} already has a trial for ${hubId}`);
      return null;
    }

    // Get user's subscription tier and period to calculate trial duration
    const userRecords = await db
      .select()
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (userRecords.length === 0) {
      console.warn(`[Database] User ${userId} not found`);
      return null;
    }

    const user = userRecords[0];
    const tier = user.subscriptionTier || "free";
    const period = user.subscriptionPeriod || "monthly";

    // Calculate trial duration based on tier and subscription period
    let trialDays = 5; // Default for Free tier and monthly subscriptions
    
    if (tier === "starter" || tier === "pro") {
      if (period === "six_month") {
        trialDays = 10;
      } else if (period === "annual") {
        trialDays = 20;
      }
    }

    // Calculate expiration date
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setDate(expiresAt.getDate() + trialDays);

    // Create trial record
    const trialData: InsertHubTrial = {
      userId,
      hubId,
      status: "active",
      startedAt,
      expiresAt,
    };

    await db.insert(hubTrials).values(trialData);

    // Fetch and return the created trial
    const createdTrial = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    console.log(`[Database] Started ${trialDays}-day trial for user ${userId} on ${hubId} (tier: ${tier}, period: ${period})`);
    return createdTrial[0] || null;
  } catch (error) {
    console.error("[Database] Failed to start hub trial:", error);
    return null;
  }
}


/**
 * Get active trial for a specific hub
 * Returns null if no active trial exists
 */
export async function getActiveTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<HubTrial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active trial: database not available");
    return null;
  }

  try {
    const trials = await db
      .select()
      .from(hubTrials)
      .where(
        and(
          eq(hubTrials.userId, userId),
          eq(hubTrials.hubId, hubId),
          eq(hubTrials.status, "active")
        )
      )
      .limit(1);

    if (trials.length === 0) {
      return null;
    }

    const trial = trials[0];
    const now = new Date();

    // Check if trial has expired
    if (trial.expiresAt < now) {
      // Mark as expired
      await db
        .update(hubTrials)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(hubTrials.id, trial.id));

      return null;
    }

    return trial;
  } catch (error) {
    console.error("[Database] Failed to get active trial:", error);
    return null;
  }
}


/**
 * Get all trials for a user (active and expired)
 */
export async function getUserTrials(userId: number): Promise<HubTrial[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user trials: database not available");
    return [];
  }

  try {
    const trials = await db
      .select()
      .from(hubTrials)
      .where(eq(hubTrials.userId, userId));

    return trials;
  } catch (error) {
    console.error("[Database] Failed to get user trials:", error);
    return [];
  }
}


/**
 * Check if user can start a trial for a hub
 * Returns false if they've already used their trial
 */
export async function canStartTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check trial eligibility: database not available");
    return false;
  }

  try {
    const existingTrials = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    // Can start trial if no previous trial exists
    return existingTrials.length === 0;
  } catch (error) {
    console.error("[Database] Failed to check trial eligibility:", error);
    return false;
  }
}


/**
 * Mark trial as converted (user upgraded to paid tier)
 */
export async function convertTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot convert trial: database not available");
    return false;
  }

  try {
    await db
      .update(hubTrials)
      .set({ status: "converted", updatedAt: new Date() })
      .where(
        and(
          eq(hubTrials.userId, userId),
          eq(hubTrials.hubId, hubId)
        )
      );

    console.log(`[Database] Converted trial for user ${userId} on ${hubId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to convert trial:", error);
    return false;
  }
}



/**
 * Get or create today's usage record for a user
 */
export async function getTodayUsage(userId: number): Promise<DailyUsage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get today's usage: database not available");
    return null;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new record for today
    const [newRecord] = await db
      .insert(dailyUsage)
      .values({
        userId,
        date: today,
        voiceAssistantCount: 0,
        verifiedLearningCount: 0,
        mathTutorCount: 0,
        translateCount: 0,
        imageOcrCount: 0,
      });

    const created = await db
      .select()
      .from(dailyUsage)
      .where(eq(dailyUsage.id, newRecord.insertId))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get today's usage:", error);
    return null;
  }
}


/**
 * Increment usage count for a specific feature
 */
export async function incrementUsage(
  userId: number,
  featureType: "voice_chat" | "translation" | "image_translation" | "learning_session"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment usage: database not available");
    return false;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's record
    let usage = await getTodayUsage(userId);
    if (!usage) {
      return false;
    }

    // Increment the appropriate counter based on feature type
    if (featureType === "voice_chat") {
      await db
        .update(dailyUsage)
        .set({
          voiceAssistantCount: sql`${dailyUsage.voiceAssistantCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "translation") {
      await db
        .update(dailyUsage)
        .set({
          translateCount: sql`${dailyUsage.translateCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "image_translation") {
      await db
        .update(dailyUsage)
        .set({
          imageOcrCount: sql`${dailyUsage.imageOcrCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "learning_session") {
      await db
        .update(dailyUsage)
        .set({
          verifiedLearningCount: sql`${dailyUsage.verifiedLearningCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    }

    console.log(`[Database] Incremented ${featureType} usage for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment usage:", error);
    return false;
  }
}
