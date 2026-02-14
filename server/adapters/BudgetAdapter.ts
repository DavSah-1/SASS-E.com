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

  /**
   * Monthly Budget Summaries
   */
  calculateMonthlyBudgetSummary(userId: number, monthYear: string): Promise<any>;
  saveMonthlyBudgetSummary(summary: any): Promise<any>;
  getUserMonthlyBudgetSummaries(userId: number, limit?: number): Promise<any[]>;
}
