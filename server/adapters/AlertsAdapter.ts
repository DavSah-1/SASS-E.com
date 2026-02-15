/**
 * AlertsAdapter - Interface for budget alert operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

export interface AlertsAdapter {
  /**
   * Check if user should receive a specific type of alert based on preferences
   */
  shouldSendAlert(userId: number, alertType: string): Promise<boolean>;

  /**
   * Create a budget alert
   */
  createBudgetAlert(
    userId: number,
    alertType: "threshold_80" | "threshold_100" | "exceeded" | "weekly_summary" | "monthly_report",
    message: string,
    categoryId?: number,
    threshold?: number
  ): Promise<void>;

  /**
   * Check category spending and generate alerts if thresholds are exceeded
   */
  checkCategoryAlerts(userId: number, categoryId: number): Promise<void>;

  /**
   * Check all categories for a user and generate alerts
   */
  checkAllCategoryAlerts(userId: number): Promise<void>;

  /**
   * Generate weekly spending summary alert
   */
  generateWeeklySummary(userId: number): Promise<void>;

  /**
   * Generate monthly budget report alert
   */
  generateMonthlyReport(userId: number): Promise<void>;
}
