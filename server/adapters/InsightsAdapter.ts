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

  /**
   * Get financial insights for a user with optional filtering
   */
  getInsights(userId: number, options: { activeOnly?: boolean; limit?: number }): Promise<Array<{
    id: number;
    userId: number;
    insightType: string;
    title: string;
    description: string;
    priority: number;
    isDismissed: number;
    expiresAt: Date | null;
    createdAt: Date;
  }>>;

  /**
   * Dismiss a financial insight
   */
  dismissInsight(userId: number, insightId: number): Promise<{ success: boolean; message?: string }>;
}
