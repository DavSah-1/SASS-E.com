import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
// Alerts are now accessed via ctx.alertsDb adapter

export const budgetRouter = router({
  // ==================== Category Management ====================
  
  /**
   * Create a new budget category
   */
  createCategory: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        type: z.enum(["income", "expense"]),
        monthlyLimit: z.number().int().optional(),
        color: z.string().regex(/^#[0-9A-Fa-f]{6}$/),
        icon: z.string().max(50).optional(),
        sortOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.budgetDb.createBudgetCategory({
        userId: ctx.user.numericId,
        ...input,
        isDefault: 0,
      });

      return { success: true, message: "Category created successfully" };
    }),

  /**
   * Get all budget categories for the user
   */
  getCategories: protectedProcedure
    .input(
      z.object({
        type: z.enum(["income", "expense"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const categories = await ctx.budgetDb.getUserBudgetCategories(ctx.user.numericId, input.type);
      return categories;
    }),

  /**
   * Update a budget category
   */
  updateCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
        updates: z.object({
          name: z.string().min(1).max(100).optional(),
          monthlyLimit: z.number().int().optional(),
          color: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
          icon: z.string().max(50).optional(),
          sortOrder: z.number().int().optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.budgetDb.updateBudgetCategory(input.categoryId, input.updates);
      return { success: true, message: "Category updated successfully" };
    }),

  /**
   * Delete a budget category
   */
  deleteCategory: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.budgetDb.deleteBudgetCategory(input.categoryId);
      return { success: true, message: "Category deleted successfully" };
    }),

  // ==================== Transaction Management ====================

  /**
   * Create a new budget transaction
   */
  createTransaction: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
        amount: z.number().int().positive(),
        transactionDate: z.string().datetime(),
        description: z.string().max(255).optional(),
        notes: z.string().optional(),
        isRecurring: z.boolean().default(false),
        recurringFrequency: z.enum(["weekly", "biweekly", "monthly", "yearly"]).optional(),
        tags: z.string().max(255).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.budgetDb.createBudgetTransaction({
        userId: ctx.user.numericId,
        categoryId: input.categoryId,
        amount: input.amount,
        transactionDate: new Date(input.transactionDate),
        description: input.description,
        notes: input.notes,
        isRecurring: input.isRecurring ? 1 : 0,
        recurringFrequency: input.recurringFrequency,
        tags: input.tags,
      });

      // Check for budget alerts after creating transaction
      try {
        if (ctx.alertsDb) {
          await ctx.alertsDb.checkCategoryAlerts(ctx.user.numericId, input.categoryId);
        }
      } catch (error) {
        console.error("[createTransaction] Failed to check alerts:", error);
      }

      return { success: true, message: "Transaction created successfully" };
    }),

  /**
   * Get budget transactions for the user
   */
  getTransactions: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int().optional(),
        startDate: z.string().datetime().optional(),
        endDate: z.string().datetime().optional(),
        limit: z.number().int().default(100),
      })
    )
    .query(async ({ ctx, input }) => {
      const transactions = await ctx.budgetDb.getUserBudgetTransactions(ctx.user.numericId, {
        categoryId: input.categoryId,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
      });

      return transactions;
    }),

  /**
   * Update a budget transaction
   */
  updateTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.number().int(),
        updates: z.object({
          categoryId: z.number().int().optional(),
          amount: z.number().int().positive().optional(),
          transactionDate: z.string().datetime().optional(),
          description: z.string().max(255).optional(),
          notes: z.string().optional(),
          tags: z.string().max(255).optional(),
        }),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const updates: any = { ...input.updates };
      if (updates.transactionDate) {
        updates.transactionDate = new Date(updates.transactionDate);
      }

      await ctx.budgetDb.updateBudgetTransaction(input.transactionId, updates);
      return { success: true, message: "Transaction updated successfully" };
    }),

  /**
   * Delete a budget transaction
   */
  deleteTransaction: protectedProcedure
    .input(
      z.object({
        transactionId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.budgetDb.deleteBudgetTransaction(input.transactionId);
      return { success: true, message: "Transaction deleted successfully" };
    }),

  // ==================== Budget Summary & Analysis ====================

  /**
   * Get monthly budget summary
   */
  getMonthlySummary: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().regex(/^\d{4}-\d{2}$/), // Format: "2025-01"
      })
    )
    .query(async ({ ctx, input }) => {
      const summary = await ctx.budgetDb.calculateMonthlyBudgetSummary(ctx.user.numericId, input.monthYear);
      return summary;
    }),

  /**
   * Get historical monthly summaries
   */
  getMonthlyHistory: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().default(12),
      })
    )
    .query(async ({ ctx, input }) => {
      const summaries = await ctx.budgetDb.getUserMonthlyBudgetSummaries(ctx.user.numericId, input.limit);
      return summaries;
    }),

  /**
   * Get category spending breakdown for a month
   */
  getCategoryBreakdown: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().regex(/^\d{4}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const breakdown = await ctx.budgetDb.getCategorySpendingBreakdown(ctx.user.numericId, input.monthYear);
      return breakdown;
    }),

  /**
   * Get available funds for debt payments
   */
  getAvailableForDebt: protectedProcedure
    .input(
      z.object({
        monthYear: z.string().regex(/^\d{4}-\d{2}$/),
      })
    )
    .query(async ({ ctx, input }) => {
      const summary = await ctx.budgetDb.calculateMonthlyBudgetSummary(ctx.user.numericId, input.monthYear);
      const debtSummary = await ctx.debtDb.getDebtSummary(ctx.user.numericId);

      if (!summary) {
        return {
          availableForExtraPayments: 0,
          totalMonthlyMinimum: debtSummary.totalMonthlyMinimum,
          recommendedExtraPayment: 0,
          projectedMonthsToDebtFree: 0,
        };
      }

      // Calculate recommended extra payment (50% of available funds)
      const recommendedExtraPayment = Math.floor(summary.availableForExtraPayments * 0.5);

      // Rough estimate of months to debt free
      const totalDebt = debtSummary.totalBalance;
      const monthlyPayment = debtSummary.totalMonthlyMinimum + recommendedExtraPayment;
      const projectedMonthsToDebtFree = monthlyPayment > 0
        ? Math.ceil(totalDebt / monthlyPayment)
        : 0;

      return {
        availableForExtraPayments: summary.availableForExtraPayments,
        totalMonthlyMinimum: debtSummary.totalMonthlyMinimum,
        recommendedExtraPayment,
        projectedMonthsToDebtFree,
        netCashFlow: summary.netCashFlow,
        budgetHealth: summary.budgetHealth,
      };
    }),

  /**
   * Initialize default budget categories for new users
   */
  initializeDefaultCategories: protectedProcedure.mutation(async ({ ctx }) => {
    const existingCategories = await ctx.budgetDb.getUserBudgetCategories(ctx.user.numericId);
    
    if (existingCategories.length > 0) {
      return { success: true, message: "Categories already initialized" };
    }

    // Default income categories
    const incomeCategories = [
      { name: "Salary", color: "#10b981", icon: "💼", sortOrder: 1 },
      { name: "Freelance", color: "#3b82f6", icon: "💻", sortOrder: 2 },
      { name: "Investments", color: "#8b5cf6", icon: "📈", sortOrder: 3 },
      { name: "Other Income", color: "#6366f1", icon: "💰", sortOrder: 4 },
    ];

    // Default expense categories
    const expenseCategories = [
      { name: "Housing", color: "#ef4444", icon: "🏠", sortOrder: 1, monthlyLimit: 150000 },
      { name: "Transportation", color: "#f59e0b", icon: "🚗", sortOrder: 2, monthlyLimit: 50000 },
      { name: "Food & Dining", color: "#ec4899", icon: "🍽️", sortOrder: 3, monthlyLimit: 60000 },
      { name: "Utilities", color: "#14b8a6", icon: "⚡", sortOrder: 4, monthlyLimit: 20000 },
      { name: "Healthcare", color: "#06b6d4", icon: "🏥", sortOrder: 5, monthlyLimit: 30000 },
      { name: "Entertainment", color: "#a855f7", icon: "🎬", sortOrder: 6, monthlyLimit: 20000 },
      { name: "Shopping", color: "#f43f5e", icon: "🛍️", sortOrder: 7, monthlyLimit: 30000 },
      { name: "Other Expenses", color: "#64748b", icon: "📦", sortOrder: 8 },
    ];

    for (const cat of incomeCategories) {
      await ctx.budgetDb.createBudgetCategory({
        userId: ctx.user.numericId,
        type: "income",
        isDefault: 1,
        ...cat,
      });
    }

    for (const cat of expenseCategories) {
      await ctx.budgetDb.createBudgetCategory({
        userId: ctx.user.numericId,
        type: "expense",
        isDefault: 1,
        ...cat,
      });
    }

    return { success: true, message: "Default categories initialized" };
  }),

  // ==================== Budget Alerts ====================

  /**
   * Get budget alerts for the user
   */
  getAlerts: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().int().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const alerts = await ctx.alertsDb.getAlerts(ctx.user.numericId, { 
        limit: input.limit,
        unreadOnly: input.unreadOnly 
      });
      
      if (input.unreadOnly) {
        return alerts.filter(a => a.isRead === 0);
      }

      return alerts;
    }),

  // ==================== Financial Insights ====================

  /**
   * Generate AI-powered spending insights
   */
  generateInsights: protectedProcedure.mutation(async ({ ctx }) => {

    const result = await ctx.insightsDb.generateSpendingInsights(ctx.user.numericId);
    return result;
  }),

  /**
   * Get AI-powered financial insights
   */
  getInsights: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
        limit: z.number().int().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.insightsDb.getInsights(ctx.user.numericId, { 
        activeOnly: input.activeOnly,
        limit: input.limit 
      });
    }),

  /**
   * Dismiss a financial insight
   */
  dismissInsight: protectedProcedure
    .input(
      z.object({
        insightId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await ctx.insightsDb.dismissInsight(input.insightId, ctx.user.numericId);
      return { success, message: success ? "Insight dismissed" : "Failed to dismiss insight" };
    }),

  // ==================== Spending Trends Visualization ====================

  /**
   * Get spending trends over time (monthly aggregation by category)
   */
  getSpendingTrends: protectedProcedure
    .input(
      z.object({
        startMonth: z.string().regex(/^\d{4}-\d{2}$/), // Format: "2025-01"
        endMonth: z.string().regex(/^\d{4}-\d{2}$/),
        categoryId: z.number().int().optional(), // Filter by specific category
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.budgetDb.getSpendingTrends(
        ctx.user.numericId,
        input.startMonth,
        input.endMonth,
        input.categoryId
      );
    }),

  /**
   * Get month-over-month comparison for a specific category
   */
  getCategoryTrend: protectedProcedure
    .input(
      z.object({
        categoryId: z.number().int(),
        months: z.number().int().default(6), // Number of months to look back
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.budgetDb.getCategoryTrend(ctx.user.numericId, input.categoryId, input.months);
    }),


  /**
   * Get overall spending trends summary
   */
  getSpendingTrendsSummary: protectedProcedure
    .input(
      z.object({
        months: z.number().int().default(6),
      })
    )
    .query(async ({ ctx, input }) => {
      return ctx.budgetDb.getSpendingTrendsSummary(ctx.user.numericId, input.months);
    }),


  // ==================== Budget Templates ====================

  /**
   * Get all available budget templates
   */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    return ctx.budgetDb.getTemplates(ctx.user.numericId);
  }),

  /**
   * Apply a budget template to user's budget
   */
  applyTemplate: protectedProcedure
    .input(
      z.object({
        templateId: z.number().int(),
        monthlyIncome: z.number().int(), // In cents
      })
    )
    .mutation(async ({ ctx, input }) => {
      return ctx.budgetDb.applyTemplate(ctx.user.numericId, input.templateId, input.monthlyIncome);
    }),


  /**
   * Get user's active budget template
   */
  getActiveTemplate: protectedProcedure.query(async ({ ctx }) => {
    return ctx.budgetDb.getActiveTemplate(ctx.user.numericId);
  }),

  // ==================== Notifications & Alerts ====================

  /**
   * Get user's notification preferences
   */
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    return ctx.notificationDb.getNotificationPreferences(ctx.user.numericId);
  }),

  /**
   * Update notification preferences
   */
  updateNotificationPreferences: protectedProcedure
    .input(
      z.object({
        budgetAlertsEnabled: z.number().int().min(0).max(1).optional(),
        threshold80Enabled: z.number().int().min(0).max(1).optional(),
        threshold100Enabled: z.number().int().min(0).max(1).optional(),
        exceededEnabled: z.number().int().min(0).max(1).optional(),
        weeklySummaryEnabled: z.number().int().min(0).max(1).optional(),
        monthlySummaryEnabled: z.number().int().min(0).max(1).optional(),
        insightsEnabled: z.number().int().min(0).max(1).optional(),
        recurringAlertsEnabled: z.number().int().min(0).max(1).optional(),
        notificationMethod: z.enum(["in_app", "push", "both"]).optional(),
        quietHoursStart: z.number().int().min(0).max(23).nullable().optional(),
        quietHoursEnd: z.number().int().min(0).max(23).nullable().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await ctx.notificationDb.updateNotificationPreferences(ctx.user.numericId, input);
      return {
        success,
        message: success ? "Notification preferences updated" : "Failed to update notification preferences"
      };
    }),

  /**
   * Mark alert as read
   */
  markAlertRead: protectedProcedure
    .input(
      z.object({
        alertId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const success = await ctx.alertsDb.markAlertRead(input.alertId, ctx.user.numericId);
      return { success };
    }),

  /**
   * Mark all alerts as read
   */
  markAllAlertsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const success = await ctx.alertsDb.markAllAlertsRead(ctx.user.numericId);
    return { success };
  }),

  /**
   * Get unread alert count
   */
  getUnreadAlertCount: protectedProcedure.query(async ({ ctx }) => {
    return ctx.alertsDb.getUnreadAlertCount(ctx.user.numericId);
  }),

  /**
   * Manually trigger alert check for all categories
   */
  checkAlerts: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      if (ctx.alertsDb) {
        await ctx.alertsDb.checkAllCategoryAlerts(ctx.user.numericId);
      }
      return { success: true, message: "Alert check completed" };
    } catch (error) {
      console.error("[checkAlerts] Error:", error);
      return { success: false, message: "Failed to check alerts" };
    }
  }),

  // ==================== Recurring Transactions ====================

  /**
   * Detect recurring transaction patterns
   */
  detectRecurring: protectedProcedure.mutation(async ({ ctx }) => {

    const result = await ctx.recurringDb.detectRecurringPatterns(ctx.user.numericId);
    return result;
  }),

  /**
   * Get user's recurring transactions
   */
  getRecurring: protectedProcedure
    .input(
      z.object({
        activeOnly: z.boolean().default(true),
      })
    )
    .query(async ({ ctx, input }) => {
      const { getUserRecurringTransactions } = await import("./db");
      const recurring = await getUserRecurringTransactions(ctx.user.numericId, input.activeOnly);
      return recurring;
    }),

  /**
   * Get recurring expense projections
   */
  getRecurringProjections: protectedProcedure.query(async ({ ctx }) => {
    const { calculateRecurringProjections } = await import("./db");
    const projections = await calculateRecurringProjections(ctx.user.numericId);
    return projections;
  }),

  /**
   * Get upcoming recurring transactions (next 30 days)
   */
  getUpcomingRecurring: protectedProcedure.query(async ({ ctx }) => {
    const { getUpcomingRecurring } = await import("./db");
    const upcoming = await getUpcomingRecurring(ctx.user.numericId);
    return upcoming;
  }),

  /**
   * Update recurring transaction settings
   */
  updateRecurring: protectedProcedure
    .input(
      z.object({
        recurringId: z.number().int(),
        reminderEnabled: z.boolean().optional(),
        autoAdd: z.boolean().optional(),
        isActive: z.boolean().optional(),
        notes: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { updateRecurringTransaction } = await import("./db");
      const { recurringId, ...updates } = input;
      const result = await updateRecurringTransaction(ctx.user.numericId, recurringId, updates);
      return result;
    }),

  // ==================== Financial Goals ====================

  /**
   * Get all goals for user with progress
   */
  getGoals: protectedProcedure.query(async ({ ctx }) => {
    const { getUserGoalsWithProgress } = await import("./db");
    const goals = await getUserGoalsWithProgress(ctx.user.numericId);
    return goals;
  }),

  /**
   * Get detailed goal statistics
   */
  getGoalStats: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { calculateGoalStats } = await import("./db");
      const stats = await calculateGoalStats(input.goalId, ctx.user.numericId);
      return stats;
    }),

  /**
   * Update goal progress
   */
  updateGoalProgress: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
        newAmount: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { updateGoalProgress } = await import("./db");
      const result = await updateGoalProgress(input.goalId, input.newAmount, ctx.user.numericId);
      return result;
    }),

  /**
   * Generate AI insights for a goal
   */
  generateGoalInsights: protectedProcedure
    .input(
      z.object({
        goalId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { generateGoalInsights } = await import("./db");
      const insights = await generateGoalInsights(input.goalId, ctx.user.numericId);
      return insights;
    }),

  /**
   * Get uncelebrated milestones
   */
  getUncelebratedMilestones: protectedProcedure.query(async ({ ctx }) => {
    const { getUncelebratedMilestones } = await import("./db");
    const milestones = await getUncelebratedMilestones(ctx.user.numericId);
    return milestones;
  }),

  /**
   * Mark milestone as celebrated
   */
  markMilestoneCelebrated: protectedProcedure
    .input(
      z.object({
        milestoneId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { markMilestoneCelebrated } = await import("./db");
      const result = await markMilestoneCelebrated(input.milestoneId);
      return result;
    }),

  /**
   * Auto-update linked goals
   */
  autoUpdateLinkedGoals: protectedProcedure.mutation(async ({ ctx }) => {
    const { autoUpdateLinkedGoals } = await import("./db");
    const result = await autoUpdateLinkedGoals(ctx.user.numericId);
    return result;
  }),

  // ==================== Receipt Scanner ====================

  /**
   * Process receipt image and extract data
   */
  processReceipt: protectedProcedure
    .input(
      z.object({
        imageUrl: z.string().url(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const result = await ctx.receiptsDb.processReceiptImage(input.imageUrl, ctx.user.numericId);
      return result;
    }),

  /**
   * Suggest category for merchant
   */
  suggestCategory: protectedProcedure
    .input(
      z.object({
        merchantName: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { suggestCategory } = await import("./db");
      const result = await suggestCategory(input.merchantName, ctx.user.numericId);
      return result;
    }),

  /**
   * Learn from user category correction
   */
  learnFromCorrection: protectedProcedure
    .input(
      z.object({
        merchantName: z.string(),
        categoryId: z.number().int(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { learnFromCorrection } = await import("./db");
      const result = await learnFromCorrection(
        input.merchantName,
        input.categoryId,
        ctx.user.numericId
      );
      return result;
    }),

  // ==================== Budget Sharing ====================

  /**
   * Create shared budget
   */
  createSharedBudget: protectedProcedure
    .input(
      z.object({
        name: z.string(),
        description: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const result = await ctx.sharingDb.createSharedBudget(ctx.user.numericId, input.name, input.description);
      return result;
    }),

  /**
   * Get user's shared budgets
   */
  getUserSharedBudgets: protectedProcedure.query(async ({ ctx }) => {
    const { getUserSharedBudgets } = await import("./db");
    const budgets = await getUserSharedBudgets(ctx.user.numericId);
    return budgets;
  }),

  /**
   * Invite user to shared budget
   */
  inviteToSharedBudget: protectedProcedure
    .input(
      z.object({
        budgetId: z.number().int(),
        inviteeId: z.number().int(),
        role: z.enum(["editor", "viewer"]),
      })
    )
    .mutation(async ({ ctx, input }) => {

      const result = await ctx.sharingDb.inviteToSharedBudget(
        input.budgetId,
        ctx.user.numericId,
        input.inviteeId,
        input.role
      );
      return result;
    }),

  /**
   * Get settlement summary
   */
  getSettlementSummary: protectedProcedure
    .input(
      z.object({
        budgetId: z.number().int(),
      })
    )
    .query(async ({ ctx, input }) => {
      const { getSettlementSummary } = await import("./db");
      const summary = await getSettlementSummary(input.budgetId);
      return summary;
    }),

  // ==================== Loan Calculator ====================

  /**
   * Calculate loan payment details
   */
  calculateLoanPayment: protectedProcedure
    .input(
      z.object({
        principal: z.number().int().positive(),
        annualInterestRate: z.number().min(0).max(100),
        termMonths: z.number().int().positive().max(600),
      })
    )
    .query(async ({ input }) => {
      const { calculateMonthlyPayment, getLoanSummary } = await import("./loanCalculator");
      const payment = calculateMonthlyPayment(input);
      const summary = getLoanSummary(input);
      return {
        ...payment,
        summary,
      };
    }),

  /**
   * Generate full amortization schedule
   */
  getAmortizationSchedule: protectedProcedure
    .input(
      z.object({
        principal: z.number().int().positive(),
        annualInterestRate: z.number().min(0).max(100),
        termMonths: z.number().int().positive().max(600),
        extraMonthlyPayment: z.number().int().min(0).optional(),
      })
    )
    .query(async ({ input }) => {
      const { generateAmortizationSchedule } = await import("./loanCalculator");
      const schedule = generateAmortizationSchedule(input);
      return schedule;
    }),

  /**
   * Compare loan with and without extra payments
   */
  compareExtraPayments: protectedProcedure
    .input(
      z.object({
        principal: z.number().int().positive(),
        annualInterestRate: z.number().min(0).max(100),
        termMonths: z.number().int().positive().max(600),
        extraMonthlyPayment: z.number().int().positive(),
      })
    )
    .query(async ({ input }) => {
      const { compareExtraPayments } = await import("./loanCalculator");
      const comparison = compareExtraPayments(input);
      return comparison;
    }),

  /**
   * Calculate affordability based on income
   */
  calculateAffordability: protectedProcedure
    .input(
      z.object({
        monthlyIncome: z.number().int().positive(),
        maxDebtToIncomeRatio: z.number().min(1).max(100).optional(),
      })
    )
    .query(async ({ input }) => {
      const { calculateAffordability } = await import("./loanCalculator");
      const result = calculateAffordability(
        input.monthlyIncome,
        input.maxDebtToIncomeRatio
      );
      return result;
    }),
});
