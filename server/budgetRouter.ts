import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import {
  createBudgetCategory,
  getUserBudgetCategories,
  updateBudgetCategory,
  deleteBudgetCategory,
  createBudgetTransaction,
  getUserBudgetTransactions,
  updateBudgetTransaction,
  deleteBudgetTransaction,
  calculateMonthlyBudgetSummary,
  saveMonthlyBudgetSummary,
  getUserMonthlyBudgetSummaries,
  getCategorySpendingBreakdown,
  getDebtSummary,
} from "./db";
import { invokeLLM } from "./_core/llm";
import { checkCategoryAlerts, checkAllCategoryAlerts } from "./alertHelpers";

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
      await createBudgetCategory({
        userId: ctx.user.id,
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
      const categories = await getUserBudgetCategories(ctx.user.id, input.type);
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
      await updateBudgetCategory(input.categoryId, input.updates);
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
      await deleteBudgetCategory(input.categoryId);
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
      await createBudgetTransaction({
        userId: ctx.user.id,
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
        await checkCategoryAlerts(ctx.user.id, input.categoryId);
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
      const transactions = await getUserBudgetTransactions(ctx.user.id, {
        categoryId: input.categoryId,
        startDate: input.startDate ? new Date(input.startDate) : undefined,
        endDate: input.endDate ? new Date(input.endDate) : undefined,
        limit: input.limit,
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

      await updateBudgetTransaction(input.transactionId, updates);
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
      await deleteBudgetTransaction(input.transactionId);
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
      const summary = await calculateMonthlyBudgetSummary(ctx.user.id, input.monthYear);
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
      const summaries = await getUserMonthlyBudgetSummaries(ctx.user.id, input.limit);
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
      const breakdown = await getCategorySpendingBreakdown(ctx.user.id, input.monthYear);
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
      const summary = await calculateMonthlyBudgetSummary(ctx.user.id, input.monthYear);
      const debtSummary = await getDebtSummary(ctx.user.id);

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
    const existingCategories = await getUserBudgetCategories(ctx.user.id);
    
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
      await createBudgetCategory({
        userId: ctx.user.id,
        type: "income",
        isDefault: 1,
        ...cat,
      });
    }

    for (const cat of expenseCategories) {
      await createBudgetCategory({
        userId: ctx.user.id,
        type: "expense",
        isDefault: 1,
        ...cat,
      });
    }

    return { success: true, message: "Default categories initialized" };
  }),

  // ==================== Budget Alerts ====================

  /**
   * Get user's budget alerts
   */
  getAlerts: protectedProcedure
    .input(
      z.object({
        unreadOnly: z.boolean().default(false),
        limit: z.number().int().default(50),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await import("./db").then(m => m.getDb());
      if (!db) return [];

      const { budgetAlerts } = await import("../drizzle/schema");
      const { eq, and, desc } = await import("drizzle-orm");

      let query = db
        .select()
        .from(budgetAlerts)
        .where(eq(budgetAlerts.userId, ctx.user.id))
        .orderBy(desc(budgetAlerts.createdAt))
        .limit(input.limit);

      const alerts = await query;
      
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
    const { generateSpendingInsights } = await import("./insightsHelpers");
    const result = await generateSpendingInsights(ctx.user.id);
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return [];

      const { financialInsights } = await import("../drizzle/schema");
      const { eq, and, desc, or, isNull, gt } = await import("drizzle-orm");

      let whereConditions = [eq(financialInsights.userId, ctx.user.id)];
      
      if (input.activeOnly) {
        whereConditions.push(eq(financialInsights.isDismissed, 0));
        whereConditions.push(
          or(
            isNull(financialInsights.expiresAt),
            gt(financialInsights.expiresAt, new Date())
          )!
        );
      }

      const insights = await db
        .select()
        .from(financialInsights)
        .where(and(...whereConditions))
        .orderBy(desc(financialInsights.priority), desc(financialInsights.createdAt))
        .limit(input.limit);

      return insights;
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return { success: false };

      const { financialInsights } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      await db
        .update(financialInsights)
        .set({ isDismissed: 1 })
        .where(eq(financialInsights.id, input.insightId));

      return { success: true, message: "Insight dismissed" };
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return [];

      const { budgetTransactions, budgetCategories } = await import("../drizzle/schema");
      const { eq, and, gte, lte, sql } = await import("drizzle-orm");

      // Parse start and end dates
      const startDate = new Date(input.startMonth + "-01");
      const endDate = new Date(input.endMonth + "-01");
      endDate.setMonth(endDate.getMonth() + 1); // End of month

      // Build query conditions
      const conditions = [
        eq(budgetTransactions.userId, ctx.user.id),
        gte(budgetTransactions.transactionDate, startDate),
        lte(budgetTransactions.transactionDate, endDate),
      ];

      if (input.categoryId) {
        conditions.push(eq(budgetTransactions.categoryId, input.categoryId));
      }

      // Get all transactions in date range
      const transactions = await db
        .select({
          amount: budgetTransactions.amount,
          transactionDate: budgetTransactions.transactionDate,
          categoryId: budgetTransactions.categoryId,
          categoryName: budgetCategories.name,
          categoryType: budgetCategories.type,
          categoryColor: budgetCategories.color,
          categoryIcon: budgetCategories.icon,
        })
        .from(budgetTransactions)
        .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
        .where(and(...conditions))
        .orderBy(budgetTransactions.transactionDate);

      // Aggregate by month and category
      const monthlyData: Record<string, Record<number, { total: number; count: number; category: any }>> = {};

      for (const tx of transactions) {
        const monthKey = tx.transactionDate.toISOString().slice(0, 7); // "YYYY-MM"
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {};
        }

        if (!monthlyData[monthKey][tx.categoryId]) {
          monthlyData[monthKey][tx.categoryId] = {
            total: 0,
            count: 0,
            category: {
              id: tx.categoryId,
              name: tx.categoryName,
              type: tx.categoryType,
              color: tx.categoryColor,
              icon: tx.categoryIcon,
            },
          };
        }

        monthlyData[monthKey][tx.categoryId].total += tx.amount;
        monthlyData[monthKey][tx.categoryId].count += 1;
      }

      // Convert to array format for charts
      const trends = Object.entries(monthlyData).map(([month, categories]) => ({
        month,
        categories: Object.values(categories),
        totalSpending: Object.values(categories)
          .filter(c => c.category.type === "expense")
          .reduce((sum, c) => sum + c.total, 0),
        totalIncome: Object.values(categories)
          .filter(c => c.category.type === "income")
          .reduce((sum, c) => sum + c.total, 0),
      }));

      return trends.sort((a, b) => a.month.localeCompare(b.month));
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return null;

      const { budgetTransactions, budgetCategories } = await import("../drizzle/schema");
      const { eq, and, gte } = await import("drizzle-orm");

      // Get category details
      const category = await db
        .select()
        .from(budgetCategories)
        .where(and(
          eq(budgetCategories.id, input.categoryId),
          eq(budgetCategories.userId, ctx.user.id)
        ))
        .limit(1);

      if (category.length === 0) {
        return null;
      }

      // Calculate start date (N months ago)
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);
      startDate.setDate(1); // First day of month

      // Get transactions for this category
      const transactions = await db
        .select({
          amount: budgetTransactions.amount,
          transactionDate: budgetTransactions.transactionDate,
        })
        .from(budgetTransactions)
        .where(and(
          eq(budgetTransactions.userId, ctx.user.id),
          eq(budgetTransactions.categoryId, input.categoryId),
          gte(budgetTransactions.transactionDate, startDate)
        ))
        .orderBy(budgetTransactions.transactionDate);

      // Aggregate by month
      const monthlyTotals: Record<string, { total: number; count: number }> = {};

      for (const tx of transactions) {
        const monthKey = tx.transactionDate.toISOString().slice(0, 7);
        
        if (!monthlyTotals[monthKey]) {
          monthlyTotals[monthKey] = { total: 0, count: 0 };
        }

        monthlyTotals[monthKey].total += tx.amount;
        monthlyTotals[monthKey].count += 1;
      }

      // Calculate month-over-month changes
      const months = Object.keys(monthlyTotals).sort();
      const trends = months.map((month, index) => {
        const current = monthlyTotals[month];
        const previous = index > 0 ? monthlyTotals[months[index - 1]] : null;
        
        const percentageChange = previous && previous.total > 0
          ? ((current.total - previous.total) / previous.total) * 100
          : 0;

        return {
          month,
          total: current.total,
          count: current.count,
          average: current.count > 0 ? Math.round(current.total / current.count) : 0,
          percentageChange: Math.round(percentageChange * 100) / 100,
          trend: percentageChange > 5 ? "increasing" : percentageChange < -5 ? "decreasing" : "stable",
        };
      });

      return {
        category: category[0],
        trends,
        overallAverage: trends.length > 0
          ? Math.round(trends.reduce((sum, t) => sum + t.total, 0) / trends.length)
          : 0,
      };
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return null;

      const { budgetTransactions, budgetCategories } = await import("../drizzle/schema");
      const { eq, and, gte } = await import("drizzle-orm");

      // Calculate start date
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - input.months);
      startDate.setDate(1);

      // Get all transactions
      const transactions = await db
        .select({
          amount: budgetTransactions.amount,
          transactionDate: budgetTransactions.transactionDate,
          categoryType: budgetCategories.type,
        })
        .from(budgetTransactions)
        .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
        .where(and(
          eq(budgetTransactions.userId, ctx.user.id),
          gte(budgetTransactions.transactionDate, startDate)
        ));

      // Aggregate by month
      const monthlyData: Record<string, { income: number; expenses: number }> = {};

      for (const tx of transactions) {
        const monthKey = tx.transactionDate.toISOString().slice(0, 7);
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = { income: 0, expenses: 0 };
        }

        if (tx.categoryType === "income") {
          monthlyData[monthKey].income += tx.amount;
        } else {
          monthlyData[monthKey].expenses += tx.amount;
        }
      }

      // Calculate trends
      const months = Object.keys(monthlyData).sort();
      const trends = months.map((month, index) => {
        const current = monthlyData[month];
        const previous = index > 0 ? monthlyData[months[index - 1]] : null;
        
        const netCashFlow = current.income - current.expenses;
        const savingsRate = current.income > 0
          ? Math.round((netCashFlow / current.income) * 10000) / 100
          : 0;

        const expenseChange = previous && previous.expenses > 0
          ? ((current.expenses - previous.expenses) / previous.expenses) * 100
          : 0;

        return {
          month,
          income: current.income,
          expenses: current.expenses,
          netCashFlow,
          savingsRate,
          expenseChange: Math.round(expenseChange * 100) / 100,
        };
      });

      // Calculate overall statistics
      const totalIncome = trends.reduce((sum, t) => sum + t.income, 0);
      const totalExpenses = trends.reduce((sum, t) => sum + t.expenses, 0);
      const avgMonthlyIncome = trends.length > 0 ? Math.round(totalIncome / trends.length) : 0;
      const avgMonthlyExpenses = trends.length > 0 ? Math.round(totalExpenses / trends.length) : 0;
      const avgSavingsRate = trends.length > 0
        ? Math.round(trends.reduce((sum, t) => sum + t.savingsRate, 0) / trends.length * 100) / 100
        : 0;

      return {
        trends,
        summary: {
          avgMonthlyIncome,
          avgMonthlyExpenses,
          avgSavingsRate,
          totalMonths: trends.length,
        },
      };
    }),

  // ==================== Budget Templates ====================

  /**
   * Get all available budget templates
   */
  getTemplates: protectedProcedure.query(async ({ ctx }) => {
    const db = await import("./db").then(m => m.getDb());
    if (!db) return [];

    const { budgetTemplates } = await import("../drizzle/schema");
    const { or, eq, isNull } = await import("drizzle-orm");

    // Get system templates and user's custom templates
    const templates = await db
      .select()
      .from(budgetTemplates)
      .where(
        or(
          eq(budgetTemplates.isSystemTemplate, 1),
          eq(budgetTemplates.userId, ctx.user.id)
        )
      )
      .orderBy(budgetTemplates.sortOrder);

    return templates.map(t => ({
      ...t,
      allocations: JSON.parse(t.allocations),
      categoryMappings: t.categoryMappings ? JSON.parse(t.categoryMappings) : null,
    }));
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return { success: false, message: "Database unavailable" };

      const { budgetTemplates, budgetCategories, userBudgetTemplates } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      // Get template
      const template = await db
        .select()
        .from(budgetTemplates)
        .where(eq(budgetTemplates.id, input.templateId))
        .limit(1);

      if (template.length === 0) {
        return { success: false, message: "Template not found" };
      }

      const tmpl = template[0];
      const allocations = JSON.parse(tmpl.allocations);
      const categoryMappings = tmpl.categoryMappings ? JSON.parse(tmpl.categoryMappings) : null;

      // Get user's categories
      const categories = await db
        .select()
        .from(budgetCategories)
        .where(eq(budgetCategories.userId, ctx.user.id));

      const appliedAllocations: Record<string, any> = {};

      // Apply template based on strategy
      if (tmpl.strategy === "50_30_20") {
        // Calculate dollar amounts for each allocation
        const needsAmount = Math.round(input.monthlyIncome * 0.5);
        const wantsAmount = Math.round(input.monthlyIncome * 0.3);
        const savingsAmount = Math.round(input.monthlyIncome * 0.2);

        appliedAllocations.needs = needsAmount;
        appliedAllocations.wants = wantsAmount;
        appliedAllocations.savings = savingsAmount;

        // Update category limits based on mappings
        if (categoryMappings) {
          const needsCategories = categories.filter(c => 
            categoryMappings.needs?.includes(c.name)
          );
          const wantsCategories = categories.filter(c => 
            categoryMappings.wants?.includes(c.name)
          );

          // Distribute needs budget evenly across needs categories
          const needsPerCategory = needsCategories.length > 0
            ? Math.round(needsAmount / needsCategories.length)
            : 0;
          
          for (const cat of needsCategories) {
            await db
              .update(budgetCategories)
              .set({ monthlyLimit: needsPerCategory })
              .where(eq(budgetCategories.id, cat.id));
          }

          // Distribute wants budget evenly across wants categories
          const wantsPerCategory = wantsCategories.length > 0
            ? Math.round(wantsAmount / wantsCategories.length)
            : 0;
          
          for (const cat of wantsCategories) {
            await db
              .update(budgetCategories)
              .set({ monthlyLimit: wantsPerCategory })
              .where(eq(budgetCategories.id, cat.id));
          }
        }
      } else if (tmpl.strategy === "zero_based") {
        // For zero-based, set all expense categories to have limits that sum to income
        const expenseCategories = categories.filter(c => c.type === "expense");
        const perCategory = expenseCategories.length > 0
          ? Math.round(input.monthlyIncome / expenseCategories.length)
          : 0;

        appliedAllocations.method = "zero_based";
        appliedAllocations.perCategory = perCategory;

        for (const cat of expenseCategories) {
          await db
            .update(budgetCategories)
            .set({ monthlyLimit: perCategory })
            .where(eq(budgetCategories.id, cat.id));
        }
      } else if (tmpl.strategy === "envelope") {
        // For envelope system, set suggested percentages for variable categories
        appliedAllocations.method = "envelope";
        appliedAllocations.envelopes = {};

        if (categoryMappings?.variable_envelopes) {
          for (const envelope of categoryMappings.variable_envelopes) {
            const category = categories.find(c => c.name === envelope.category);
            if (category) {
              const amount = Math.round(input.monthlyIncome * (envelope.suggested_percentage / 100));
              appliedAllocations.envelopes[envelope.category] = amount;

              await db
                .update(budgetCategories)
                .set({ monthlyLimit: amount })
                .where(eq(budgetCategories.id, category.id));
            }
          }
        }
      }

      // Deactivate previous template applications
      await db
        .update(userBudgetTemplates)
        .set({ isActive: 0 })
        .where(eq(userBudgetTemplates.userId, ctx.user.id));

      // Record template application
      await db.insert(userBudgetTemplates).values({
        userId: ctx.user.id,
        templateId: input.templateId,
        monthlyIncome: input.monthlyIncome,
        appliedAllocations: JSON.stringify(appliedAllocations),
        isActive: 1,
      });

      // Increment usage count
      await db
        .update(budgetTemplates)
        .set({ usageCount: tmpl.usageCount + 1 })
        .where(eq(budgetTemplates.id, input.templateId));

      return {
        success: true,
        message: `Successfully applied ${tmpl.name} template`,
        appliedAllocations,
      };
    }),

  /**
   * Get user's active budget template
   */
  getActiveTemplate: protectedProcedure.query(async ({ ctx }) => {
    const db = await import("./db").then(m => m.getDb());
    if (!db) return null;

    const { userBudgetTemplates, budgetTemplates } = await import("../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const active = await db
      .select({
        application: userBudgetTemplates,
        template: budgetTemplates,
      })
      .from(userBudgetTemplates)
      .innerJoin(budgetTemplates, eq(userBudgetTemplates.templateId, budgetTemplates.id))
      .where(
        and(
          eq(userBudgetTemplates.userId, ctx.user.id),
          eq(userBudgetTemplates.isActive, 1)
        )
      )
      .limit(1);

    if (active.length === 0) {
      return null;
    }

    return {
      ...active[0].application,
      appliedAllocations: JSON.parse(active[0].application.appliedAllocations),
      template: {
        ...active[0].template,
        allocations: JSON.parse(active[0].template.allocations),
        categoryMappings: active[0].template.categoryMappings
          ? JSON.parse(active[0].template.categoryMappings)
          : null,
      },
      };
    }),

  // ==================== Notifications & Alerts ====================

  /**
   * Get user's notification preferences
   */
  getNotificationPreferences: protectedProcedure.query(async ({ ctx }) => {
    const db = await import("./db").then(m => m.getDb());
    if (!db) return null;

    const { notificationPreferences } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    const prefs = await db
      .select()
      .from(notificationPreferences)
      .where(eq(notificationPreferences.userId, ctx.user.id))
      .limit(1);

    if (prefs.length === 0) {
      // Return default preferences
      return {
        budgetAlertsEnabled: 1,
        threshold80Enabled: 1,
        threshold100Enabled: 1,
        exceededEnabled: 1,
        weeklySummaryEnabled: 1,
        monthlySummaryEnabled: 1,
        insightsEnabled: 1,
        recurringAlertsEnabled: 1,
        notificationMethod: "both" as const,
        quietHoursStart: null,
        quietHoursEnd: null,
      };
    }

    return prefs[0];
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return { success: false, message: "Database unavailable" };

      const { notificationPreferences } = await import("../drizzle/schema");
      const { eq } = await import("drizzle-orm");

      // Check if preferences exist
      const existing = await db
        .select()
        .from(notificationPreferences)
        .where(eq(notificationPreferences.userId, ctx.user.id))
        .limit(1);

      if (existing.length === 0) {
        // Create new preferences
        await db.insert(notificationPreferences).values({
          userId: ctx.user.id,
          ...input,
        });
      } else {
        // Update existing preferences
        await db
          .update(notificationPreferences)
          .set(input)
          .where(eq(notificationPreferences.userId, ctx.user.id));
      }

      return { success: true, message: "Notification preferences updated" };
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
      const db = await import("./db").then(m => m.getDb());
      if (!db) return { success: false };

      const { budgetAlerts } = await import("../drizzle/schema");
      const { eq, and } = await import("drizzle-orm");

      await db
        .update(budgetAlerts)
        .set({ isRead: 1 })
        .where(
          and(
            eq(budgetAlerts.id, input.alertId),
            eq(budgetAlerts.userId, ctx.user.id)
          )
        );

      return { success: true };
    }),

  /**
   * Mark all alerts as read
   */
  markAllAlertsRead: protectedProcedure.mutation(async ({ ctx }) => {
    const db = await import("./db").then(m => m.getDb());
    if (!db) return { success: false };

    const { budgetAlerts } = await import("../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(budgetAlerts)
      .set({ isRead: 1 })
      .where(eq(budgetAlerts.userId, ctx.user.id));

    return { success: true };
  }),

  /**
   * Get unread alert count
   */
  getUnreadAlertCount: protectedProcedure.query(async ({ ctx }) => {
    const db = await import("./db").then(m => m.getDb());
    if (!db) return 0;

    const { budgetAlerts } = await import("../drizzle/schema");
    const { eq, and, count } = await import("drizzle-orm");

    const result = await db
      .select({ count: count() })
      .from(budgetAlerts)
      .where(
        and(
          eq(budgetAlerts.userId, ctx.user.id),
          eq(budgetAlerts.isRead, 0)
        )
      );

    return result[0]?.count || 0;
  }),

  /**
   * Manually trigger alert check for all categories
   */
  checkAlerts: protectedProcedure.mutation(async ({ ctx }) => {
    try {
      await checkAllCategoryAlerts(ctx.user.id);
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
    const { detectRecurringPatterns } = await import("./recurringHelpers");
    const result = await detectRecurringPatterns(ctx.user.id);
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
      const { getUserRecurringTransactions } = await import("./recurringHelpers");
      const recurring = await getUserRecurringTransactions(ctx.user.id, input.activeOnly);
      return recurring;
    }),

  /**
   * Get recurring expense projections
   */
  getRecurringProjections: protectedProcedure.query(async ({ ctx }) => {
    const { calculateRecurringProjections } = await import("./recurringHelpers");
    const projections = await calculateRecurringProjections(ctx.user.id);
    return projections;
  }),

  /**
   * Get upcoming recurring transactions (next 30 days)
   */
  getUpcomingRecurring: protectedProcedure.query(async ({ ctx }) => {
    const { getUpcomingRecurring } = await import("./recurringHelpers");
    const upcoming = await getUpcomingRecurring(ctx.user.id);
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
      const { updateRecurringTransaction } = await import("./recurringHelpers");
      const { recurringId, ...updates } = input;
      const result = await updateRecurringTransaction(ctx.user.id, recurringId, updates);
      return result;
    }),
});
