/**
 * SupabaseAlertsAdapter - Supabase implementation for budget alert operations
 * 
 * Used for regular users. Enforces Row-Level Security (RLS) at database level.
 */

import { AlertsAdapter } from "./AlertsAdapter";
import { getSupabaseClient } from "../supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseAlertsAdapter implements AlertsAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.accessToken);
  }

  async shouldSendAlert(userId: number, alertType: string): Promise<boolean> {
    const client = await this.getClient();

    const { data, error } = await client
      .from("notification_preferences")
      .select()
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (error || !data) {
      // Default to enabled if no preferences set
      return true;
    }

    switch (alertType) {
      case "threshold_80":
        return data.threshold_80_enabled === true;
      case "threshold_100":
        return data.threshold_100_enabled === true;
      case "exceeded":
        return data.exceeded_enabled === true;
      case "weekly_summary":
        return data.weekly_summary_enabled === true;
      case "monthly_report":
        return data.monthly_summary_enabled === true;
      default:
        return data.budget_alerts_enabled === true;
    }
  }

  async createBudgetAlert(
    userId: number,
    alertType: "threshold_80" | "threshold_100" | "exceeded" | "weekly_summary" | "monthly_report",
    message: string,
    categoryId?: number,
    threshold?: number
  ): Promise<void> {
    const client = await this.getClient();

    // Check if user wants this type of alert
    const shouldSend = await this.shouldSendAlert(userId, alertType);
    if (!shouldSend) return;

    // Check if similar alert already exists (avoid duplicates)
    let query = client
      .from("budget_alerts")
      .select()
      .eq("user_id", userId)
      .eq("alert_type", alertType)
      .eq("is_read", false);

    if (categoryId) {
      query = query.eq("category_id", categoryId);
    } else {
      query = query.is("category_id", null);
    }

    const { data: existingAlerts } = await query;

    if (existingAlerts && existingAlerts.length > 0) {
      // Alert already exists, don't create duplicate
      return;
    }

    // Create the alert
    const { error } = await client
      .from("budget_alerts")
      .insert({
        user_id: userId,
        category_id: categoryId || null,
        alert_type: alertType,
        threshold: threshold || null,
        message,
        is_read: false,
      });

    if (error) {
      console.error("[SupabaseAlertsAdapter] createBudgetAlert error:", error);
    }

    // Note: Push notifications would be handled separately via Supabase Edge Functions
  }

  async checkCategoryAlerts(userId: number, categoryId: number): Promise<void> {
    const client = await this.getClient();

    // Get category details
    const { data: category, error: catError } = await client
      .from("budget_categories")
      .select()
      .eq("id", categoryId)
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (catError || !category || !category.monthly_limit) {
      return; // No limit set, no alerts needed
    }

    const limit = category.monthly_limit;

    // Get current month spending for this category
    const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
    const startDate = new Date(currentMonth + "-01");
    const endDate = new Date(currentMonth + "-01");
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: transactions } = await client
      .from("budget_transactions")
      .select("amount")
      .eq("user_id", userId)
      .eq("category_id", categoryId)
      .gte("transaction_date", startDate.toISOString())
      .lt("transaction_date", endDate.toISOString());

    const totalSpent = (transactions || []).reduce((sum, tx) => sum + tx.amount, 0);
    const percentageUsed = (totalSpent / limit) * 100;

    // Check thresholds and create alerts
    if (percentageUsed >= 100 && totalSpent > limit) {
      await this.createBudgetAlert(
        userId,
        "exceeded",
        `🚨 You've exceeded your ${category.icon} ${category.name} budget! Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
        categoryId
      );
    } else if (percentageUsed >= 100) {
      await this.createBudgetAlert(
        userId,
        "threshold_100",
        `⚠️ You've reached 100% of your ${category.icon} ${category.name} budget. Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
        categoryId,
        100
      );
    } else if (percentageUsed >= 80) {
      await this.createBudgetAlert(
        userId,
        "threshold_80",
        `⚡ You've used ${Math.round(percentageUsed)}% of your ${category.icon} ${category.name} budget. Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
        categoryId,
        80
      );
    }
  }

  async checkAllCategoryAlerts(userId: number): Promise<void> {
    const client = await this.getClient();

    const { data: categories } = await client
      .from("budget_categories")
      .select()
      .eq("user_id", userId)
      .not("monthly_limit", "is", null);

    if (!categories) return;

    for (const category of categories) {
      await this.checkCategoryAlerts(userId, category.id);
    }
  }

  async generateWeeklySummary(userId: number): Promise<void> {
    const client = await this.getClient();

    // Get transactions from the past 7 days
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: transactions } = await client
      .from("budget_transactions")
      .select(`
        amount,
        category:budget_categories(type)
      `)
      .eq("user_id", userId)
      .gte("transaction_date", weekAgo.toISOString());

    if (!transactions) return;

    const totalIncome = transactions
      .filter((tx: any) => tx.category?.type === "income")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const totalExpenses = transactions
      .filter((tx: any) => tx.category?.type === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;

    const message = `📊 Weekly Summary: Income $${(totalIncome / 100).toFixed(2)}, Expenses $${(totalExpenses / 100).toFixed(2)}, Net ${netCashFlow >= 0 ? '+' : ''}$${(netCashFlow / 100).toFixed(2)}`;

    await this.createBudgetAlert(userId, "weekly_summary", message);
  }

  async generateMonthlyReport(userId: number): Promise<void> {
    const client = await this.getClient();

    // Get current month transactions
    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = new Date(currentMonth + "-01");
    const endDate = new Date(currentMonth + "-01");
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: transactions } = await client
      .from("budget_transactions")
      .select(`
        amount,
        category:budget_categories(type)
      `)
      .eq("user_id", userId)
      .gte("transaction_date", startDate.toISOString())
      .lt("transaction_date", endDate.toISOString());

    if (!transactions) return;

    const totalIncome = transactions
      .filter((tx: any) => tx.category?.type === "income")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const totalExpenses = transactions
      .filter((tx: any) => tx.category?.type === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const netCashFlow = totalIncome - totalExpenses;
    const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : "0.0";

    const message = `📈 Monthly Report for ${currentMonth}: Income $${(totalIncome / 100).toFixed(2)}, Expenses $${(totalExpenses / 100).toFixed(2)}, Savings Rate ${savingsRate}%`;

    await this.createBudgetAlert(userId, "monthly_report", message);
  }

  async getAlerts(userId: number, options: { limit?: number; unreadOnly?: boolean }) {
    const client = await this.getClient();

    let query = client
      .from("budget_alerts")
      .select()
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (options.unreadOnly) {
      query = query.eq("is_read", false);
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SupabaseAlertsAdapter] getAlerts error:", error);
      return [];
    }

    return (data || []).map(alert => ({
      id: alert.id,
      userId: alert.user_id,
      alertType: alert.alert_type,
      message: alert.message,
      categoryId: alert.category_id,
      threshold: alert.threshold,
      isRead: alert.is_read ? 1 : 0,
      createdAt: new Date(alert.created_at),
    }));
  }

  async markAlertRead(userId: number, alertId: number): Promise<{ success: boolean }> {
    const client = await this.getClient();

    const { error } = await client
      .from("budget_alerts")
      .update({ is_read: true })
      .eq("id", alertId)
      .eq("user_id", userId);

    if (error) {
      console.error("[SupabaseAlertsAdapter] markAlertRead error:", error);
      return { success: false };
    }

    return { success: true };
  }

  async markAllAlertsRead(userId: number): Promise<{ success: boolean }> {
    const client = await this.getClient();

    const { error } = await client
      .from("budget_alerts")
      .update({ is_read: true })
      .eq("user_id", userId);

    if (error) {
      console.error("[SupabaseAlertsAdapter] markAllAlertsRead error:", error);
      return { success: false };
    }

    return { success: true };
  }

  async getUnreadAlertCount(userId: number): Promise<number> {
    const client = await this.getClient();

    const { count, error } = await client
      .from("budget_alerts")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .eq("is_read", false);

    if (error) {
      console.error("[SupabaseAlertsAdapter] getUnreadAlertCount error:", error);
      return 0;
    }

    return count || 0;
  }
}
