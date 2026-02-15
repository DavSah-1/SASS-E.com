/**
 * Wellbeing router - fitness, nutrition, mental wellness, health metrics
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { lookupProductByBarcode, searchProducts } from "./_core/openFoodFactsApi";
import {
  getAllWorkouts,
  getWorkoutById,
  getUserWorkoutHistory,
  logWorkout,
  getDailyActivityStats,
  upsertDailyActivityStats,
  getFoodLogByDate,
  addFoodLog,
  deleteFoodLog,
  getHydrationLogByDate,
  addHydrationLog,
  getDailyHydrationTotal,
  getMeditationSessions,
  logMeditationSession,
  getMoodLogByDate,
  upsertMoodLog,
  getJournalEntries,
  addJournalEntry,
  updateJournalEntry,
  deleteJournalEntry,
  getSleepTracking,
  addSleepTracking,
  getHealthMetrics,
  addHealthMetric,
  getWellbeingReminders,
  addWellbeingReminder,
  deleteWellbeingReminder,
  toggleWellbeingReminder,
} from "./db/wellbeing";

export const wellbeingRouter = router({
  // ============================================================================
  // FITNESS & WORKOUTS
  // ============================================================================
  
  getWorkouts: protectedProcedure.query(async () => {
    return getAllWorkouts();
  }),

  getWorkoutById: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ input }) => {
      return getWorkoutById(input.id);
    }),

  getWorkoutHistory: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getUserWorkoutHistory(ctx.user.numericId, input.limit);
    }),

  logWorkout: protectedProcedure
    .input(z.object({
      workoutId: z.number().optional(),
      workoutTitle: z.string(),
      duration: z.number(),
      caloriesBurned: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await logWorkout({
        userId: ctx.user.numericId,
        workoutId: input.workoutId,
        workoutTitle: input.workoutTitle,
        duration: input.duration,
        caloriesBurned: input.caloriesBurned,
        notes: input.notes,
      });
      return { success: true };
    }),

  getDailyActivity: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return getDailyActivityStats(ctx.user.numericId, input.date);
    }),

  updateDailyActivity: protectedProcedure
    .input(z.object({
      date: z.string(),
      steps: z.number().optional(),
      distance: z.number().optional(),
      calories: z.number().optional(),
      activeMinutes: z.number().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await upsertDailyActivityStats({
        userId: ctx.user.numericId,
        date: input.date,
        steps: input.steps || 0,
        distance: input.distance || 0,
        calories: input.calories || 0,
        activeMinutes: input.activeMinutes || 0,
      });
      return { success: true };
    }),

  // ============================================================================
  // NUTRITION
  // ============================================================================

  getFoodLog: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return getFoodLogByDate(ctx.user.numericId, input.date);
    }),

  addFoodLog: protectedProcedure
    .input(z.object({
      date: z.string(),
      mealType: z.enum(["breakfast", "lunch", "dinner", "snack"]),
      foodName: z.string(),
      barcode: z.string().optional(),
      servingSize: z.string().optional(),
      servingQuantity: z.number().optional(),
      calories: z.number().optional(),
      protein: z.number().optional(),
      carbs: z.number().optional(),
      fat: z.number().optional(),
      fiber: z.number().optional(),
      sugars: z.number().optional(),
      saturatedFat: z.number().optional(),
      sodium: z.number().optional(),
      cholesterol: z.number().optional(),
      vitaminA: z.number().optional(),
      vitaminC: z.number().optional(),
      calcium: z.number().optional(),
      iron: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      // Convert numeric values to strings for decimal fields
      const foodLogData: any = {
        userId: ctx.user.numericId,
        date: input.date,
        mealType: input.mealType,
        foodName: input.foodName,
        barcode: input.barcode,
        servingSize: input.servingSize,
        servingQuantity: input.servingQuantity?.toString(),
        calories: input.calories?.toString(),
        protein: input.protein?.toString(),
        carbs: input.carbs?.toString(),
        fat: input.fat?.toString(),
        fiber: input.fiber?.toString(),
        sugars: input.sugars?.toString(),
        saturatedFat: input.saturatedFat?.toString(),
        sodium: input.sodium?.toString(),
        cholesterol: input.cholesterol?.toString(),
        vitaminA: input.vitaminA?.toString(),
        vitaminC: input.vitaminC?.toString(),
        calcium: input.calcium?.toString(),
        iron: input.iron?.toString(),
        notes: input.notes,
      };
      await addFoodLog(foodLogData);
      return { success: true };
    }),

  deleteFoodLog: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteFoodLog(input.id, ctx.user.numericId);
      return { success: true };
    }),

  // Food Database - Barcode Scanning & Search
  lookupFoodByBarcode: publicProcedure
    .input(z.object({ barcode: z.string() }))
    .query(async ({ input }) => {
      const product = await lookupProductByBarcode(input.barcode);
      return product;
    }),

  searchFoods: publicProcedure
    .input(z.object({ query: z.string(), limit: z.number().optional() }))
    .query(async ({ input }) => {
      const products = await searchProducts(input.query, input.limit);
      return products;
    }),

  getHydrationLog: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      const logs = await getHydrationLogByDate(ctx.user.numericId, input.date);
      const total = await getDailyHydrationTotal(ctx.user.numericId, input.date);
      return { logs, total };
    }),

  addHydrationLog: protectedProcedure
    .input(z.object({
      date: z.string(),
      amount: z.number(), // in ml
    }))
    .mutation(async ({ ctx, input }) => {
      await addHydrationLog({
        userId: ctx.user.numericId,
        date: input.date,
        amount: input.amount,
      });
      return { success: true };
    }),

  // ============================================================================
  // MENTAL WELLNESS
  // ============================================================================

  getMeditationSessions: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getMeditationSessions(ctx.user.numericId, input.limit);
    }),

  logMeditationSession: protectedProcedure
    .input(z.object({
      type: z.enum(["meditation", "breathing", "sleep", "focus", "stress"]),
      duration: z.number(),
      title: z.string().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await logMeditationSession({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  getMoodLog: protectedProcedure
    .input(z.object({ date: z.string() }))
    .query(async ({ ctx, input }) => {
      return getMoodLogByDate(ctx.user.numericId, input.date);
    }),

  updateMoodLog: protectedProcedure
    .input(z.object({
      date: z.string(),
      mood: z.enum(["great", "good", "okay", "bad", "terrible"]),
      energy: z.number().min(1).max(10).optional(),
      stress: z.number().min(1).max(10).optional(),
      notes: z.string().optional(),
      factors: z.string().optional(), // JSON array
    }))
    .mutation(async ({ ctx, input }) => {
      await upsertMoodLog({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  getJournalEntries: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getJournalEntries(ctx.user.numericId, input.limit);
    }),

  addJournalEntry: protectedProcedure
    .input(z.object({
      date: z.string(),
      title: z.string().optional(),
      content: z.string(),
      prompt: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await addJournalEntry({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  updateJournalEntry: protectedProcedure
    .input(z.object({
      id: z.number(),
      title: z.string().optional(),
      content: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      await updateJournalEntry(input.id, ctx.user.numericId, input.content, input.title);
      return { success: true };
    }),

  deleteJournalEntry: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteJournalEntry(input.id, ctx.user.numericId);
      return { success: true };
    }),

  getSleepTracking: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getSleepTracking(ctx.user.numericId, input.limit);
    }),

  addSleepTracking: protectedProcedure
    .input(z.object({
      date: z.string(),
      bedtime: z.string(), // HH:MM
      wakeTime: z.string(), // HH:MM
      duration: z.number(), // minutes
      quality: z.enum(["excellent", "good", "fair", "poor"]),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await addSleepTracking({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  // ============================================================================
  // HEALTH METRICS
  // ============================================================================

  getHealthMetrics: protectedProcedure
    .input(z.object({ limit: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      return getHealthMetrics(ctx.user.numericId, input.limit);
    }),

  addHealthMetric: protectedProcedure
    .input(z.object({
      date: z.string(),
      weight: z.number().optional(), // in grams
      bodyFatPercentage: z.number().optional(), // stored as integer (e.g., 185 = 18.5%)
      muscleMass: z.number().optional(), // in grams
      restingHeartRate: z.number().optional(),
      bloodPressureSystolic: z.number().optional(),
      bloodPressureDiastolic: z.number().optional(),
      notes: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await addHealthMetric({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  getReminders: protectedProcedure.query(async ({ ctx }) => {
    return getWellbeingReminders(ctx.user.numericId);
  }),

  addReminder: protectedProcedure
    .input(z.object({
      type: z.enum(["medication", "hydration", "exercise", "meditation", "custom"]),
      title: z.string(),
      description: z.string().optional(),
      time: z.string(), // HH:MM
      frequency: z.enum(["daily", "weekly", "custom"]),
    }))
    .mutation(async ({ ctx, input }) => {
      await addWellbeingReminder({
        userId: ctx.user.numericId,
        ...input,
      });
      return { success: true };
    }),

  deleteReminder: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteWellbeingReminder(input.id, ctx.user.numericId);
      return { success: true };
    }),

  toggleReminder: protectedProcedure
    .input(z.object({
      id: z.number(),
      isActive: z.boolean(),
    }))
    .mutation(async ({ ctx, input }) => {
      await toggleWellbeingReminder(input.id, ctx.user.numericId, input.isActive);
      return { success: true };
    }),

  // ============================================================================
  // WELLNESS ONBOARDING & PROFILE
  // ============================================================================

  getWellnessProfile: protectedProcedure.query(async ({ ctx }) => {
    const { getWellnessProfile } = await import("./db/wellbeing");
    return getWellnessProfile(ctx.user.numericId);
  }),

  createWellnessProfile: protectedProcedure
    .input(z.object({
      fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]),
      primaryGoals: z.string(),
      activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
      sleepHoursPerNight: z.number().optional(),
      dietPreference: z.string().optional(),
      challenges: z.string().optional(),
      availableEquipment: z.string().optional(),
      workoutDaysPerWeek: z.number().optional(),
      workoutDurationPreference: z.number().optional(),
      medicalConditions: z.string().nullable().optional(),
      injuries: z.string().nullable().optional(),
      preferredWorkoutTypes: z.string().optional(),
      preferredWorkoutTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { createWellnessProfile } = await import("./db/wellbeing");
      return createWellnessProfile(ctx.user.numericId, input);
    }),

  updateWellnessProfile: protectedProcedure
    .input(z.object({
      fitnessLevel: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      primaryGoals: z.string().optional(),
      activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]).optional(),
      sleepHoursPerNight: z.number().optional(),
      dietPreference: z.string().optional(),
      challenges: z.string().optional(),
      availableEquipment: z.string().optional(),
      workoutDaysPerWeek: z.number().optional(),
      workoutDurationPreference: z.number().optional(),
      medicalConditions: z.string().nullable().optional(),
      injuries: z.string().nullable().optional(),
      preferredWorkoutTypes: z.string().optional(),
      preferredWorkoutTime: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { updateWellnessProfile } = await import("./db/wellbeing");
      return updateWellnessProfile(ctx.user.numericId, input);
    }),

  // ============================================================================
  // AI COACHING
  // ============================================================================

  getCoachingRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const { getActiveCoachingRecommendations } = await import("./db/wellbeing");
    return getActiveCoachingRecommendations(ctx.user.numericId);
  }),

  generateCoaching: protectedProcedure.mutation(async ({ ctx }) => {
    const { generateCoachingRecommendations } = await import("./coachingService");
    const {
      getWellnessProfile,
      getUserWorkoutHistory,
      getFoodLogByDateRange,
      getMoodLogByDateRange,
      getHealthMetricsByDateRange,
    } = await import("./db/wellbeing");

    // Gather user data
    const profile = await getWellnessProfile(ctx.user.numericId);
    if (!profile) {
      throw new Error("Please complete onboarding first");
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentWorkouts = await getUserWorkoutHistory(ctx.user.numericId, 7);
    const recentMeals = await getFoodLogByDateRange(ctx.user.numericId, sevenDaysAgo, new Date());
    const recentMoods = await getMoodLogByDateRange(ctx.user.numericId, sevenDaysAgo, new Date());
    const recentMetrics = await getHealthMetricsByDateRange(ctx.user.numericId, sevenDaysAgo, new Date());

    const daysSinceOnboarding = Math.floor(
      (new Date().getTime() - new Date(profile.onboardingCompletedAt).getTime()) / (1000 * 60 * 60 * 24)
    );

    // Generate recommendations
    const recommendations = await generateCoachingRecommendations({
      profile,
      recentWorkouts,
      recentMeals,
      recentMoods,
      recentMetrics,
      daysSinceOnboarding,
    });

    // Save to database
    const { createCoachingRecommendation } = await import("./db/wellbeing");
    for (const rec of recommendations) {
      await createCoachingRecommendation({
        userId: ctx.user.numericId,
        recommendationType: rec.type,
        title: rec.title,
        content: rec.content,
        reasoning: rec.reasoning,
        priority: rec.priority,
        actionable: rec.actionable ? 1 : 0,
        actionUrl: rec.actionUrl || null,
        basedOnData: JSON.stringify({
          workouts: recentWorkouts.length,
          meals: recentMeals.length,
          daysSinceStart: daysSinceOnboarding,
        }),
      });
    }

    return { success: true, count: recommendations.length };
  }),

  markRecommendationViewed: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { markRecommendationViewed } = await import("./db/wellbeing");
      return markRecommendationViewed(input.id, ctx.user.numericId);
    }),

  dismissRecommendation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { dismissRecommendation } = await import("./db/wellbeing");
      return dismissRecommendation(input.id, ctx.user.numericId);
    }),

  completeRecommendation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const { completeRecommendation } = await import("./db/wellbeing");
      return completeRecommendation(input.id, ctx.user.numericId);
    }),

  addCoachingFeedback: protectedProcedure
    .input(z.object({
      recommendationId: z.number(),
      helpful: z.number().optional(),
      rating: z.number().optional(),
      comment: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { addCoachingFeedback } = await import("./db/wellbeing");
      return addCoachingFeedback({
        recommendationId: input.recommendationId,
        userId: ctx.user.numericId,
        helpful: input.helpful,
        rating: input.rating,
        comment: input.comment,
      });
    }),
});
