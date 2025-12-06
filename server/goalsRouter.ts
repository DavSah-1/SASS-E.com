import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  createFinancialGoal,
  getUserGoals,
  getGoalById,
  updateFinancialGoal,
  deleteFinancialGoal,
  recordGoalProgress,
  getGoalProgressHistory,
  getGoalMilestones,
  getUnshownCelebrations,
  markMilestoneCelebrationShown,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const goalsRouter = router({
  /**
   * Create a new financial goal
   */
  createGoal: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(255),
        description: z.string().optional(),
        type: z.enum(["savings", "debt_free", "emergency_fund", "investment", "purchase", "custom"]),
        targetAmount: z.number().int().positive(),
        currentAmount: z.number().int().min(0).default(0),
        targetDate: z.string().optional(), // ISO date string
        priority: z.number().int().min(0).default(0),
        icon: z.string().max(10).default("🎯"),
        color: z.string().max(20).default("#10b981"),
        isAutoTracked: z.boolean().default(false),
        linkedCategoryId: z.number().int().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goalId = await createFinancialGoal({
        userId: ctx.user.id,
        name: input.name,
        description: input.description,
        type: input.type,
        targetAmount: input.targetAmount,
        currentAmount: input.currentAmount,
        targetDate: input.targetDate ? new Date(input.targetDate) : undefined,
        priority: input.priority,
        icon: input.icon,
        color: input.color,
        isAutoTracked: input.isAutoTracked ? 1 : 0,
        linkedCategoryId: input.linkedCategoryId,
      });

      return { goalId, success: true };
    }),

  /**
   * Get all goals for the current user
   */
  getGoals: protectedProcedure
    .input(
      z.object({
        includeCompleted: z.boolean().default(false),
      })
    )
    .query(async ({ ctx, input }) => {
      const goals = await getUserGoals(ctx.user.id, input.includeCompleted);
      return goals;
    }),

  /**
   * Get a single goal by ID
   */
  getGoal: protectedProcedure
    .input(z.object({ goalId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      return goal;
    }),

  /**
   * Update a goal
   */
  updateGoal: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
        name: z.string().min(1).max(255).optional(),
        description: z.string().optional(),
        targetAmount: z.number().int().positive().optional(),
        targetDate: z.string().optional(),
        status: z.enum(["active", "completed", "paused", "cancelled"]).optional(),
        priority: z.number().int().min(0).optional(),
        icon: z.string().max(10).optional(),
        color: z.string().max(20).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      const updates: any = {};
      if (input.name !== undefined) updates.name = input.name;
      if (input.description !== undefined) updates.description = input.description;
      if (input.targetAmount !== undefined) updates.targetAmount = input.targetAmount;
      if (input.targetDate !== undefined) updates.targetDate = new Date(input.targetDate);
      if (input.status !== undefined) updates.status = input.status;
      if (input.priority !== undefined) updates.priority = input.priority;
      if (input.icon !== undefined) updates.icon = input.icon;
      if (input.color !== undefined) updates.color = input.color;

      await updateFinancialGoal(input.goalId, updates);

      return { success: true };
    }),

  /**
   * Delete a goal
   */
  deleteGoal: protectedProcedure
    .input(z.object({ goalId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      await deleteFinancialGoal(input.goalId);

      return { success: true };
    }),

  /**
   * Record progress update for a goal
   */
  recordProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
        amount: z.number().int(), // Can be positive or negative
        note: z.string().max(255).optional(),
        source: z.enum(["manual", "auto_budget", "auto_debt"]).default("manual"),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      const newTotal = await recordGoalProgress(
        input.goalId,
        input.amount,
        input.note,
        input.source
      );

      return { newTotal, success: true };
    }),

  /**
   * Get progress history for a goal
   */
  getProgressHistory: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
        limit: z.number().int().min(1).max(100).default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      const history = await getGoalProgressHistory(input.goalId, input.limit);
      return history;
    }),

  /**
   * Get milestones for a goal
   */
  getMilestones: protectedProcedure
    .input(z.object({ goalId: z.number().int() }))
    .query(async ({ ctx, input }) => {
      const goal = await getGoalById(input.goalId);
      
      if (!goal || goal.userId !== ctx.user.id) {
        throw new Error("Goal not found or access denied");
      }

      const milestones = await getGoalMilestones(input.goalId);
      return milestones;
    }),

  /**
   * Get unshown milestone celebrations
   */
  getUnshownCelebrations: protectedProcedure.query(async ({ ctx }) => {
    const celebrations = await getUnshownCelebrations(ctx.user.id);
    return celebrations;
  }),

  /**
   * Mark milestone celebration as shown
   */
  markCelebrationShown: protectedProcedure
    .input(z.object({ milestoneId: z.number().int() }))
    .mutation(async ({ ctx, input }) => {
      await markMilestoneCelebrationShown(input.milestoneId);
      return { success: true };
    }),

  /**
   * Get AI-powered goal recommendations
   */
  getGoalRecommendations: protectedProcedure.query(async ({ ctx }) => {
    const goals = await getUserGoals(ctx.user.id, false);
    
    // Generate recommendations using LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "You are a financial advisor helping users set realistic financial goals. Provide 3-5 specific, actionable goal recommendations based on common financial planning principles.",
        },
        {
          role: "user",
          content: `The user currently has ${goals.length} active financial goals. Suggest additional goals they might consider, focusing on: emergency fund, debt elimination, retirement savings, and major purchases. Keep recommendations concise and motivating.`,
        },
      ],
    });

    const recommendationsText = response.choices[0]?.message?.content || "";

    return {
      recommendations: recommendationsText,
      currentGoalsCount: goals.length,
    };
  }),

  /**
   * Get goal summary statistics
   */
  getSummary: protectedProcedure.query(async ({ ctx }) => {
    const goals = await getUserGoals(ctx.user.id, false);
    const completedGoals = await getUserGoals(ctx.user.id, true);

    const activeGoals = goals.filter(g => g.status === "active");
    const totalTargetAmount = activeGoals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalCurrentAmount = activeGoals.reduce((sum, g) => sum + g.currentAmount, 0);
    const overallProgress = totalTargetAmount > 0 
      ? Math.round((totalCurrentAmount / totalTargetAmount) * 100)
      : 0;

    const completedCount = completedGoals.filter(g => g.status === "completed").length;

    return {
      activeGoalsCount: activeGoals.length,
      completedGoalsCount: completedCount,
      totalTargetAmount,
      totalCurrentAmount,
      overallProgress,
    };
  }),
});
