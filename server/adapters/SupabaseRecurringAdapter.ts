/**
 * SupabaseRecurringAdapter - Supabase implementation for recurring transaction operations
 * 
 * Used for regular users. Enforces Row-Level Security (RLS) at database level.
 */

import { RecurringAdapter } from "./RecurringAdapter";
import { getSupabaseClient } from "../supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseRecurringAdapter implements RecurringAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.accessToken);
  }

  async detectRecurringPatterns(userId: number): Promise<{ success: boolean; patternsFound: number }> {
    const client = await this.getClient();

    // Get last 6 months of transactions
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const { data: transactions, error } = await client
      .from("budget_transactions")
      .select(`
        id,
        amount,
        transaction_date,
        description,
        category_id,
        category:budget_categories(name)
      `)
      .eq("user_id", userId)
      .gte("transaction_date", sixMonthsAgo.toISOString())
      .order("transaction_date", { ascending: false });

    if (error || !transactions || transactions.length < 3) {
      return { success: false, patternsFound: 0 };
    }

    // Group transactions by description
    const patterns: Map<string, {
      amounts: number[];
      dates: Date[];
      categoryId: number;
    }> = new Map();

    for (const tx of transactions) {
      if (!tx.description) continue;

      const key = tx.description.toLowerCase().trim();
      if (!patterns.has(key)) {
        patterns.set(key, { amounts: [], dates: [], categoryId: tx.category_id });
      }

      const pattern = patterns.get(key)!;
      pattern.amounts.push(tx.amount);
      pattern.dates.push(new Date(tx.transaction_date));
    }

    let patternsFound = 0;

    // Analyze each pattern
    for (const [description, data] of Array.from(patterns.entries())) {
      if (data.amounts.length < 2) continue;

      // Calculate average amount
      const avgAmount = data.amounts.reduce((sum: number, amt: number) => sum + amt, 0) / data.amounts.length;

      // Calculate amount variance
      const variance = data.amounts.reduce((sum: number, amt: number) => sum + Math.pow(amt - avgAmount, 2), 0) / data.amounts.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgAmount;

      // If amounts are consistent (low variation), likely recurring
      if (coefficientOfVariation < 0.25 && data.amounts.length >= 2) {
        // Determine frequency
        const sortedDates = data.dates.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const intervals: number[] = [];

        for (let i = 1; i < sortedDates.length; i++) {
          const daysDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          intervals.push(daysDiff);
        }

        if (intervals.length === 0) continue;

        const avgInterval = intervals.reduce((sum: number, int: number) => sum + int, 0) / intervals.length;

        let frequency: "weekly" | "biweekly" | "monthly" | "quarterly" | "yearly" = "monthly";
        if (avgInterval < 10) frequency = "weekly";
        else if (avgInterval < 20) frequency = "biweekly";
        else if (avgInterval < 40) frequency = "monthly";
        else if (avgInterval < 120) frequency = "quarterly";
        else frequency = "yearly";

        const confidence = Math.min(95, Math.round((1 - coefficientOfVariation) * 100));

        // Calculate next expected date
        const lastDate = sortedDates[sortedDates.length - 1];
        const nextExpectedDate = new Date(lastDate);

        switch (frequency) {
          case "weekly":
            nextExpectedDate.setDate(nextExpectedDate.getDate() + 7);
            break;
          case "biweekly":
            nextExpectedDate.setDate(nextExpectedDate.getDate() + 14);
            break;
          case "monthly":
            nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 1);
            break;
          case "quarterly":
            nextExpectedDate.setMonth(nextExpectedDate.getMonth() + 3);
            break;
          case "yearly":
            nextExpectedDate.setFullYear(nextExpectedDate.getFullYear() + 1);
            break;
        }

        // Check if this pattern already exists
        const { data: existing } = await client
          .from("recurring_transactions")
          .select()
          .eq("user_id", userId)
          .eq("description", description)
          .eq("is_active", true)
          .limit(1)
          .single();

        // Determine if it's a subscription
        const subscriptionKeywords = ["netflix", "spotify", "hulu", "prime", "subscription", "membership", "monthly fee", "annual fee"];
        const isSubscription = subscriptionKeywords.some(keyword => description.toLowerCase().includes(keyword));

        if (!existing) {
          // Create new recurring pattern
          await client.from("recurring_transactions").insert({
            user_id: userId,
            category_id: data.categoryId,
            description,
            average_amount: Math.round(avgAmount),
            frequency,
            next_expected_date: nextExpectedDate.toISOString(),
            last_occurrence: lastDate.toISOString(),
            confidence,
            is_active: true,
            is_subscription: isSubscription,
            reminder_enabled: true,
            auto_add: false,
          });

          patternsFound++;
        } else {
          // Update existing pattern
          await client
            .from("recurring_transactions")
            .update({
              average_amount: Math.round(avgAmount),
              frequency,
              next_expected_date: nextExpectedDate.toISOString(),
              last_occurrence: lastDate.toISOString(),
              confidence,
              is_subscription: isSubscription,
              updated_at: new Date().toISOString(),
            })
            .eq("id", existing.id);
        }
      }
    }

    return { success: true, patternsFound };
  }

  async getUserRecurringTransactions(userId: number, activeOnly: boolean = true): Promise<any[]> {
    const client = await this.getClient();

    let query = client
      .from("recurring_transactions")
      .select(`
        *,
        category:budget_categories(name, icon)
      `)
      .eq("user_id", userId);

    if (activeOnly) {
      query = query.eq("is_active", true);
    }

    const { data, error } = await query.order("next_expected_date", { ascending: false });

    if (error) {
      console.error("[SupabaseRecurringAdapter] getUserRecurringTransactions error:", error);
      return [];
    }

    return data || [];
  }

  async calculateRecurringProjections(userId: number): Promise<{
    monthlyTotal: number;
    quarterlyTotal: number;
    yearlyTotal: number;
    byCategory: Record<string, number>;
  }> {
    const recurring = await this.getUserRecurringTransactions(userId, true);

    let monthlyTotal = 0;
    let quarterlyTotal = 0;
    let yearlyTotal = 0;
    const byCategory: Record<string, number> = {};

    for (const rec of recurring) {
      const amount = rec.average_amount;
      const category = rec.category?.name || "Other";

      // Convert to monthly equivalent
      let monthlyEquivalent = 0;
      switch (rec.frequency) {
        case "weekly":
          monthlyEquivalent = amount * 4.33; // Average weeks per month
          break;
        case "biweekly":
          monthlyEquivalent = amount * 2.17; // Average biweeks per month
          break;
        case "monthly":
          monthlyEquivalent = amount;
          break;
        case "quarterly":
          monthlyEquivalent = amount / 3;
          break;
        case "yearly":
          monthlyEquivalent = amount / 12;
          break;
      }

      monthlyTotal += monthlyEquivalent;
      quarterlyTotal += monthlyEquivalent * 3;
      yearlyTotal += monthlyEquivalent * 12;

      if (!byCategory[category]) {
        byCategory[category] = 0;
      }
      byCategory[category] += monthlyEquivalent;
    }

    return {
      monthlyTotal: Math.round(monthlyTotal),
      quarterlyTotal: Math.round(quarterlyTotal),
      yearlyTotal: Math.round(yearlyTotal),
      byCategory: Object.fromEntries(
        Object.entries(byCategory).map(([cat, amt]) => [cat, Math.round(amt)])
      ),
    };
  }

  async updateRecurringTransaction(
    userId: number,
    recurringId: number,
    updates: {
      reminderEnabled?: boolean;
      autoAdd?: boolean;
      isActive?: boolean;
      notes?: string;
    }
  ): Promise<{ success: boolean }> {
    const client = await this.getClient();

    const updateData: any = {};
    if (updates.reminderEnabled !== undefined) {
      updateData.reminder_enabled = updates.reminderEnabled;
    }
    if (updates.autoAdd !== undefined) {
      updateData.auto_add = updates.autoAdd;
    }
    if (updates.isActive !== undefined) {
      updateData.is_active = updates.isActive;
    }
    if (updates.notes !== undefined) {
      updateData.notes = updates.notes;
    }

    const { error } = await client
      .from("recurring_transactions")
      .update(updateData)
      .eq("id", recurringId)
      .eq("user_id", userId);

    if (error) {
      console.error("[SupabaseRecurringAdapter] updateRecurringTransaction error:", error);
      return { success: false };
    }

    return { success: true };
  }

  async getUpcomingRecurring(userId: number): Promise<Array<{
    id: number;
    description: string;
    amount: number;
    dueDate: Date;
    daysUntilDue: number;
    category: string;
  }>> {
    const client = await this.getClient();

    const now = new Date();
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const { data: recurring, error } = await client
      .from("recurring_transactions")
      .select(`
        id,
        description,
        average_amount,
        next_expected_date,
        category:budget_categories(name)
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .gte("next_expected_date", now.toISOString())
      .lte("next_expected_date", thirtyDaysFromNow.toISOString())
      .order("next_expected_date", { ascending: true });

    if (error) {
      console.error("[SupabaseRecurringAdapter] getUpcomingRecurring error:", error);
      return [];
    }

    if (!recurring) return [];

    return recurring.map((rec: any) => {
      const dueDate = new Date(rec.next_expected_date);
      const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: rec.id,
        description: rec.description,
        amount: rec.average_amount,
        dueDate,
        daysUntilDue,
        category: rec.category?.name || "Other",
      };
    });
  }
}
