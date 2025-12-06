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
});
