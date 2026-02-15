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
}
