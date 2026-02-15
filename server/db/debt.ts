import { and, desc, eq } from "drizzle-orm";
import {
  InsertCoachingSession,
  InsertDebt,
  InsertDebtMilestone,
  InsertDebtPayment,
  InsertDebtStrategy,
  coachingSessions,
  debtMilestones,
  debtPayments,
  debtStrategies,
  debts,
} from "../../drizzle/schema";
import { getDb } from "./connection";



// ============================================================================
// DEBT ELIMINATION FINANCIAL COACH FUNCTIONS
// ============================================================================

/**
 * Add a new debt for a user
 */
export async function addDebt(debt: InsertDebt) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add debt: database not available");
    return undefined;
  }

  const result = await db.insert(debts).values(debt);
  return result;
}


/**
 * Get all debts for a user
 */
export async function getUserDebts(userId: number, includeInactive: boolean = false) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user debts: database not available");
    return [];
  }

  const conditions = [eq(debts.userId, userId)];
  
  if (!includeInactive) {
    conditions.push(eq(debts.status, "active"));
  }

  const result = await db
    .select()
    .from(debts)
    .where(and(...conditions))
    .orderBy(debts.createdAt);
  
  return result;
}


/**
 * Get a specific debt by ID
 */
export async function getDebtById(debtId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get debt: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(debts)
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}


/**
 * Update a debt
 */
export async function updateDebt(debtId: number, userId: number, updates: Partial<InsertDebt>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update debt: database not available");
    return undefined;
  }

  const result = await db
    .update(debts)
    .set(updates)
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ));
  
  return result;
}


/**
 * Delete a debt (soft delete by marking as closed)
 */
export async function deleteDebt(debtId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete debt: database not available");
    return undefined;
  }

  const result = await db
    .update(debts)
    .set({ status: "closed" })
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ));
  
  return result;
}


/**
 * Record a payment toward a debt
 */
export async function recordDebtPayment(payment: InsertDebtPayment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record payment: database not available");
    return undefined;
  }

  // Insert payment record
  const result = await db.insert(debtPayments).values(payment);
  
  // Update debt's current balance
  await db
    .update(debts)
    .set({ currentBalance: payment.balanceAfter })
    .where(eq(debts.id, payment.debtId));
  
  // Check if debt is paid off
  if (payment.balanceAfter === 0) {
    await db
      .update(debts)
      .set({ 
        status: "paid_off",
        paidOffAt: new Date()
      })
      .where(eq(debts.id, payment.debtId));
  }
  
  return result;
}


/**
 * Get payment history for a debt
 */
export async function getDebtPaymentHistory(debtId: number, userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtPayments)
    .where(and(
      eq(debtPayments.debtId, debtId),
      eq(debtPayments.userId, userId)
    ))
    .orderBy(desc(debtPayments.paymentDate))
    .limit(limit);
  
  return result;
}


/**
 * Get all payments for a user (across all debts)
 */
export async function getAllUserPayments(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user payments: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtPayments)
    .where(eq(debtPayments.userId, userId))
    .orderBy(desc(debtPayments.paymentDate))
    .limit(limit);
  
  return result;
}


/**
 * Save a milestone achievement
 */
export async function saveDebtMilestone(milestone: InsertDebtMilestone) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save milestone: database not available");
    return undefined;
  }

  const result = await db.insert(debtMilestones).values(milestone);
  return result;
}


/**
 * Get user's debt milestones
 */
export async function getUserMilestones(userId: number, debtId?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get milestones: database not available");
    return [];
  }

  const conditions = [eq(debtMilestones.userId, userId)];
  
  if (debtId !== undefined) {
    conditions.push(eq(debtMilestones.debtId, debtId));
  }

  const result = await db
    .select()
    .from(debtMilestones)
    .where(and(...conditions))
    .orderBy(desc(debtMilestones.achievedAt));
  
  return result;
}


/**
 * Get debt summary statistics for a user
 */
export async function getDebtSummary(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get debt summary: database not available");
    return {
      totalDebts: 0,
      totalBalance: 0,
      totalOriginalBalance: 0,
      totalPaid: 0,
      averageInterestRate: 0,
      totalMonthlyMinimum: 0,
      debtsPaidOff: 0,
    };
  }

  const userDebts = await getUserDebts(userId, true);
  
  const totalDebts = userDebts.filter(d => d.status === "active").length;
  const totalBalance = userDebts
    .filter(d => d.status === "active")
    .reduce((sum, d) => sum + d.currentBalance, 0);
  const totalOriginalBalance = userDebts
    .reduce((sum, d) => sum + d.originalBalance, 0);
  const totalPaid = totalOriginalBalance - totalBalance;
  const averageInterestRate = userDebts.length > 0
    ? userDebts.reduce((sum, d) => sum + d.interestRate, 0) / userDebts.length
    : 0;
  const totalMonthlyMinimum = userDebts
    .filter(d => d.status === "active")
    .reduce((sum, d) => sum + d.minimumPayment, 0);
  const debtsPaidOff = userDebts.filter(d => d.status === "paid_off").length;

  return {
    totalDebts,
    totalBalance,
    totalOriginalBalance,
    totalPaid,
    averageInterestRate,
    totalMonthlyMinimum,
    debtsPaidOff,
  };
}


/**
 * Save a debt elimination strategy
 */
export async function saveDebtStrategy(strategy: InsertDebtStrategy) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save strategy: database not available");
    return undefined;
  }

  const result = await db.insert(debtStrategies).values(strategy);
  return result;
}


/**
 * Get latest strategy for a user
 */
export async function getLatestStrategy(userId: number, strategyType?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get strategy: database not available");
    return undefined;
  }

  const conditions = [eq(debtStrategies.userId, userId)];
  
  if (strategyType) {
    conditions.push(eq(debtStrategies.strategyType, strategyType as any));
  }

  const result = await db
    .select()
    .from(debtStrategies)
    .where(and(...conditions))
    .orderBy(desc(debtStrategies.calculatedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}


/**
 * Save a coaching session
 */
export async function saveCoachingSession(session: InsertCoachingSession) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save coaching session: database not available");
    return undefined;
  }

  const result = await db.insert(coachingSessions).values(session);
  return result;
}


/**
 * Get recent coaching sessions for a user
 */
export async function getRecentCoachingSessions(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get coaching sessions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(coachingSessions)
    .where(eq(coachingSessions.userId, userId))
    .orderBy(desc(coachingSessions.createdAt))
    .limit(limit);
  
  return result;
}
