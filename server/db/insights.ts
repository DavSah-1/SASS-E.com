import { getDb } from "./connection";
import { budgetTransactions, budgetCategories, financialInsights, budgetTemplates, userBudgetTemplates } from "../../drizzle/schema";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * Analyze spending patterns and generate AI-powered insights
 */
export async function generateSpendingInsights(userId: number): Promise<{ success: boolean; insightsCount: number }> {
  const db = await getDb();
  if (!db) return { success: false, insightsCount: 0 };

  // Get last 3 months of transactions
  const threeMonthsAgo = new Date();
  threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

  const transactions = await db
    .select({
      amount: budgetTransactions.amount,
      date: budgetTransactions.transactionDate,
      description: budgetTransactions.description,
      categoryId: budgetTransactions.categoryId,
      categoryName: budgetCategories.name,
      categoryType: budgetCategories.type,
      categoryLimit: budgetCategories.monthlyLimit,
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(budgetTransactions.userId, userId),
      gte(budgetTransactions.transactionDate, threeMonthsAgo)
    ))
    .orderBy(desc(budgetTransactions.transactionDate));

  if (transactions.length === 0) {
    return { success: false, insightsCount: 0 };
  }

  // Calculate spending by category
  const categorySpending: Record<string, { total: number; count: number; limit: number | null }> = {};
  
  for (const tx of transactions) {
    if (tx.categoryType === "expense") {
      if (!categorySpending[tx.categoryName]) {
        categorySpending[tx.categoryName] = { total: 0, count: 0, limit: tx.categoryLimit };
      }
      categorySpending[tx.categoryName].total += tx.amount;
      categorySpending[tx.categoryName].count += 1;
    }
  }

  // Calculate total income and expenses
  const totalIncome = transactions
    .filter(tx => tx.categoryType === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.categoryType === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

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

  // Detect recurring patterns (subscriptions)
  const recurringPatterns = detectRecurringTransactions(transactions);

  // Get active template if any
  const activeTemplate = await db
    .select({
      templateName: budgetTemplates.name,
      strategy: budgetTemplates.strategy,
    })
    .from(userBudgetTemplates)
    .innerJoin(budgetTemplates, eq(userBudgetTemplates.templateId, budgetTemplates.id))
    .where(and(
      eq(userBudgetTemplates.userId, userId),
      eq(userBudgetTemplates.isActive, 1)
    ))
    .limit(1);

  // Build prompt for LLM
  const prompt = `You are SASS-E, a sarcastic but helpful financial advisor AI. Analyze the following spending data and generate 3-5 actionable insights with your signature wit.

**User's Financial Data (Last 3 Months):**
- Total Income: $${(totalIncome / 100).toFixed(2)}
- Total Expenses: $${(totalExpenses / 100).toFixed(2)}
- Savings Rate: ${savingsRate.toFixed(1)}%
${activeTemplate.length > 0 ? `- Active Budget Template: ${activeTemplate[0].templateName}` : ''}

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
        const category = await db
          .select()
          .from(budgetCategories)
          .where(and(
            eq(budgetCategories.userId, userId),
            eq(budgetCategories.name, insight.relatedCategory)
          ))
          .limit(1);
        
        if (category.length > 0) {
          relatedCategoryId = category[0].id;
        }
      }

      await db.insert(financialInsights).values({
        userId,
        insightType: insight.type,
        title: insight.title,
        description: insight.description,
        actionable: insight.actionable ? 1 : 0,
        actionText: insight.actionText || null,
        priority: insight.priority,
        relatedCategoryId,
        dataPoints: JSON.stringify({
          potentialSavings: insight.potentialSavings || null,
          generatedAt: new Date().toISOString(),
        }),
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
      });

      insightsCount++;
    }

    return { success: true, insightsCount };
  } catch (error) {
    console.error("[generateSpendingInsights] Error:", error);
    return { success: false, insightsCount: 0 };
  }
}

/**
 * Detect recurring transaction patterns
 */
function detectRecurringTransactions(transactions: any[]): Array<{
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
    pattern.dates.push(new Date(tx.date));
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

    // Calculate amount variance (to detect consistent amounts)
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

/**
 * Generate cost-cutting recommendations based on spending analysis
 */
export async function generateCostCuttingRecommendations(userId: number): Promise<string[]> {
  const db = await getDb();
  if (!db) return [];

  const recommendations: string[] = [];

  // Get category spending for current month
  const currentMonth = new Date().toISOString().slice(0, 7);
  const startDate = new Date(currentMonth + "-01");
  const endDate = new Date(currentMonth + "-01");
  endDate.setMonth(endDate.getMonth() + 1);

  const transactions = await db
    .select({
      amount: budgetTransactions.amount,
      categoryName: budgetCategories.name,
      categoryLimit: budgetCategories.monthlyLimit,
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(budgetTransactions.userId, userId),
      gte(budgetTransactions.transactionDate, startDate),
      sql`${budgetTransactions.transactionDate} < ${endDate}`
    ));

  const categoryTotals: Record<string, { total: number; limit: number | null }> = {};

  for (const tx of transactions) {
    if (!categoryTotals[tx.categoryName]) {
      categoryTotals[tx.categoryName] = { total: 0, limit: tx.categoryLimit };
    }
    categoryTotals[tx.categoryName].total += tx.amount;
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
