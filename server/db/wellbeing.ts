/**
 * Database helper functions for Wellbeing feature
 */

import { eq, and, desc, sql } from "drizzle-orm";
import { getDb } from "./connection";
import {
  workouts,
  userWorkoutHistory,
  dailyActivityStats,
  foodLog,
  hydrationLog,
  meditationSessions,
  moodLog,
  journalEntries,
  sleepTracking,
  healthMetrics,
  wellbeingReminders,
  wellnessProfiles,
  coachingRecommendations,
  coachingFeedback,
  type InsertWorkout,
  type InsertUserWorkoutHistory,
  type InsertDailyActivityStats,
  type InsertFoodLog,
  type InsertHydrationLog,
  type InsertMeditationSession,
  type InsertMoodLog,
  type InsertJournalEntry,
  type InsertSleepTracking,
  type InsertHealthMetric,
  type InsertWellbeingReminder,
  type InsertWellnessProfile,
  type InsertCoachingRecommendation,
  type InsertCoachingFeedback,
} from "../../drizzle/schema";

// ============================================================================
// WORKOUTS & FITNESS
// ============================================================================

export async function getAllWorkouts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(workouts).orderBy(workouts.title);
}

export async function getWorkoutById(id: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(workouts).where(eq(workouts.id, id)).limit(1);
  return result[0] || null;
}

export async function getUserWorkoutHistory(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(userWorkoutHistory)
    .where(eq(userWorkoutHistory.userId, userId))
    .orderBy(desc(userWorkoutHistory.completedAt))
    .limit(limit);
}

export async function logWorkout(data: InsertUserWorkoutHistory) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(userWorkoutHistory).values(data);
}

export async function getDailyActivityStats(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(dailyActivityStats)
    .where(and(eq(dailyActivityStats.userId, userId), eq(dailyActivityStats.date, date)))
    .limit(1);
  return result[0] || null;
}

export async function upsertDailyActivityStats(data: InsertDailyActivityStats) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getDailyActivityStats(data.userId, data.date);
  
  if (existing) {
    await db
      .update(dailyActivityStats)
      .set({
        steps: data.steps,
        distance: data.distance,
        calories: data.calories,
        activeMinutes: data.activeMinutes,
        updatedAt: new Date(),
      })
      .where(and(eq(dailyActivityStats.userId, data.userId), eq(dailyActivityStats.date, data.date)));
  } else {
    await db.insert(dailyActivityStats).values(data);
  }
}

// ============================================================================
// NUTRITION
// ============================================================================

export async function getFoodLogByDate(userId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(foodLog)
    .where(and(eq(foodLog.userId, userId), eq(foodLog.date, date)))
    .orderBy(foodLog.createdAt);
}

export async function addFoodLog(data: InsertFoodLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(foodLog).values(data);
}

export async function deleteFoodLog(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(foodLog).where(and(eq(foodLog.id, id), eq(foodLog.userId, userId)));
}

export async function getHydrationLogByDate(userId: number, date: string) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(hydrationLog)
    .where(and(eq(hydrationLog.userId, userId), eq(hydrationLog.date, date)))
    .orderBy(hydrationLog.loggedAt);
}

export async function addHydrationLog(data: InsertHydrationLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(hydrationLog).values(data);
}

export async function getDailyHydrationTotal(userId: number, date: string): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const result = await db
    .select({ total: sql<number>`SUM(${hydrationLog.amount})` })
    .from(hydrationLog)
    .where(and(eq(hydrationLog.userId, userId), eq(hydrationLog.date, date)));
  
  return result[0]?.total || 0;
}

// ============================================================================
// MENTAL WELLNESS
// ============================================================================

export async function getMeditationSessions(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(meditationSessions)
    .where(eq(meditationSessions.userId, userId))
    .orderBy(desc(meditationSessions.completedAt))
    .limit(limit);
}

export async function logMeditationSession(data: InsertMeditationSession) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(meditationSessions).values(data);
}

export async function getMoodLogByDate(userId: number, date: string) {
  const db = await getDb();
  if (!db) return null;
  const result = await db
    .select()
    .from(moodLog)
    .where(and(eq(moodLog.userId, userId), eq(moodLog.date, date)))
    .limit(1);
  return result[0] || null;
}

export async function upsertMoodLog(data: InsertMoodLog) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const existing = await getMoodLogByDate(data.userId, data.date);
  
  if (existing) {
    await db
      .update(moodLog)
      .set({
        mood: data.mood,
        energy: data.energy,
        stress: data.stress,
        notes: data.notes,
        factors: data.factors,
      })
      .where(and(eq(moodLog.userId, data.userId), eq(moodLog.date, data.date)));
  } else {
    await db.insert(moodLog).values(data);
  }
}

export async function getJournalEntries(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(journalEntries)
    .where(eq(journalEntries.userId, userId))
    .orderBy(desc(journalEntries.date))
    .limit(limit);
}

export async function addJournalEntry(data: InsertJournalEntry) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(journalEntries).values(data);
}

export async function updateJournalEntry(id: number, userId: number, content: string, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(journalEntries)
    .set({ content, title, updatedAt: new Date() })
    .where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

export async function deleteJournalEntry(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(journalEntries).where(and(eq(journalEntries.id, id), eq(journalEntries.userId, userId)));
}

export async function getSleepTracking(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(sleepTracking)
    .where(eq(sleepTracking.userId, userId))
    .orderBy(desc(sleepTracking.date))
    .limit(limit);
}

export async function addSleepTracking(data: InsertSleepTracking) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(sleepTracking).values(data);
}

// ============================================================================
// HEALTH METRICS
// ============================================================================

export async function getHealthMetrics(userId: number, limit = 30) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(healthMetrics)
    .where(eq(healthMetrics.userId, userId))
    .orderBy(desc(healthMetrics.date))
    .limit(limit);
}

export async function addHealthMetric(data: InsertHealthMetric) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(healthMetrics).values(data);
}

export async function getWellbeingReminders(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db
    .select()
    .from(wellbeingReminders)
    .where(and(eq(wellbeingReminders.userId, userId), eq(wellbeingReminders.isActive, 1)))
    .orderBy(wellbeingReminders.time);
}

export async function addWellbeingReminder(data: InsertWellbeingReminder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(wellbeingReminders).values(data);
}

export async function deleteWellbeingReminder(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(wellbeingReminders).where(and(eq(wellbeingReminders.id, id), eq(wellbeingReminders.userId, userId)));
}

export async function toggleWellbeingReminder(id: number, userId: number, isActive: boolean) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db
    .update(wellbeingReminders)
    .set({ isActive: isActive ? 1 : 0 })
    .where(and(eq(wellbeingReminders.id, id), eq(wellbeingReminders.userId, userId)));
}


// ============================================================================
// WELLNESS PROFILE & ONBOARDING
// ============================================================================

export async function getWellnessProfile(userId: number) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.select().from(wellnessProfiles).where(eq(wellnessProfiles.userId, userId)).limit(1);
  return result[0] || null;
}

export async function createWellnessProfile(userId: number, data: Omit<InsertWellnessProfile, "userId">) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Don't include id (auto-increment) or lastUpdated (has default) in insert
  const { id, lastUpdated, ...profileData } = data as any;
  
  const profile = {
    userId,
    ...profileData,
    completedOnboarding: 1,
    onboardingCompletedAt: new Date(),
  };
  
  await db.insert(wellnessProfiles).values(profile);
  return { success: true };
}

export async function updateWellnessProfile(userId: number, data: Partial<Omit<InsertWellnessProfile, "userId">>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(wellnessProfiles)
    .set({ ...data, lastUpdated: new Date() })
    .where(eq(wellnessProfiles.userId, userId));
  
  return { success: true };
}


// ============================================================================
// COACHING RECOMMENDATIONS
// ============================================================================

export async function getActiveCoachingRecommendations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  return db.select()
    .from(coachingRecommendations)
    .where(
      and(
        eq(coachingRecommendations.userId, userId),
        eq(coachingRecommendations.dismissed, 0),
        eq(coachingRecommendations.completed, 0)
      )
    )
    .orderBy(desc(coachingRecommendations.priority), desc(coachingRecommendations.createdAt))
    .limit(10);
}

export async function createCoachingRecommendation(data: InsertCoachingRecommendation) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(coachingRecommendations).values(data);
  return { success: true };
}

export async function markRecommendationViewed(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(coachingRecommendations)
    .set({ viewed: 1, viewedAt: new Date() })
    .where(and(eq(coachingRecommendations.id, id), eq(coachingRecommendations.userId, userId)));
  
  return { success: true };
}

export async function dismissRecommendation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(coachingRecommendations)
    .set({ dismissed: 1, dismissedAt: new Date() })
    .where(and(eq(coachingRecommendations.id, id), eq(coachingRecommendations.userId, userId)));
  
  return { success: true };
}

export async function completeRecommendation(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.update(coachingRecommendations)
    .set({ completed: 1, completedAt: new Date() })
    .where(and(eq(coachingRecommendations.id, id), eq(coachingRecommendations.userId, userId)));
  
  return { success: true };
}

export async function addCoachingFeedback(data: InsertCoachingFeedback) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(coachingFeedback).values(data);
  return { success: true };
}


// Helper functions for date range queries (used by coaching)
export async function getFoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(foodLog)
    .where(
      and(
        eq(foodLog.userId, userId),
        sql`${foodLog.date} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${foodLog.date} <= ${endDate.toISOString().split('T')[0]}`
      )
    )
    .orderBy(desc(foodLog.date));
}

export async function getMoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(moodLog)
    .where(
      and(
        eq(moodLog.userId, userId),
        sql`${moodLog.date} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${moodLog.date} <= ${endDate.toISOString().split('T')[0]}`
      )
    )
    .orderBy(desc(moodLog.date));
}

export async function getHealthMetricsByDateRange(userId: number, startDate: Date, endDate: Date) {
  const db = await getDb();
  if (!db) return [];
  return db.select()
    .from(healthMetrics)
    .where(
      and(
        eq(healthMetrics.userId, userId),
        sql`${healthMetrics.date} >= ${startDate.toISOString().split('T')[0]}`,
        sql`${healthMetrics.date} <= ${endDate.toISOString().split('T')[0]}`
      )
    )
    .orderBy(desc(healthMetrics.date));
}
