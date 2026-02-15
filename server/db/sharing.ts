import { getDb } from "./connection";
import {
  sharedBudgets,
  sharedBudgetMembers,
  sharedBudgetCategories,
  sharedBudgetTransactions,
  splitExpenses,
  sharedBudgetActivity,
  users,
} from "../../drizzle/schema";
import { eq, and, or, desc, sql } from "drizzle-orm";

/**
 * Create a new shared budget
 */
export async function createSharedBudget(
  ownerId: number,
  name: string,
  description?: string
): Promise<{ success: boolean; budgetId?: number }> {
  const db = await getDb();
  if (!db) return { success: false };

  const result = await db.insert(sharedBudgets).values({
    name,
    description,
    ownerId,
    status: "active",
  });

  const budgetId = Number((result as any).insertId);

  // Add owner as a member
  await db.insert(sharedBudgetMembers).values({
    sharedBudgetId: budgetId,
    userId: ownerId,
    role: "owner",
    invitedBy: ownerId,
    joinedAt: new Date(),
    status: "active",
  });

  // Log activity
  await logActivity(budgetId, ownerId, "created_budget", {
    budgetName: name,
  });

  return { success: true, budgetId };
}

/**
 * Invite user to shared budget
 */
export async function inviteToSharedBudget(
  budgetId: number,
  inviterId: number,
  inviteeId: number,
  role: "editor" | "viewer"
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  // Check if inviter has permission
  const inviterMember = await db
    .select()
    .from(sharedBudgetMembers)
    .where(
      and(
        eq(sharedBudgetMembers.sharedBudgetId, budgetId),
        eq(sharedBudgetMembers.userId, inviterId),
        eq(sharedBudgetMembers.status, "active"),
        or(
          eq(sharedBudgetMembers.role, "owner"),
          eq(sharedBudgetMembers.role, "editor")
        )
      )
    )
    .limit(1);

  if (inviterMember.length === 0) {
    return { success: false, error: "No permission to invite" };
  }

  // Check if already invited/member
  const existing = await db
    .select()
    .from(sharedBudgetMembers)
    .where(
      and(
        eq(sharedBudgetMembers.sharedBudgetId, budgetId),
        eq(sharedBudgetMembers.userId, inviteeId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return { success: false, error: "User already invited or is a member" };
  }

  // Create invitation
  await db.insert(sharedBudgetMembers).values({
    sharedBudgetId: budgetId,
    userId: inviteeId,
    role,
    invitedBy: inviterId,
    status: "pending",
  });

  // Log activity
  await logActivity(budgetId, inviterId, "invited_member", {
    inviteeId,
    role,
  });

  return { success: true };
}

/**
 * Accept or decline invitation
 */
export async function respondToInvitation(
  invitationId: number,
  userId: number,
  accept: boolean
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  const invitation = await db
    .select()
    .from(sharedBudgetMembers)
    .where(
      and(
        eq(sharedBudgetMembers.id, invitationId),
        eq(sharedBudgetMembers.userId, userId),
        eq(sharedBudgetMembers.status, "pending")
      )
    )
    .limit(1);

  if (invitation.length === 0) {
    return { success: false, error: "Invitation not found" };
  }

  const newStatus = accept ? "active" : "declined";
  const joinedAt = accept ? new Date() : null;

  await db
    .update(sharedBudgetMembers)
    .set({ status: newStatus, joinedAt })
    .where(eq(sharedBudgetMembers.id, invitationId));

  // Log activity
  await logActivity(
    invitation[0].sharedBudgetId,
    userId,
    accept ? "accepted_invitation" : "declined_invitation",
    {}
  );

  return { success: true };
}

/**
 * Get shared budgets for user
 */
export async function getUserSharedBudgets(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const budgets = await db
    .select({
      budget: sharedBudgets,
      member: sharedBudgetMembers,
      owner: users,
    })
    .from(sharedBudgetMembers)
    .innerJoin(sharedBudgets, eq(sharedBudgetMembers.sharedBudgetId, sharedBudgets.id))
    .innerJoin(users, eq(sharedBudgets.ownerId, users.id))
    .where(
      and(
        eq(sharedBudgetMembers.userId, userId),
        eq(sharedBudgetMembers.status, "active")
      )
    )
    .orderBy(desc(sharedBudgets.updatedAt));

  return budgets;
}

/**
 * Get members of a shared budget
 */
export async function getSharedBudgetMembers(budgetId: number) {
  const db = await getDb();
  if (!db) return [];

  const members = await db
    .select({
      member: sharedBudgetMembers,
      user: users,
    })
    .from(sharedBudgetMembers)
    .innerJoin(users, eq(sharedBudgetMembers.userId, users.id))
    .where(eq(sharedBudgetMembers.sharedBudgetId, budgetId))
    .orderBy(sharedBudgetMembers.role, desc(sharedBudgetMembers.joinedAt));

  return members;
}

/**
 * Add transaction to shared budget
 */
export async function addSharedTransaction(
  budgetId: number,
  userId: number,
  data: {
    categoryId: number;
    amount: number;
    description: string;
    transactionDate: Date;
    receiptUrl?: string;
    notes?: string;
  }
): Promise<{ success: boolean; transactionId?: number; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  // Check permission
  const hasPermission = await checkPermission(budgetId, userId, "editor");
  if (!hasPermission) {
    return { success: false, error: "No permission to add transactions" };
  }

  const result = await db.insert(sharedBudgetTransactions).values({
    sharedBudgetId: budgetId,
    userId,
    ...data,
  });

  const transactionId = Number((result as any).insertId);

  // Log activity
  await logActivity(budgetId, userId, "added_transaction", {
    amount: data.amount,
    description: data.description,
  });

  return { success: true, transactionId };
}

/**
 * Create split expense
 */
export async function createSplitExpense(
  transactionId: number,
  splits: Array<{ userId: number; amount: number }>
): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) return { success: false };

  // Mark transaction as split
  await db
    .update(sharedBudgetTransactions)
    .set({ isSplit: 1 })
    .where(eq(sharedBudgetTransactions.id, transactionId));

  // Create split records
  for (const split of splits) {
    await db.insert(splitExpenses).values({
      transactionId,
      userId: split.userId,
      amount: split.amount,
      isPaid: 0,
    });
  }

  return { success: true };
}

/**
 * Mark split expense as paid
 */
export async function markSplitPaid(
  splitId: number,
  userId: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  const split = await db
    .select()
    .from(splitExpenses)
    .where(and(eq(splitExpenses.id, splitId), eq(splitExpenses.userId, userId)))
    .limit(1);

  if (split.length === 0) {
    return { success: false, error: "Split expense not found" };
  }

  await db
    .update(splitExpenses)
    .set({ isPaid: 1, paidAt: new Date() })
    .where(eq(splitExpenses.id, splitId));

  return { success: true };
}

/**
 * Get settlement summary (who owes whom)
 */
export async function getSettlementSummary(budgetId: number) {
  const db = await getDb();
  if (!db) return [];

  const splits = await db
    .select({
      split: splitExpenses,
      transaction: sharedBudgetTransactions,
      user: users,
    })
    .from(splitExpenses)
    .innerJoin(
      sharedBudgetTransactions,
      eq(splitExpenses.transactionId, sharedBudgetTransactions.id)
    )
    .innerJoin(users, eq(splitExpenses.userId, users.id))
    .where(
      and(
        eq(sharedBudgetTransactions.sharedBudgetId, budgetId),
        eq(splitExpenses.isPaid, 0)
      )
    )
    .orderBy(desc(sharedBudgetTransactions.transactionDate));

  return splits;
}

/**
 * Get activity log for shared budget
 */
export async function getSharedBudgetActivity(budgetId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];

  const activities = await db
    .select({
      activity: sharedBudgetActivity,
      user: users,
    })
    .from(sharedBudgetActivity)
    .innerJoin(users, eq(sharedBudgetActivity.userId, users.id))
    .where(eq(sharedBudgetActivity.sharedBudgetId, budgetId))
    .orderBy(desc(sharedBudgetActivity.createdAt))
    .limit(limit);

  return activities;
}

/**
 * Check if user has permission
 */
async function checkPermission(
  budgetId: number,
  userId: number,
  requiredRole: "owner" | "editor" | "viewer"
): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const member = await db
    .select()
    .from(sharedBudgetMembers)
    .where(
      and(
        eq(sharedBudgetMembers.sharedBudgetId, budgetId),
        eq(sharedBudgetMembers.userId, userId),
        eq(sharedBudgetMembers.status, "active")
      )
    )
    .limit(1);

  if (member.length === 0) return false;

  const role = member[0].role;

  // Permission hierarchy: owner > editor > viewer
  if (requiredRole === "viewer") return true;
  if (requiredRole === "editor") return role === "owner" || role === "editor";
  if (requiredRole === "owner") return role === "owner";

  return false;
}

/**
 * Log activity in shared budget
 */
async function logActivity(
  budgetId: number,
  userId: number,
  action: string,
  details: any
): Promise<void> {
  const db = await getDb();
  if (!db) return;

  await db.insert(sharedBudgetActivity).values({
    sharedBudgetId: budgetId,
    userId,
    action,
    details: JSON.stringify(details),
  });
}

/**
 * Remove member from shared budget
 */
export async function removeMember(
  budgetId: number,
  removerId: number,
  memberIdToRemove: number
): Promise<{ success: boolean; error?: string }> {
  const db = await getDb();
  if (!db) return { success: false, error: "Database unavailable" };

  // Check if remover is owner
  const isOwner = await checkPermission(budgetId, removerId, "owner");
  if (!isOwner && removerId !== memberIdToRemove) {
    return { success: false, error: "Only owner can remove members" };
  }

  await db
    .update(sharedBudgetMembers)
    .set({ status: "removed" })
    .where(
      and(
        eq(sharedBudgetMembers.sharedBudgetId, budgetId),
        eq(sharedBudgetMembers.userId, memberIdToRemove)
      )
    );

  // Log activity
  await logActivity(budgetId, removerId, "removed_member", {
    removedUserId: memberIdToRemove,
  });

  return { success: true };
}
