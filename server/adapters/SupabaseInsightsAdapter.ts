/**
 * SupabaseInsightsAdapter - Supabase implementation for financial insights operations
 * 
 * Used for regular users. Enforces Row-Level Security (RLS) at database level.
 * 
 * Note: This adapter uses the LLM service which is available server-side.
 * The insights generation logic is complex and relies on AI analysis.
 */

import { InsightsAdapter } from "./InsightsAdapter";
import { getSupabaseClient } from "../supabaseClient";
import { invokeLLM } from "../_core/llm";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseInsightsAdapter implements InsightsAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.accessToken);
  }

  async generateSpendingInsights(userId: number): Promise<{ success: boolean; insightsCount: number }> {
    const client = await this.getClient();

    // Get last 3 months of transactions
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const { data: transactions, error } = await client
      .from("budget_transactions")
      .select(`
        amount,
        transaction_date,
        description,
        category_id,
        category:budget_categories(name, type, monthly_limit)
      `)
      .eq("user_id", userId)
      .gte("transaction_date", threeMonthsAgo.toISOString())
      .order("transaction_date", { ascending: false });

    if (error || !transactions || transactions.length === 0) {
      return { success: false, insightsCount: 0 };
    }

    // Calculate spending by category
    const categorySpending: Record<string, { total: number; count: number; limit: number | null }> = {};

    for (const tx of transactions) {
      const catName = (tx.category as any)?.name || "Other";
      const catType = (tx.category as any)?.type;
      const catLimit = (tx.category as any)?.monthly_limit;

      if (catType === "expense") {
        if (!categorySpending[catName]) {
          categorySpending[catName] = { total: 0, count: 0, limit: catLimit };
        }
        categorySpending[catName].total += tx.amount;
        categorySpending[catName].count += 1;
      }
    }

    // Calculate total income and expenses
    const totalIncome = transactions
      .filter((tx: any) => tx.category?.type === "income")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const totalExpenses = transactions
      .filter((tx: any) => tx.category?.type === "expense")
      .reduce((sum: number, tx: any) => sum + tx.amount, 0);

    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;

    // Find top spending categories
    const topCategories = Object.entries(categorySpending)
      .sort((a, b) => b[1].total - a[1].total)
      .slice(0, 5)
      .map(([name, data]) => ({
        name,
        total: data.total,
        count: data.count,
        limit: data.limit,
        percentOfLimit: data.limit ? (data.total / data.limit) * 100 : null,
      }));

    // Detect recurring patterns (simplified version)
    const recurringPatterns = this.detectRecurringTransactions(transactions);

    // Get active template if any
    const { data: activeTemplate } = await client
      .from("user_budget_templates")
      .select(`
        template:budget_templates(name, strategy)
      `)
      .eq("user_id", userId)
      .eq("is_active", true)
      .limit(1)
      .single();

    // Build prompt for LLM
    const templateInfo = activeTemplate?.template ? `- Active Budget Template: ${(activeTemplate.template as any).name}` : '';

    const prompt = `You are SASS-E, a sarcastic but helpful financial advisor AI. Analyze the following spending data and generate 3-5 actionable insights with your signature wit.

**User's Financial Data (Last 3 Months):**
- Total Income: $${(totalIncome / 100).toFixed(2)}
- Total Expenses: $${(totalExpenses / 100).toFixed(2)}
- Savings Rate: ${savingsRate.toFixed(1)}%
${templateInfo}

**Top Spending Categories:**
${topCategories.map(c => `- ${c.name}: $${(c.total / 100).toFixed(2)} (${c.count} transactions)${c.limit ? ` - ${c.percentOfLimit!.toFixed(0)}% of limit` : ''}`).join('\n')}

**Detected Recurring Expenses:**
${recurringPatterns.slice(0, 5).map(p => `- ${p.description}: $${(p.avgAmount / 100).toFixed(2)} ${p.frequency}`).join('\n')}

Generate insights in JSON format:
{
  "insights": [
    {
      "type": "spending_pattern" | "saving_opportunity" | "cash_flow_prediction" | "budget_recommendation" | "trend_analysis",
      "title": "Catchy sarcastic title (max 60 chars)",
      "description": "Detailed analysis with SASS-E's signature sarcasm (2-3 sentences)",
      "actionable": true/false,
      "actionText": "Specific action user should take (if actionable)",
      "priority": "low" | "medium" | "high",
      "relatedCategory": "category name if relevant (optional)",
      "potentialSavings": amount in cents if applicable (optional)
    }
  ]
}

Focus on:
1. Categories where spending is high or growing
2. Subscription/recurring cost optimization
3. Savings rate improvement suggestions
4. Budget template recommendations if not using one
5. Unusual spending patterns or anomalies

Be sarcastic but genuinely helpful. Make the insights actionable and specific.`;

    try {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are SASS-E, a sarcastic financial advisor AI. Be witty but helpful." },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
      });

      const content = response.choices?.[0]?.message?.content;
      if (!content || typeof content !== 'string') {
        throw new Error("No content in LLM response");
      }

      const result = JSON.parse(content);

      // Save insights to database
      let insightsCount = 0;
      for (const insight of result.insights) {
        // Find related category ID if specified
        let relatedCategoryId: number | null = null;
        if (insight.relatedCategory) {
          const { data: category } = await client
            .from("budget_categories")
            .select("id")
            .eq("user_id", userId)
            .eq("name", insight.relatedCategory)
            .limit(1)
            .single();

          if (category) {
            relatedCategoryId = category.id;
          }
        }

        await client.from("financial_insights").insert({
          user_id: userId,
          insight_type: insight.type,
          title: insight.title,
          description: insight.description,
          actionable: insight.actionable || false,
          action_text: insight.actionText || null,
          priority: insight.priority,
          related_category_id: relatedCategoryId,
          data_points: JSON.stringify({
            potentialSavings: insight.potentialSavings || null,
            generatedAt: new Date().toISOString(),
          }),
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        });

        insightsCount++;
      }

      return { success: true, insightsCount };
    } catch (error) {
      console.error("[SupabaseInsightsAdapter] generateSpendingInsights error:", error);
      return { success: false, insightsCount: 0 };
    }
  }

  /**
   * Detect recurring transaction patterns (simplified helper)
   */
  private detectRecurringTransactions(transactions: any[]): Array<{
    description: string;
    avgAmount: number;
    frequency: string;
    confidence: number;
  }> {
    const patterns: Map<string, {
      amounts: number[];
      dates: Date[];
    }> = new Map();

    // Group transactions by description
    for (const tx of transactions) {
      if (!tx.description) continue;

      const key = tx.description.toLowerCase().trim();
      if (!patterns.has(key)) {
        patterns.set(key, { amounts: [], dates: [] });
      }

      const pattern = patterns.get(key)!;
      pattern.amounts.push(tx.amount);
      pattern.dates.push(new Date(tx.transaction_date));
    }

    const recurring: Array<{
      description: string;
      avgAmount: number;
      frequency: string;
      confidence: number;
    }> = [];

    // Analyze patterns
    for (const [description, data] of Array.from(patterns.entries())) {
      if (data.amounts.length < 2) continue;

      // Calculate average amount
      const avgAmount = data.amounts.reduce((sum: number, amt: number) => sum + amt, 0) / data.amounts.length;

      // Calculate amount variance
      const variance = data.amounts.reduce((sum: number, amt: number) => sum + Math.pow(amt - avgAmount, 2), 0) / data.amounts.length;
      const stdDev = Math.sqrt(variance);
      const coefficientOfVariation = stdDev / avgAmount;

      // If amounts are consistent (low variation), likely recurring
      if (coefficientOfVariation < 0.2 && data.amounts.length >= 2) {
        // Determine frequency
        const sortedDates = data.dates.sort((a: Date, b: Date) => a.getTime() - b.getTime());
        const intervals: number[] = [];

        for (let i = 1; i < sortedDates.length; i++) {
          const daysDiff = (sortedDates[i].getTime() - sortedDates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
          intervals.push(daysDiff);
        }

        const avgInterval = intervals.reduce((sum: number, int: number) => sum + int, 0) / intervals.length;

        let frequency = "monthly";
        if (avgInterval < 10) frequency = "weekly";
        else if (avgInterval < 20) frequency = "biweekly";
        else if (avgInterval < 40) frequency = "monthly";
        else frequency = "quarterly";

        recurring.push({
          description,
          avgAmount,
          frequency,
          confidence: Math.min(0.9, 1 - coefficientOfVariation),
        });
      }
    }

    return recurring.sort((a, b) => b.avgAmount - a.avgAmount);
  }

  async generateCostCuttingRecommendations(userId: number): Promise<string[]> {
    const client = await this.getClient();
    const recommendations: string[] = [];

    // Get category spending for current month
    const currentMonth = new Date().toISOString().slice(0, 7);
    const startDate = new Date(currentMonth + "-01");
    const endDate = new Date(currentMonth + "-01");
    endDate.setMonth(endDate.getMonth() + 1);

    const { data: transactions } = await client
      .from("budget_transactions")
      .select(`
        amount,
        category:budget_categories(name, monthly_limit)
      `)
      .eq("user_id", userId)
      .gte("transaction_date", startDate.toISOString())
      .lt("transaction_date", endDate.toISOString());

    if (!transactions) return [];

    const categoryTotals: Record<string, { total: number; limit: number | null }> = {};

    for (const tx of transactions) {
      const catName = (tx.category as any)?.name || "Other";
      const catLimit = (tx.category as any)?.monthly_limit;

      if (!categoryTotals[catName]) {
        categoryTotals[catName] = { total: 0, limit: catLimit };
      }
      categoryTotals[catName].total += tx.amount;
    }

    // Find categories over budget
    for (const [category, data] of Object.entries(categoryTotals)) {
      if (data.limit && data.total > data.limit) {
        const overage = data.total - data.limit;
        recommendations.push(
          `Reduce ${category} spending by $${(overage / 100).toFixed(2)} to stay within budget`
        );
      }
    }

    return recommendations;
  }

  async getInsights(userId: number, options: { activeOnly?: boolean; limit?: number }) {
    const client = await this.getClient();

    let query = client
      .from("financial_insights")
      .select()
      .eq("user_id", userId)
      .order("priority", { ascending: false })
      .order("created_at", { ascending: false });

    if (options.activeOnly) {
      query = query.eq("is_dismissed", false);
      // Filter for non-expired insights
      query = query.or("expires_at.is.null,expires_at.gt." + new Date().toISOString());
    }

    if (options.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[SupabaseInsightsAdapter] getInsights error:", error);
      return [];
    }

    return (data || []).map(insight => ({
      id: insight.id,
      userId: insight.user_id,
      insightType: insight.insight_type,
      title: insight.title,
      description: insight.description,
      priority: insight.priority,
      isDismissed: insight.is_dismissed ? 1 : 0,
      expiresAt: insight.expires_at ? new Date(insight.expires_at) : null,
      createdAt: new Date(insight.created_at),
    }));
  }

  async dismissInsight(userId: number, insightId: number): Promise<{ success: boolean; message?: string }> {
    const client = await this.getClient();

    const { error } = await client
      .from("financial_insights")
      .update({ is_dismissed: true })
      .eq("id", insightId)
      .eq("user_id", userId);

    if (error) {
      console.error("[SupabaseInsightsAdapter] dismissInsight error:", error);
      return { success: false };
    }

    return { success: true, message: "Insight dismissed" };
  }
}
