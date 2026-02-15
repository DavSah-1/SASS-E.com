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

  async getInsights(userId: number, options: { activeOnly?: boolean; limit?: number }) {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return [];

    const { financialInsights } = await import("../../drizzle/schema");
    const { eq, and, desc, or, isNull, gt } = await import("drizzle-orm");

    let whereConditions = [eq(financialInsights.userId, userId)];
    
    if (options.activeOnly) {
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
      .limit(options.limit || 10);

    return insights;
  }

  async dismissInsight(userId: number, insightId: number): Promise<{ success: boolean; message?: string }> {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return { success: false };

    const { financialInsights } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(financialInsights)
      .set({ isDismissed: 1 })
      .where(eq(financialInsights.id, insightId));

    return { success: true, message: "Insight dismissed" };
  }
}
