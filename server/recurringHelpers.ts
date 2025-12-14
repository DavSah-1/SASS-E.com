import { getDb } from "./db";
import { budgetTransactions, budgetCategories, recurringTransactions } from "../drizzle/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";

/**
 * Detect recurring transaction patterns for a user
 */
export async function detectRecurringPatterns(userId: number): Promise<{ success: boolean; patternsFound: number }> {
  const db = await getDb();
  if (!db) return { success: false, patternsFound: 0 };

  // Get last 6 months of transactions
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const transactions = await db
    .select({
      id: budgetTransactions.id,
      amount: budgetTransactions.amount,
      date: budgetTransactions.transactionDate,
      description: budgetTransactions.description,
      categoryId: budgetTransactions.categoryId,
      categoryName: budgetCategories.name,
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(budgetTransactions.userId, userId),
      gte(budgetTransactions.transactionDate, sixMonthsAgo)
    ))
    .orderBy(desc(budgetTransactions.transactionDate));

  if (transactions.length < 3) {
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
      patterns.set(key, { amounts: [], dates: [], categoryId: tx.categoryId });
    }

    const pattern = patterns.get(key)!;
    pattern.amounts.push(tx.amount);
    pattern.dates.push(new Date(tx.date));
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
      const existing = await db
        .select()
        .from(recurringTransactions)
        .where(and(
          eq(recurringTransactions.userId, userId),
          eq(recurringTransactions.description, description),
          eq(recurringTransactions.isActive, 1)
        ))
        .limit(1);

      // Determine if it's a subscription (common subscription keywords)
      const subscriptionKeywords = ["netflix", "spotify", "hulu", "prime", "subscription", "membership", "monthly fee", "annual fee"];
      const isSubscription = subscriptionKeywords.some(keyword => description.toLowerCase().includes(keyword));

      if (existing.length === 0) {
        // Create new recurring pattern
        await db.insert(recurringTransactions).values({
          userId,
          categoryId: data.categoryId,
          description,
          averageAmount: Math.round(avgAmount),
          frequency,
          nextExpectedDate,
          lastOccurrence: lastDate,
          confidence,
          isActive: 1,
          isSubscription: isSubscription ? 1 : 0,
          reminderEnabled: 1,
          autoAdd: 0,
        });

        patternsFound++;
      } else {
        // Update existing pattern
        await db
          .update(recurringTransactions)
          .set({
            averageAmount: Math.round(avgAmount),
            frequency,
            nextExpectedDate,
            lastOccurrence: lastDate,
            confidence,
            isSubscription: isSubscription ? 1 : 0,
            updatedAt: new Date(),
          })
          .where(eq(recurringTransactions.id, existing[0].id));
      }
    }
  }

  return { success: true, patternsFound };
}

/**
 * Get recurring transactions for a user
 */
export async function getUserRecurringTransactions(userId: number, activeOnly: boolean = true) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(recurringTransactions.userId, userId)];
  if (activeOnly) {
    conditions.push(eq(recurringTransactions.isActive, 1));
  }

  const recurring = await db
    .select({
      id: recurringTransactions.id,
      description: recurringTransactions.description,
      averageAmount: recurringTransactions.averageAmount,
      frequency: recurringTransactions.frequency,
      nextExpectedDate: recurringTransactions.nextExpectedDate,
      lastOccurrence: recurringTransactions.lastOccurrence,
      confidence: recurringTransactions.confidence,
      isActive: recurringTransactions.isActive,
      isSubscription: recurringTransactions.isSubscription,
      reminderEnabled: recurringTransactions.reminderEnabled,
      autoAdd: recurringTransactions.autoAdd,
      notes: recurringTransactions.notes,
      categoryId: recurringTransactions.categoryId,
      categoryName: budgetCategories.name,
      categoryIcon: budgetCategories.icon,
    })
    .from(recurringTransactions)
    .innerJoin(budgetCategories, eq(recurringTransactions.categoryId, budgetCategories.id))
    .where(and(...conditions))
    .orderBy(desc(recurringTransactions.nextExpectedDate));

  return recurring;
}

/**
 * Calculate projected monthly expenses from recurring transactions
 */
export async function calculateRecurringProjections(userId: number): Promise<{
  monthlyTotal: number;
  quarterlyTotal: number;
  yearlyTotal: number;
  byCategory: Record<string, number>;
}> {
  const db = await getDb();
  if (!db) {
    return { monthlyTotal: 0, quarterlyTotal: 0, yearlyTotal: 0, byCategory: {} };
  }

  const recurring = await getUserRecurringTransactions(userId, true);

  let monthlyTotal = 0;
  let quarterlyTotal = 0;
  let yearlyTotal = 0;
  const byCategory: Record<string, number> = {};

  for (const rec of recurring) {
    const amount = rec.averageAmount;
    const category = rec.categoryName;

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

/**
 * Update recurring transaction settings
 */
export async function updateRecurringTransaction(
  userId: number,
  recurringId: number,
  updates: {
    reminderEnabled?: boolean;
    autoAdd?: boolean;
    isActive?: boolean;
    notes?: string;
  }
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) return { success: false };

  const updateData: any = {};
  if (updates.reminderEnabled !== undefined) {
    updateData.reminderEnabled = updates.reminderEnabled ? 1 : 0;
  }
  if (updates.autoAdd !== undefined) {
    updateData.autoAdd = updates.autoAdd ? 1 : 0;
  }
  if (updates.isActive !== undefined) {
    updateData.isActive = updates.isActive ? 1 : 0;
  }
  if (updates.notes !== undefined) {
    updateData.notes = updates.notes;
  }

  await db
    .update(recurringTransactions)
    .set(updateData)
    .where(and(
      eq(recurringTransactions.id, recurringId),
      eq(recurringTransactions.userId, userId)
    ));

  return { success: true };
}

/**
 * Get upcoming recurring transactions (next 30 days)
 */
export async function getUpcomingRecurring(userId: number): Promise<Array<{
  id: number;
  description: string;
  amount: number;
  dueDate: Date;
  daysUntilDue: number;
  category: string;
}>> {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  const thirtyDaysFromNow = new Date();
  thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

  const recurring = await db
    .select({
      id: recurringTransactions.id,
      description: recurringTransactions.description,
      averageAmount: recurringTransactions.averageAmount,
      nextExpectedDate: recurringTransactions.nextExpectedDate,
      categoryName: budgetCategories.name,
    })
    .from(recurringTransactions)
    .innerJoin(budgetCategories, eq(recurringTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(recurringTransactions.userId, userId),
      eq(recurringTransactions.isActive, 1),
      sql`${recurringTransactions.nextExpectedDate} BETWEEN ${now} AND ${thirtyDaysFromNow}`
    ))
    .orderBy(recurringTransactions.nextExpectedDate);

  return recurring.map(rec => {
    const dueDate = new Date(rec.nextExpectedDate!);
    const daysUntilDue = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      id: rec.id,
      description: rec.description,
      amount: rec.averageAmount,
      dueDate,
      daysUntilDue,
      category: rec.categoryName,
    };
  });
}
