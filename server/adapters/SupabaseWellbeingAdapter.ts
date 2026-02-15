/**
 * SupabaseWellbeingAdapter - Supabase implementation of WellbeingAdapter
 * Uses Supabase client for regular users with RLS enforcement
 */

import type { SupabaseClient } from "@supabase/supabase-js";
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
import { getSupabaseClient } from "../supabaseClient";

export class SupabaseWellbeingAdapter implements WellbeingAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  // Workouts & Fitness
  async getAllWorkouts() {
    const client = await this.getClient();
    const { data, error } = await client.from("workouts").select("*").order("title");
    if (error) throw error;
    return data || [];
  }

  async getWorkoutById(id: number) {
    const client = await this.getClient();
    const { data, error } = await client.from("workouts").select("*").eq("id", id).single();
    if (error) return null;
    return data;
  }

  async getUserWorkoutHistory(userId: number, limit = 30) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("user_workout_history")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async logWorkout(data: InsertUserWorkoutHistory) {
    const client = await this.getClient();
    const { error } = await client.from("user_workout_history").insert(data as any);
    if (error) throw error;
  }

  async getDailyActivityStats(userId: number, date: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("daily_activity_stats")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    if (error) return null;
    return data;
  }

  async upsertDailyActivityStats(data: InsertDailyActivityStats) {
    const client = await this.getClient();
    const { error } = await client.from("daily_activity_stats").upsert(data as any);
    if (error) throw error;
  }

  // Nutrition
  async getFoodLogByDate(userId: number, date: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("food_log")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("created_at");
    if (error) throw error;
    return data || [];
  }

  async addFoodLog(data: InsertFoodLog) {
    const client = await this.getClient();
    const { error } = await client.from("food_log").insert(data as any);
    if (error) throw error;
  }

  async deleteFoodLog(id: number, userId: number) {
    const client = await this.getClient();
    const { error} = await client.from("food_log").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async getHydrationLogByDate(userId: number, date: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("hydration_log")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .order("logged_at");
    if (error) throw error;
    return data || [];
  }

  async addHydrationLog(data: InsertHydrationLog) {
    const client = await this.getClient();
    const { error } = await client.from("hydration_log").insert(data as any);
    if (error) throw error;
  }

  async getDailyHydrationTotal(userId: number, date: string): Promise<number> {
    const client = await this.getClient();
    const { data, error } = await client
      .from("hydration_log")
      .select("amount")
      .eq("user_id", userId)
      .eq("date", date);
    if (error) throw error;
    return data?.reduce((sum, log) => sum + (log.amount || 0), 0) || 0;
  }

  // Mental Wellness
  async getMeditationSessions(userId: number, limit = 30) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("meditation_sessions")
      .select("*")
      .eq("user_id", userId)
      .order("completed_at", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async logMeditationSession(data: InsertMeditationSession) {
    const client = await this.getClient();
    const { error } = await client.from("meditation_sessions").insert(data as any);
    if (error) throw error;
  }

  async getMoodLogByDate(userId: number, date: string) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("mood_log")
      .select("*")
      .eq("user_id", userId)
      .eq("date", date)
      .single();
    if (error) return null;
    return data;
  }

  async upsertMoodLog(data: InsertMoodLog) {
    const client = await this.getClient();
    const { error } = await client.from("mood_log").upsert(data as any);
    if (error) throw error;
  }

  async getJournalEntries(userId: number, limit = 30) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("journal_entries")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async addJournalEntry(data: InsertJournalEntry) {
    const client = await this.getClient();
    const { error } = await client.from("journal_entries").insert(data as any);
    if (error) throw error;
  }

  async updateJournalEntry(id: number, userId: number, content: string, title?: string) {
    const client = await this.getClient();
    const { error } = await client
      .from("journal_entries")
      .update({ content, title, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  async deleteJournalEntry(id: number, userId: number) {
    const client = await this.getClient();
    const { error } = await client.from("journal_entries").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async getSleepTracking(userId: number, limit = 30) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("sleep_tracking")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async addSleepTracking(data: InsertSleepTracking) {
    const client = await this.getClient();
    const { error } = await client.from("sleep_tracking").insert(data as any);
    if (error) throw error;
  }

  // Health Metrics
  async getHealthMetrics(userId: number, limit = 30) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
      .order("date", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return data || [];
  }

  async addHealthMetric(data: InsertHealthMetric) {
    const client = await this.getClient();
    const { error } = await client.from("health_metrics").insert(data as any);
    if (error) throw error;
  }

  async getWellbeingReminders(userId: number) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("wellbeing_reminders")
      .select("*")
      .eq("user_id", userId)
      .eq("is_active", true)
      .order("time");
    if (error) throw error;
    return data || [];
  }

  async addWellbeingReminder(data: InsertWellbeingReminder) {
    const client = await this.getClient();
    const { error } = await client.from("wellbeing_reminders").insert(data as any);
    if (error) throw error;
  }

  async deleteWellbeingReminder(id: number, userId: number) {
    const client = await this.getClient();
    const { error } = await client.from("wellbeing_reminders").delete().eq("id", id).eq("user_id", userId);
    if (error) throw error;
  }

  async toggleWellbeingReminder(id: number, userId: number, isActive: boolean) {
    const client = await this.getClient();
    const { error } = await client
      .from("wellbeing_reminders")
      .update({ is_active: isActive })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
  }

  // Wellness Profile & Onboarding
  async getWellnessProfile(userId: number) {
    const client = await this.getClient();
    const { data, error } = await client.from("wellness_profiles").select("*").eq("user_id", userId).single();
    if (error) return null;
    return data;
  }

  async createWellnessProfile(userId: number, data: Omit<InsertWellnessProfile, "userId">) {
    const client = await this.getClient();
    const { id, lastUpdated, ...profileData } = data as any;
    const profile = {
      user_id: userId,
      ...profileData,
      completed_onboarding: true,
      onboarding_completed_at: new Date().toISOString(),
    };
    const { error } = await client.from("wellness_profiles").insert(profile);
    if (error) throw error;
    return { success: true };
  }

  async updateWellnessProfile(userId: number, data: Partial<Omit<InsertWellnessProfile, "userId">>) {
    const client = await this.getClient();
    const { error } = await client
      .from("wellness_profiles")
      .update({ ...data, last_updated: new Date().toISOString() })
      .eq("user_id", userId);
    if (error) throw error;
    return { success: true };
  }

  // Coaching Recommendations
  async getActiveCoachingRecommendations(userId: number) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("coaching_recommendations")
      .select("*")
      .eq("user_id", userId)
      .eq("dismissed", false)
      .eq("completed", false)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10);
    if (error) throw error;
    return data || [];
  }

  async createCoachingRecommendation(data: InsertCoachingRecommendation) {
    const client = await this.getClient();
    const { error } = await client.from("coaching_recommendations").insert(data as any);
    if (error) throw error;
    return { success: true };
  }

  async markRecommendationViewed(id: number, userId: number) {
    const client = await this.getClient();
    const { error } = await client
      .from("coaching_recommendations")
      .update({ viewed: true, viewed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { success: true };
  }

  async dismissRecommendation(id: number, userId: number) {
    const client = await this.getClient();
    const { error } = await client
      .from("coaching_recommendations")
      .update({ dismissed: true, dismissed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { success: true };
  }

  async completeRecommendation(id: number, userId: number) {
    const client = await this.getClient();
    const { error } = await client
      .from("coaching_recommendations")
      .update({ completed: true, completed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", userId);
    if (error) throw error;
    return { success: true };
  }

  async addCoachingFeedback(data: InsertCoachingFeedback) {
    const client = await this.getClient();
    const { error } = await client.from("coaching_feedback").insert(data as any);
    if (error) throw error;
    return { success: true };
  }

  // Helper functions for date range queries
  async getFoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("food_log")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getMoodLogByDateRange(userId: number, startDate: Date, endDate: Date) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("mood_log")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }

  async getHealthMetricsByDateRange(userId: number, startDate: Date, endDate: Date) {
    const client = await this.getClient();
    const { data, error } = await client
      .from("health_metrics")
      .select("*")
      .eq("user_id", userId)
      .gte("date", startDate.toISOString().split("T")[0])
      .lte("date", endDate.toISOString().split("T")[0])
      .order("date", { ascending: false });
    if (error) throw error;
    return data || [];
  }
}
