/**
 * WellbeingAdapter - Interface for wellbeing database operations
 * Supports both MySQL (admin) and Supabase (regular users) backends
 */

import type {
  InsertWorkout,
  InsertUserWorkoutHistory,
  InsertDailyActivityStats,
  InsertFoodLog,
  InsertHydrationLog,
  InsertMeditationSession,
  InsertMoodLog,
  InsertJournalEntry,
  InsertSleepTracking,
  InsertHealthMetric,
  InsertWellbeingReminder,
  InsertWellnessProfile,
  InsertCoachingRecommendation,
  InsertCoachingFeedback,
} from "../../drizzle/schema";

export interface WellbeingAdapter {
  // Workouts & Fitness
  getAllWorkouts(): Promise<any[]>;
  getWorkoutById(id: number): Promise<any | null>;
  getUserWorkoutHistory(userId: number, limit?: number): Promise<any[]>;
  logWorkout(data: InsertUserWorkoutHistory): Promise<void>;
  getDailyActivityStats(userId: number, date: string): Promise<any | null>;
  upsertDailyActivityStats(data: InsertDailyActivityStats): Promise<void>;

  // Nutrition
  getFoodLogByDate(userId: number, date: string): Promise<any[]>;
  addFoodLog(data: InsertFoodLog): Promise<void>;
  deleteFoodLog(id: number, userId: number): Promise<void>;
  getHydrationLogByDate(userId: number, date: string): Promise<any[]>;
  addHydrationLog(data: InsertHydrationLog): Promise<void>;
  getDailyHydrationTotal(userId: number, date: string): Promise<number>;

  // Mental Wellness
  getMeditationSessions(userId: number, limit?: number): Promise<any[]>;
  logMeditationSession(data: InsertMeditationSession): Promise<void>;
  getMoodLogByDate(userId: number, date: string): Promise<any | null>;
  upsertMoodLog(data: InsertMoodLog): Promise<void>;
  getJournalEntries(userId: number, limit?: number): Promise<any[]>;
  addJournalEntry(data: InsertJournalEntry): Promise<void>;
  updateJournalEntry(id: number, userId: number, content: string, title?: string): Promise<void>;
  deleteJournalEntry(id: number, userId: number): Promise<void>;
  getSleepTracking(userId: number, limit?: number): Promise<any[]>;
  addSleepTracking(data: InsertSleepTracking): Promise<void>;

  // Health Metrics
  getHealthMetrics(userId: number, limit?: number): Promise<any[]>;
  addHealthMetric(data: InsertHealthMetric): Promise<void>;
  getWellbeingReminders(userId: number): Promise<any[]>;
  addWellbeingReminder(data: InsertWellbeingReminder): Promise<void>;
  deleteWellbeingReminder(id: number, userId: number): Promise<void>;
  toggleWellbeingReminder(id: number, userId: number, isActive: boolean): Promise<void>;

  // Wellness Profile & Onboarding
  getWellnessProfile(userId: number): Promise<any | null>;
  createWellnessProfile(userId: number, data: Omit<InsertWellnessProfile, "userId">): Promise<{ success: boolean }>;
  updateWellnessProfile(userId: number, data: Partial<Omit<InsertWellnessProfile, "userId">>): Promise<{ success: boolean }>;

  // Coaching Recommendations
  getActiveCoachingRecommendations(userId: number): Promise<any[]>;
  createCoachingRecommendation(data: InsertCoachingRecommendation): Promise<{ success: boolean }>;
  markRecommendationViewed(id: number, userId: number): Promise<{ success: boolean }>;
  dismissRecommendation(id: number, userId: number): Promise<{ success: boolean }>;
  completeRecommendation(id: number, userId: number): Promise<{ success: boolean }>;
  addCoachingFeedback(data: InsertCoachingFeedback): Promise<{ success: boolean }>;

  // Helper functions for date range queries
  getFoodLogByDateRange(userId: number, startDate: Date, endDate: Date): Promise<any[]>;
  getMoodLogByDateRange(userId: number, startDate: Date, endDate: Date): Promise<any[]>;
  getHealthMetricsByDateRange(userId: number, startDate: Date, endDate: Date): Promise<any[]>;
}
