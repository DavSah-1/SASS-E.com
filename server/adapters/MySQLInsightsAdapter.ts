/**
 * MySQLInsightsAdapter - MySQL implementation for financial insights operations
 * 
 * Used for admin users. Delegates to server/db/insights.ts functions.
 */

import { InsightsAdapter } from "./InsightsAdapter";
import * as insightsDb from "../db/insights";

export class MySQLInsightsAdapter implements InsightsAdapter {
  async generateSpendingInsights(userId: number): Promise<{ success: boolean; insightsCount: number }> {
    return insightsDb.generateSpendingInsights(userId);
  }

  async generateCostCuttingRecommendations(userId: number): Promise<string[]> {
    return insightsDb.generateCostCuttingRecommendations(userId);
  }
}
