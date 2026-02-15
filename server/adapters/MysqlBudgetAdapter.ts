/**
 * MysqlBudgetAdapter
 * 
 * Implements BudgetAdapter for MySQL database (admin users).
 * Delegates all operations to existing db.ts functions.
 */

import * as db from "../db";
import type { BudgetAdapter } from "./BudgetAdapter";

export class MysqlBudgetAdapter implements BudgetAdapter {
  async saveBudgetSnapshot(snapshot: any) {
    return db.saveBudgetSnapshot(snapshot);
  }

  async getBudgetSnapshots(userId: number, limit: number = 12) {
    return db.getBudgetSnapshots(userId, limit);
  }

  async createBudgetCategory(category: any) {
    return db.createBudgetCategory(category);
  }

  async getUserBudgetCategories(userId: number, type?: "income" | "expense") {
    return db.getUserBudgetCategories(userId, type);
  }

  async updateBudgetCategory(categoryId: number, updates: any) {
    return db.updateBudgetCategory(categoryId, updates);
  }

  async deleteBudgetCategory(categoryId: number) {
    return db.deleteBudgetCategory(categoryId);
  }

  async createBudgetTransaction(transaction: any) {
    return db.createBudgetTransaction(transaction);
  }

  async getUserBudgetTransactions(userId: number, options?: { categoryId?: number; startDate?: Date; endDate?: Date }) {
    return db.getUserBudgetTransactions(userId, options);
  }

  async updateBudgetTransaction(transactionId: number, updates: any) {
    return db.updateBudgetTransaction(transactionId, updates);
  }

  async deleteBudgetTransaction(transactionId: number) {
    return db.deleteBudgetTransaction(transactionId);
  }

  async calculateMonthlyBudgetSummary(userId: number, monthYear: string) {
    return db.calculateMonthlyBudgetSummary(userId, monthYear);
  }

  async saveMonthlyBudgetSummary(summary: any) {
    return db.saveMonthlyBudgetSummary(summary);
  }

  async getUserMonthlyBudgetSummaries(userId: number, limit: number = 12) {
    return db.getUserMonthlyBudgetSummaries(userId, limit);
  }

  async getCategorySpendingBreakdown(userId: number, monthYear: string) {
    return db.getCategorySpendingBreakdown(userId, monthYear);
  }

  async findDuplicateTransaction(userId: number, date: string, amount: number, description: string) {
    return db.findDuplicateTransaction(userId, date, amount, description);
  }

  async getTemplates(userId: number) {
    const dbConn = await import("../db").then(m => m.getDb());
    if (!dbConn) return [];

    const { budgetTemplates } = await import("../../drizzle/schema");
    const { or, eq } = await import("drizzle-orm");

    const templates = await dbConn
      .select()
      .from(budgetTemplates)
      .where(
        or(
          eq(budgetTemplates.isSystemTemplate, 1),
          eq(budgetTemplates.userId, userId)
        )
      )
      .orderBy(budgetTemplates.sortOrder);

    return templates.map(t => ({
      ...t,
      categories: typeof t.categories === 'string' ? JSON.parse(t.categories) : t.categories,
    }));
  }

  async applyTemplate(userId: number, templateId: number, monthlyIncome: number) {
    const dbConn = await import("../db").then(m => m.getDb());
    if (!dbConn) return { success: false, message: "Database unavailable" };

    const { budgetTemplates, budgetCategories, userBudgetTemplates } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    // Get template
    const template = await dbConn
      .select()
      .from(budgetTemplates)
      .where(eq(budgetTemplates.id, templateId))
      .limit(1);

    if (template.length === 0) {
      return { success: false, message: "Template not found" };
    }

    const tmpl = template[0];
    const categories = typeof tmpl.categories === 'string' ? JSON.parse(tmpl.categories) : tmpl.categories;

    // Create categories
    let categoriesCreated = 0;
    for (const cat of categories) {
      const monthlyLimit = Math.round((monthlyIncome * cat.percentage) / 100);
      
      await dbConn.insert(budgetCategories).values({
        userId,
        name: cat.name,
        type: cat.type || "expense",
        monthlyLimit,
        icon: cat.icon || null,
        color: cat.color || null,
      });
      categoriesCreated++;
    }

    // Deactivate previous template applications
    await dbConn
      .update(userBudgetTemplates)
      .set({ isActive: 0 })
      .where(eq(userBudgetTemplates.userId, userId));

    // Record template application
    await dbConn.insert(userBudgetTemplates).values({
      userId,
      templateId,
      monthlyIncome,
      isActive: 1,
    });

    // Increment usage count
    await dbConn
      .update(budgetTemplates)
      .set({ usageCount: tmpl.usageCount + 1 })
      .where(eq(budgetTemplates.id, templateId));

    return {
      success: true,
      message: `Applied ${tmpl.name} template`,
      categoriesCreated,
    };
  }

  async getActiveTemplate(userId: number) {
    const dbConn = await import("../db").then(m => m.getDb());
    if (!dbConn) return null;

    const { userBudgetTemplates, budgetTemplates } = await import("../../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    const active = await dbConn
      .select({
        application: userBudgetTemplates,
        template: budgetTemplates,
      })
      .from(userBudgetTemplates)
      .innerJoin(budgetTemplates, eq(userBudgetTemplates.templateId, budgetTemplates.id))
      .where(
        and(
          eq(userBudgetTemplates.userId, userId),
          eq(userBudgetTemplates.isActive, 1)
        )
      )
      .limit(1);

    return active.length > 0 ? active[0] : null;
  }

  async getCategoryTrend(userId: number, categoryId: number, months: number) {
    const dbConn = await import("../db").then(m => m.getDb());
    if (!dbConn) return null;

    const { budgetTransactions, budgetCategories } = await import("../../drizzle/schema");
    const { eq, and, gte } = await import("drizzle-orm");

    // Get category details
    const category = await dbConn
      .select()
      .from(budgetCategories)
      .where(and(
        eq(budgetCategories.id, categoryId),
        eq(budgetCategories.userId, userId)
      ))
      .limit(1);

    if (category.length === 0) {
      return null;
    }

    // Calculate start date
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);

    // Get transactions
    const transactions = await dbConn
      .select({
        amount: budgetTransactions.amount,
        transactionDate: budgetTransactions.transactionDate,
      })
      .from(budgetTransactions)
      .where(and(
        eq(budgetTransactions.userId, userId),
        eq(budgetTransactions.categoryId, categoryId),
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

    // Calculate trends
    const monthKeys = Object.keys(monthlyTotals).sort();
    const trends = monthKeys.map((month, index) => {
      const current = monthlyTotals[month];
      const previous = index > 0 ? monthlyTotals[monthKeys[index - 1]] : null;
      
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
  }

  async getSpendingTrendsSummary(userId: number, months: number) {
    const dbConn = await import("../db").then(m => m.getDb());
    if (!dbConn) return null;

    const { budgetTransactions, budgetCategories } = await import("../../drizzle/schema");
    const { eq, and, gte } = await import("drizzle-orm");

    // Calculate start date
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setDate(1);

    // Get all transactions
    const transactions = await dbConn
      .select({
        amount: budgetTransactions.amount,
        transactionDate: budgetTransactions.transactionDate,
        categoryType: budgetCategories.type,
      })
      .from(budgetTransactions)
      .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
      .where(and(
        eq(budgetTransactions.userId, userId),
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
    const monthKeys = Object.keys(monthlyData).sort();
    const trends = monthKeys.map((month, index) => {
      const current = monthlyData[month];
      const previous = index > 0 ? monthlyData[monthKeys[index - 1]] : null;
      
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
  }
}
