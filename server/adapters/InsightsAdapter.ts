/**
 * InsightsAdapter - Interface for financial insights operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

export interface InsightsAdapter {
  /**
   * Analyze spending patterns and generate AI-powered insights
   */
  generateSpendingInsights(userId: number): Promise<{ success: boolean; insightsCount: number }>;

  /**
   * Generate cost-cutting recommendations based on spending analysis
   */
  generateCostCuttingRecommendations(userId: number): Promise<string[]>;
}
