import { and, desc, eq, count, gte, lte } from "drizzle-orm";
import {
  InsertBudgetCategory,
  InsertBudgetTransaction,
  InsertDebtBudgetSnapshot,
  InsertMonthlyBudgetSummary,
  budgetCategories,
  budgetTransactions,
  debtBudgetSnapshots,
  debtPayments,
  monthlyBudgetSummaries,
} from "../../drizzle/schema";
import { getDb } from "./connection";



// ==================== Budget Management Functions ====================

/**
 * Create a budget category
 */
export async function createBudgetCategory(category: InsertBudgetCategory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create budget category: database not available");
    return null;
  }

  const result = await db.insert(budgetCategories).values(category);
  return result;
}


/**
 * Get all budget categories for a user
 */
export async function getUserBudgetCategories(userId: number, type?: "income" | "expense") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget categories: database not available");
    return [];
  }

  let query = db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.userId, userId))
    .$dynamic();

  if (type) {
    query = query.where(eq(budgetCategories.type, type));
  }

  const result = await query.orderBy(budgetCategories.sortOrder, budgetCategories.name);
  return result;
}


/**
 * Update a budget category
 */
export async function updateBudgetCategory(categoryId: number, updates: Partial<InsertBudgetCategory>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update budget category: database not available");
    return null;
  }

  const result = await db
    .update(budgetCategories)
    .set(updates)
    .where(eq(budgetCategories.id, categoryId));
  
  return result;
}


/**
 * Delete a budget category
 */
export async function deleteBudgetCategory(categoryId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete budget category: database not available");
    return null;
  }

  const result = await db
    .delete(budgetCategories)
    .where(eq(budgetCategories.id, categoryId));
  
  return result;
}


/**
 * Create a budget transaction
 */
export async function createBudgetTransaction(transaction: InsertBudgetTransaction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create budget transaction: database not available");
    return null;
  }

  const result = await db.insert(budgetTransactions).values(transaction);
  return result;
}


/**
 * Get budget transactions for a user with optional filters
 */
export async function getUserBudgetTransactions(
  userId: number,
  options?: {
    categoryId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(budgetTransactions.userId, userId)];

  if (options?.categoryId) {
    conditions.push(eq(budgetTransactions.categoryId, options.categoryId));
  }

  if (options?.startDate) {
    conditions.push(gte(budgetTransactions.transactionDate, options.startDate));
  }

  if (options?.endDate) {
    conditions.push(lte(budgetTransactions.transactionDate, options.endDate));
  }

  let query = db
    .select()
    .from(budgetTransactions)
    .where(and(...conditions));

  if (options?.limit) {
    return await query.limit(options.limit);
  }

  return await query;
}

/**
 * Update a budget transaction
 */
export async function updateBudgetTransaction(transactionId: number, updates: Partial<InsertBudgetTransaction>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update budget transaction: database not available");
    return null;
  }

  const result = await db
    .update(budgetTransactions)
    .set(updates)
    .where(eq(budgetTransactions.id, transactionId));
  
  return result;
}


/**
 * Delete a budget transaction
 */
export async function deleteBudgetTransaction(transactionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete budget transaction: database not available");
    return null;
  }

  const result = await db
    .delete(budgetTransactions)
    .where(eq(budgetTransactions.id, transactionId));
  
  return result;
}


/**
 * Find duplicate transaction
 */
export async function findDuplicateTransaction(
  userId: number,
  date: string,
  amount: number,
  description: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot find duplicate transaction: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(budgetTransactions)
    .where(
      and(
        eq(budgetTransactions.userId, userId),
        eq(budgetTransactions.transactionDate, new Date(date)),
        eq(budgetTransactions.amount, amount),
        eq(budgetTransactions.description, description)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


/**
 * Get category spending breakdown for a month
 */
export async function getCategorySpendingBreakdown(userId: number, monthYear: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get category breakdown: database not available");
    return [];
  }

  const [year, month] = monthYear.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  const transactions = await getUserBudgetTransactions(userId, {
    startDate,
    endDate,
  });

  const categories = await getUserBudgetCategories(userId);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const breakdown = new Map<number, { category: typeof categories[0], total: number, count: number }>();

  for (const transaction of transactions) {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      const existing = breakdown.get(category.id) || { category, total: 0, count: 0 };
      existing.total += transaction.amount;
      existing.count += 1;
      breakdown.set(category.id, existing);
    }
  }

  return Array.from(breakdown.values()).sort((a, b) => b.total - a.total);
}


/**
 * Save monthly budget summary
 */
export async function saveMonthlyBudgetSummary(summary: InsertMonthlyBudgetSummary) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save budget summary: database not available");
    return null;
  }

  const result = await db.insert(monthlyBudgetSummaries).values(summary);
  return result;
}


/**
 * Get monthly budget summaries for a user
 */
export async function getUserMonthlyBudgetSummaries(userId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget summaries: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(monthlyBudgetSummaries)
    .where(eq(monthlyBudgetSummaries.userId, userId))
    .orderBy(desc(monthlyBudgetSummaries.monthYear))
    .limit(limit);
  
  return result;
}


/**
 * Calculate monthly budget summary for a user
 */
export async function calculateMonthlyBudgetSummary(userId: number, monthYear: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot calculate budget summary: database not available");
    return null;
  }

  // Get all transactions for the month
  const [year, month] = monthYear.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  const transactions = await getUserBudgetTransactions(userId, {
    startDate,
    endDate,
  });

  const categories = await getUserBudgetCategories(userId);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const transaction of transactions) {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      if (category.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    }
  }

  // Get debt payments for the month
  const debtPaymentsList = await db
    .select()
    .from(debtPayments)
    .where(
      and(
        eq(debtPayments.userId, userId),
        // Filter by month (simplified - would need better date filtering in production)
      )
    );

  const totalDebtPayments = debtPaymentsList.reduce((sum, p) => sum + p.amount, 0);

  const netCashFlow = totalIncome - totalExpenses - totalDebtPayments;
  const availableForExtraPayments = Math.max(0, netCashFlow);
  
  const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 10000) : 0;
  const debtPaymentRate = totalIncome > 0 ? Math.round((totalDebtPayments / totalIncome) * 10000) : 0;

  // Determine budget health
  let budgetHealth: "excellent" | "good" | "warning" | "critical" = "excellent";
  if (netCashFlow < 0) {
    budgetHealth = "critical";
  } else if (savingsRate < 1000) { // Less than 10% savings
    budgetHealth = "warning";
  } else if (savingsRate < 2000) { // Less than 20% savings
    budgetHealth = "good";
  }

  return {
    totalIncome,
    totalExpenses,
    totalDebtPayments,
    netCashFlow,
    savingsRate,
    debtPaymentRate,
    availableForExtraPayments,
    budgetHealth,
  };
}


/**
 * Save budget snapshot
 */
export async function saveBudgetSnapshot(snapshot: InsertDebtBudgetSnapshot) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save budget snapshot: database not available");
    return undefined;
  }

  const result = await db.insert(debtBudgetSnapshots).values(snapshot);
  return result;
}


/**
 * Get budget snapshots for a user
 */
export async function getBudgetSnapshots(userId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget snapshots: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtBudgetSnapshots)
    .where(eq(debtBudgetSnapshots.userId, userId))
    .orderBy(desc(debtBudgetSnapshots.monthYear))
    .limit(limit);
  
  return result;
}
