/**
 * RecurringAdapter - Interface for recurring transaction operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

export interface RecurringAdapter {
  /**
   * Detect recurring transaction patterns for a user
   */
  detectRecurringPatterns(userId: number): Promise<{ success: boolean; patternsFound: number }>;

  /**
   * Get recurring transactions for a user
   */
  getUserRecurringTransactions(userId: number, activeOnly?: boolean): Promise<any[]>;

  /**
   * Calculate projected monthly expenses from recurring transactions
   */
  calculateRecurringProjections(userId: number): Promise<{
    monthlyTotal: number;
    quarterlyTotal: number;
    yearlyTotal: number;
    byCategory: Record<string, number>;
  }>;

  /**
   * Update recurring transaction settings
   */
  updateRecurringTransaction(
    userId: number,
    recurringId: number,
    updates: {
      reminderEnabled?: boolean;
      autoAdd?: boolean;
      isActive?: boolean;
      notes?: string;
    }
  ): Promise<{ success: boolean }>;

  /**
   * Get upcoming recurring transactions (next 30 days)
   */
  getUpcomingRecurring(userId: number): Promise<Array<{
    id: number;
    description: string;
    amount: number;
    dueDate: Date;
    daysUntilDue: number;
    category: string;
  }>>;
}
