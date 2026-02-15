import { getDb } from "./connection";
import { budgetAlerts, budgetCategories, budgetTransactions, notificationPreferences } from "../../drizzle/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { notifyOwner } from "../_core/notification";

/**
 * Check if user should receive a specific type of alert based on preferences
 */
export async function shouldSendAlert(userId: number, alertType: string): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);

  if (prefs.length === 0) {
    // Default to enabled if no preferences set
    return true;
  }

  const pref = prefs[0];

  switch (alertType) {
    case "threshold_80":
      return pref.threshold80Enabled === 1;
    case "threshold_100":
      return pref.threshold100Enabled === 1;
    case "exceeded":
      return pref.exceededEnabled === 1;
    case "weekly_summary":
      return pref.weeklySummaryEnabled === 1;
    case "monthly_report":
      return pref.monthlySummaryEnabled === 1;
    default:
      return pref.budgetAlertsEnabled === 1;
  }
}

/**
 * Create a budget alert
 */
export async function createBudgetAlert(
  userId: number,
  alertType: "threshold_80" | "threshold_100" | "exceeded" | "weekly_summary" | "monthly_report",
  message: string,
  categoryId?: number,
  threshold?: number
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Check if user wants this type of alert
  const shouldSend = await shouldSendAlert(userId, alertType);
  if (!shouldSend) return;

  // Check if similar alert already exists (avoid duplicates)
  const existingAlerts = await db
    .select()
    .from(budgetAlerts)
    .where(
      and(
        eq(budgetAlerts.userId, userId),
        eq(budgetAlerts.alertType, alertType),
        categoryId ? eq(budgetAlerts.categoryId, categoryId) : sql`${budgetAlerts.categoryId} IS NULL`,
        eq(budgetAlerts.isRead, 0)
      )
    );

  if (existingAlerts.length > 0) {
    // Alert already exists, don't create duplicate
    return;
  }

  // Create the alert
  await db.insert(budgetAlerts).values({
    userId,
    categoryId: categoryId || null,
    alertType,
    threshold: threshold || null,
    message,
    isRead: 0,
  });

  // Send push notification to owner if it's a critical alert
  if (alertType === "exceeded" || alertType === "threshold_100") {
    try {
      await notifyOwner({
        title: "Budget Alert",
        content: message,
      });
    } catch (error) {
      console.error("[createBudgetAlert] Failed to send notification:", error);
    }
  }
}

/**
 * Check category spending and generate alerts if thresholds are exceeded
 */
export async function checkCategoryAlerts(userId: number, categoryId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get category details
  const category = await db
    .select()
    .from(budgetCategories)
    .where(and(
      eq(budgetCategories.id, categoryId),
      eq(budgetCategories.userId, userId)
    ))
    .limit(1);

  if (category.length === 0 || !category[0].monthlyLimit) {
    return; // No limit set, no alerts needed
  }

  const cat = category[0];
  const limit = cat.monthlyLimit!; // Already checked above

  // Get current month spending for this category
  const currentMonth = new Date().toISOString().slice(0, 7); // "YYYY-MM"
  const startDate = new Date(currentMonth + "-01");
  const endDate = new Date(currentMonth + "-01");
  endDate.setMonth(endDate.getMonth() + 1);

  const transactions = await db
    .select()
    .from(budgetTransactions)
    .where(and(
      eq(budgetTransactions.userId, userId),
      eq(budgetTransactions.categoryId, categoryId),
      gte(budgetTransactions.transactionDate, startDate),
      sql`${budgetTransactions.transactionDate} < ${endDate}`
    ));

  const totalSpent = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const percentageUsed = (totalSpent / limit) * 100;

  // Check thresholds and create alerts
  if (percentageUsed >= 100 && totalSpent > limit) {
    await createBudgetAlert(
      userId,
      "exceeded",
      `🚨 You've exceeded your ${cat.icon} ${cat.name} budget! Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
      categoryId
    );
  } else if (percentageUsed >= 100) {
    await createBudgetAlert(
      userId,
      "threshold_100",
      `⚠️ You've reached 100% of your ${cat.icon} ${cat.name} budget. Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
      categoryId,
      100
    );
  } else if (percentageUsed >= 80) {
    await createBudgetAlert(
      userId,
      "threshold_80",
      `⚡ You've used ${Math.round(percentageUsed)}% of your ${cat.icon} ${cat.name} budget. Spent $${(totalSpent / 100).toFixed(2)} of $${(limit / 100).toFixed(2)} limit.`,
      categoryId,
      80
    );
  }
}

/**
 * Check all categories for a user and generate alerts
 */
export async function checkAllCategoryAlerts(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  const categories = await db
    .select()
    .from(budgetCategories)
    .where(and(
      eq(budgetCategories.userId, userId),
      sql`${budgetCategories.monthlyLimit} IS NOT NULL`
    ));

  for (const category of categories) {
    await checkCategoryAlerts(userId, category.id);
  }
}

/**
 * Generate weekly spending summary alert
 */
export async function generateWeeklySummary(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get transactions from the past 7 days
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);

  const transactions = await db
    .select({
      amount: budgetTransactions.amount,
      categoryType: budgetCategories.type,
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(budgetTransactions.userId, userId),
      gte(budgetTransactions.transactionDate, weekAgo)
    ));

  const totalIncome = transactions
    .filter(tx => tx.categoryType === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.categoryType === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;

  const message = `📊 Weekly Summary: Income $${(totalIncome / 100).toFixed(2)}, Expenses $${(totalExpenses / 100).toFixed(2)}, Net ${netCashFlow >= 0 ? '+' : ''}$${(netCashFlow / 100).toFixed(2)}`;

  await createBudgetAlert(userId, "weekly_summary", message);
}

/**
 * Generate monthly budget report alert
 */
export async function generateMonthlyReport(userId: number): Promise<void> {
  const db = await getDb();
  if (!db) return;

  // Get current month transactions
  const currentMonth = new Date().toISOString().slice(0, 7);
  const startDate = new Date(currentMonth + "-01");
  const endDate = new Date(currentMonth + "-01");
  endDate.setMonth(endDate.getMonth() + 1);

  const transactions = await db
    .select({
      amount: budgetTransactions.amount,
      categoryType: budgetCategories.type,
    })
    .from(budgetTransactions)
    .innerJoin(budgetCategories, eq(budgetTransactions.categoryId, budgetCategories.id))
    .where(and(
      eq(budgetTransactions.userId, userId),
      gte(budgetTransactions.transactionDate, startDate),
      sql`${budgetTransactions.transactionDate} < ${endDate}`
    ));

  const totalIncome = transactions
    .filter(tx => tx.categoryType === "income")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalExpenses = transactions
    .filter(tx => tx.categoryType === "expense")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netCashFlow = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? ((netCashFlow / totalIncome) * 100).toFixed(1) : "0.0";

  const message = `📈 Monthly Report for ${currentMonth}: Income $${(totalIncome / 100).toFixed(2)}, Expenses $${(totalExpenses / 100).toFixed(2)}, Savings Rate ${savingsRate}%`;

  await createBudgetAlert(userId, "monthly_report", message);
}
