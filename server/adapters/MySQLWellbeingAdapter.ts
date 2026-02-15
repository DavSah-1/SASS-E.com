/**
 * MySQLWellbeingAdapter - MySQL implementation of WellbeingAdapter
 * Delegates to server/db/wellbeing.ts functions
 */

import type { WellbeingAdapter } from "./WellbeingAdapter";
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

import * as wellbeingDb from "../db/wellbeing";

export class MySQLWellbeingAdapter implements WellbeingAdapter {
  // Workouts & Fitness
  async getAllWorkouts() {
    return wellbeingDb.getAllWorkouts();
  }

  async getWorkoutById(id: number) {
    return wellbeingDb.getWorkoutById(id);
  }

  async getUserWorkoutHistory(userId: number, limit = 30) {
    return wellbeingDb.getUserWorkoutHistory(userId, limit);
  }

  async logWorkout(data: InsertUserWorkoutHistory) {
    return wellbeingDb.logWorkout(data);
  }

  async getDailyActivityStats(userId: number, date: string) {
    return wellbeingDb.getDailyActivityStats(userId, date);
  }

  async upsertDailyActivityStats(data: InsertDailyActivityStats) {
    return wellbeingDb.upsertDailyActivityStats(data);
  }

  // Nutrition
  async getFoodLogByDate(userId: number, date: string) {
    return wellbeingDb.getFoodLogByDate(userId, date);
  }

  async addFoodLog(data: InsertFoodLog) {
    return wellbeingDb.addFoodLog(data);
  }

  async deleteFoodLog(id: number, userId: number) {
    return wellbeingDb.deleteFoodLog(id, userId);
  }

  async getHydrationLogByDate(userId: number, date: string) {
    return wellbeingDb.getHydrationLogByDate(userId, date);
  }

  async addHydrationLog(data: InsertHydrationLog) {
    return wellbeingDb.addHydrationLog(data);
  }

  async getDailyHydrationTotal(userId: number, date: string) {
    return wellbeingDb.getDailyHydrationTotal(userId, date);
  }

  // Mental Wellness
  async getMeditationSessions(userId: number, limit = 30) {
    return wellbeingDb.getMeditationSessions(userId, limit);
  }

  async logMeditationSession(data: InsertMeditationSession) {
    return wellbeingDb.logMeditationSession(data);
  }

  async getMoodLogByDate(userId: number, date: string) {
    return wellbeingDb.getMoodLogByDate(userId, date);
  }

  async upsertMoodLog(data: InsertMoodLog) {
    return wellbeingDb.upsertMoodLog(data);
  }

  async getJournalEntries(userId: number, limit = 30) {
    return wellbeingDb.getJournalEntries(userId, limit);
  }

  async addJournalEntry(data: InsertJournalEntry) {
    return wellbeingDb.addJournalEntry(data);
  }

  async updateJournalEntry(id: number, userId: number, content: string, title?: string) {
    return wellbeingDb.updateJournalEntry(id, userId, content, title);
  }

  async deleteJournalEntry(id: number, userId: number) {
    return wellbeingDb.deleteJournalEntry(id, userId);
  }

  async getSleepTracking(userId: number, limit = 30) {
    return wellbeingDb.getSleepTracking(userId, limit);
  }

  async addSleepTracking(data: InsertSleepTracking) {
    return wellbeingDb.addSleepTracking(data);
  }

  // Health Metrics
  async getHealthMetrics(userId: number, limit = 30) {
    return wellbeingDb.getHealthMetrics(userId, limit);
  }

  async addHealthMetric(data: InsertHealthMetric) {
    return wellbeingDb.addHealthMetric(data);
  }

  async getWellbeingReminders(userId: number) {
    return wellbeingDb.getWellbeingReminders(userId);
  }

  async addWellbeingReminder(data: InsertWellbeingReminder) {
    return wellbeingDb.addWellbeingReminder(data);
  }

  async deleteWellbeingReminder(id: number, userId: number) {
    return wellbeingDb.deleteWellbeingReminder(id, userId);
  }

  async toggleWellbeingReminder(id: number, userId: number, isActive: boolean) {
    return wellbeingDb.toggleWellbeingReminder(id, userId, isActive);
  }

  // Wellness Profile & Onboarding
  async getWellnessProfile(userId: number) {
    return wellbeingDb.getWellnessProfile(userId);
  }

  async createWellnessProfile(userId: number, data: Omit<InsertWellnessProfile, "userId">) {
    return wellbeingDb.createWellnessProfile(userId, data);
  }

  async updateWellnessProfile(userId: number, data: Partial<Omit<InsertWellnessProfile, "userId">>) {
    return wellbeingDb.updateWellnessProfile(userId, data);
  }

  // Coaching Recommendations
  async getActiveCoachingRecommendations(userId: number) {
    return wellbeingDb.getActiveCoachingRecommendations(userId);
  }

  async createCoachingRecommendation(data: InsertCoachingRecommendation) {
    return wellbeingDb.createCoachingRecommendation(data);
  }

  async markRecommendationViewed(id: number, userId: number) {
    return wellbeingDb.markRecommendationViewed(id, userId);
  }

  async dismissRecommendation(id: number, userId: number) {
    return wellbeingDb.dismissRecommendation(id, userId);
  }

  async completeRecommendation(id: number, userId: number) {
    return wellbeingDb.completeRecommendation(id, userId);
  }

  async addCoachingFeedback(data: InsertCoachingFeedback) {
    return wellbeingDb.addCoachingFeedback(data);
  }

  // Helper functions for date range queries
  async getFoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
    return wellbeingDb.getFoodLogByDateRange(userId, startDate, endDate);
  }

  async getMoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
    return wellbeingDb.getMoodLogByDateRange(userId, startDate, endDate);
  }

  async getHealthMetricsByDateRange(userId: number, startDate: Date, endDate: Date) {
    return wellbeingDb.getHealthMetricsByDateRange(userId, startDate, endDate);
  }
}
