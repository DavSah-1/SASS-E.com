/**
 * MySQLAlertsAdapter - MySQL implementation for budget alert operations
 * 
 * Used for admin users. Delegates to server/db/alerts.ts functions.
 */

import { AlertsAdapter } from "./AlertsAdapter";
import * as alertsDb from "../db/alerts";

export class MySQLAlertsAdapter implements AlertsAdapter {
  async shouldSendAlert(userId: number, alertType: string): Promise<boolean> {
    return alertsDb.shouldSendAlert(userId, alertType);
  }

  async createBudgetAlert(
    userId: number,
    alertType: "threshold_80" | "threshold_100" | "exceeded" | "weekly_summary" | "monthly_report",
    message: string,
    categoryId?: number,
    threshold?: number
  ): Promise<void> {
    return alertsDb.createBudgetAlert(userId, alertType, message, categoryId, threshold);
  }

  async checkCategoryAlerts(userId: number, categoryId: number): Promise<void> {
    return alertsDb.checkCategoryAlerts(userId, categoryId);
  }

  async checkAllCategoryAlerts(userId: number): Promise<void> {
    return alertsDb.checkAllCategoryAlerts(userId);
  }

  async generateWeeklySummary(userId: number): Promise<void> {
    return alertsDb.generateWeeklySummary(userId);
  }

  async generateMonthlyReport(userId: number): Promise<void> {
    return alertsDb.generateMonthlyReport(userId);
  }

  async getAlerts(userId: number, options: { limit?: number; unreadOnly?: boolean }) {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return [];

    const { budgetAlerts } = await import("../../drizzle/schema");
    const { eq, and, desc } = await import("drizzle-orm");

    let query = db
      .select()
      .from(budgetAlerts)
      .where(eq(budgetAlerts.userId, userId))
      .orderBy(desc(budgetAlerts.createdAt));

    if (options.unreadOnly) {
      query = query.where(and(eq(budgetAlerts.userId, userId), eq(budgetAlerts.isRead, 0)));
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    return query;
  }

  async markAlertRead(userId: number, alertId: number): Promise<{ success: boolean }> {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return { success: false };

    const { budgetAlerts } = await import("../../drizzle/schema");
    const { eq, and } = await import("drizzle-orm");

    await db
      .update(budgetAlerts)
      .set({ isRead: 1 })
      .where(
        and(
          eq(budgetAlerts.id, alertId),
          eq(budgetAlerts.userId, userId)
        )
      );

    return { success: true };
  }

  async markAllAlertsRead(userId: number): Promise<{ success: boolean }> {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return { success: false };

    const { budgetAlerts } = await import("../../drizzle/schema");
    const { eq } = await import("drizzle-orm");

    await db
      .update(budgetAlerts)
      .set({ isRead: 1 })
      .where(eq(budgetAlerts.userId, userId));

    return { success: true };
  }

  async getUnreadAlertCount(userId: number): Promise<number> {
    const db = await import("../db").then(m => m.getDb());
    if (!db) return 0;

    const { budgetAlerts } = await import("../../drizzle/schema");
    const { eq, and, count } = await import("drizzle-orm");

    const result = await db
      .select({ count: count() })
      .from(budgetAlerts)
      .where(
        and(
          eq(budgetAlerts.userId, userId),
          eq(budgetAlerts.isRead, 0)
        )
      );

    return result[0]?.count || 0;
  }
}
