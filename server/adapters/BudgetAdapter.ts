/**
 * BudgetAdapter Interface
 * 
 * Defines all budget-related database operations.
 * Implementations handle routing to MySQL (admin) or Supabase (user) databases.
 */

export interface BudgetAdapter {
  /**
   * Budget Snapshots
   */
  saveBudgetSnapshot(snapshot: any): Promise<any>;
  getBudgetSnapshots(userId: number, limit?: number): Promise<any[]>;

  /**
   * Budget Categories
   */
  createBudgetCategory(category: any): Promise<any>;
  getUserBudgetCategories(userId: number, type?: "income" | "expense"): Promise<any[]>;
  updateBudgetCategory(categoryId: number, updates: any): Promise<any>;
  deleteBudgetCategory(categoryId: number): Promise<any>;

  /**
   * Budget Transactions
   */
  createBudgetTransaction(transaction: any): Promise<any>;
  getUserBudgetTransactions(userId: number, options?: { categoryId?: number; startDate?: Date; endDate?: Date }): Promise<any[]>;
  updateBudgetTransaction(transactionId: number, updates: any): Promise<any>;
  deleteBudgetTransaction(transactionId: number): Promise<any>;
  findDuplicateTransaction(userId: number, date: string, amount: number, description: string): Promise<any | null>;

  /**
   * Monthly Budget Summaries
   */
  calculateMonthlyBudgetSummary(userId: number, monthYear: string): Promise<any>;
  saveMonthlyBudgetSummary(summary: any): Promise<any>;
  getUserMonthlyBudgetSummaries(userId: number, limit?: number): Promise<any[]>;

  /**
   * Category Spending Analysis
   */
  getCategorySpendingBreakdown(userId: number, monthYear: string): Promise<any[]>;

  /**
   * Budget Templates
   */
  getTemplates(userId: number): Promise<any[]>;
  applyTemplate(userId: number, templateId: number, monthlyIncome: number): Promise<{ success: boolean; message?: string; categoriesCreated?: number }>;
  getActiveTemplate(userId: number): Promise<{ application: any; template: any } | null>;

  /**
   * Spending Trends
   */
  getSpendingTrends(userId: number, startMonth: string, endMonth: string, categoryId?: number): Promise<Array<{
    month: string;
    categories: Array<{
      total: number;
      count: number;
      category: {
        id: number;
        name: string | null;
        type: string | null;
        color: string | null;
        icon: string | null;
      };
    }>;
    totalSpending: number;
    totalIncome: number;
  }>>;
  
  getCategoryTrend(userId: number, categoryId: number, months: number): Promise<{
    category: any;
    trends: Array<{
      month: string;
      total: number;
      count: number;
      average: number;
      percentageChange: number;
      trend: string;
    }>;
    overallAverage: number;
  } | null>;
  
  getSpendingTrendsSummary(userId: number, months: number): Promise<{
    trends: Array<{
      month: string;
      income: number;
      expenses: number;
      netCashFlow: number;
      savingsRate: number;
      expenseChange: number;
    }>;
    summary: {
      avgMonthlyIncome: number;
      avgMonthlyExpenses: number;
      avgSavingsRate: number;
      totalMonths: number;
    };
  } | null>;
}
