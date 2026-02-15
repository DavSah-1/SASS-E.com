import { and, desc, eq } from "drizzle-orm";
import {
  InsertFinancialGoal,
  financialGoals,
  goalMilestones,
  goalProgressHistory,
} from "../../drizzle/schema";
import { getDb } from "./connection";

// Helper function for milestone messages
function getMilestoneMessage(percentage: number, goalName: string): string {
  const messages: Record<number, string> = {
    25: `🎉 You're 25% of the way to "${goalName}"! Keep up the great work!`,
    50: `🌟 Halfway there! You've reached 50% of "${goalName}"!`,
    75: `🚀 Amazing! You're 75% complete on "${goalName}"! The finish line is in sight!`,
    100: `🎊 Congratulations! You've achieved "${goalName}"! 🎊`,
  };

  return messages[percentage] || `You've reached ${percentage}% of "${goalName}"!`;
}



// ============================================================================
// Financial Goals Functions
// ============================================================================

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(goal: InsertFinancialGoal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create goal: database not available");
    return null;
  }

  const result = await db.insert(financialGoals).values(goal);
  return Number(result[0].insertId);
}


/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: number, includeCompleted = false) {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Database] Cannot get goals: database not available");
        return [];
      }

      const conditions = includeCompleted
        ? [eq(financialGoals.userId, userId)]
        : [eq(financialGoals.userId, userId), eq(financialGoals.status, "active")];

      const result = await db
        .select()
        .from(financialGoals)
        .where(and(...conditions))
        .orderBy(desc(financialGoals.priority), desc(financialGoals.createdAt));

      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`[Database] getUserGoals attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries && (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
        const delay = Math.pow(2, attempt) * 100;
        console.log(`[Database] Retrying getUserGoals in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}


/**
 * Get a single goal by ID
 */
export async function getGoalById(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get goal: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.id, goalId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}


/**
 * Update a financial goal
 */
export async function updateFinancialGoal(goalId: number, updates: Partial<InsertFinancialGoal>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update goal: database not available");
    return false;
  }

  await db
    .update(financialGoals)
    .set(updates)
    .where(eq(financialGoals.id, goalId));

  return true;
}


/**
 * Delete a financial goal
 */
export async function deleteFinancialGoal(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete goal: database not available");
    return false;
  }

  // Delete associated milestones and progress history
  await db.delete(goalMilestones).where(eq(goalMilestones.goalId, goalId));
  await db.delete(goalProgressHistory).where(eq(goalProgressHistory.goalId, goalId));
  
  // Delete the goal
  await db.delete(financialGoals).where(eq(financialGoals.id, goalId));

  return true;
}


/**
 * Record progress update for a goal
 */
export async function recordGoalProgress(
  goalId: number,
  amount: number,
  note?: string,
  source: "manual" | "auto_budget" | "auto_debt" = "manual"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record progress: database not available");
    return null;
  }

  // Get current goal
  const goal = await getGoalById(goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  const newTotal = goal.currentAmount + amount;

  // Update goal current amount
  await updateFinancialGoal(goalId, { currentAmount: newTotal });

  // Record progress history
  await db.insert(goalProgressHistory).values({
    goalId,
    amount,
    newTotal,
    note,
    source,
    progressDate: new Date(),
  });

  // Check for milestone achievements
  const progressPercentage = Math.floor((newTotal / goal.targetAmount) * 100);
  const milestones = [25, 50, 75, 100];

  for (const milestone of milestones) {
    if (progressPercentage >= milestone) {
      // Check if milestone already exists
      const existing = await db
        .select()
        .from(goalMilestones)
        .where(
          and(
            eq(goalMilestones.goalId, goalId),
            eq(goalMilestones.milestonePercentage, milestone)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Create new milestone
        await db.insert(goalMilestones).values({
          goalId,
          milestonePercentage: milestone,
          achievedDate: new Date(),
          celebrationShown: 0,
          message: getMilestoneMessage(milestone, goal.name),
        });
      }
    }
  }

  // Mark goal as completed if target reached
  if (newTotal >= goal.targetAmount && goal.status !== "completed") {
    await updateFinancialGoal(goalId, {
      status: "completed",
      completedAt: new Date(),
    });
  }

  return newTotal;
}


/**
 * Get progress history for a goal
 */
export async function getGoalProgressHistory(goalId: number, limit = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(goalProgressHistory)
    .where(eq(goalProgressHistory.goalId, goalId))
    .orderBy(desc(goalProgressHistory.progressDate))
    .limit(limit);

  return result;
}


/**
 * Get milestones for a goal
 */
export async function getGoalMilestones(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get milestones: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId))
    .orderBy(goalMilestones.milestonePercentage);

  return result;
}


/**
 * Mark milestone celebration as shown
 */
export async function markMilestoneCelebrationShown(milestoneId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark celebration: database not available");
    return false;
  }

  await db
    .update(goalMilestones)
    .set({ celebrationShown: 1 })
    .where(eq(goalMilestones.id, milestoneId));

  return true;
}


/**
 * Get unshown milestone celebrations for a user
 */
export async function getUnshownCelebrations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get celebrations: database not available");
    return [];
  }

  const result = await db
    .select({
      milestone: goalMilestones,
      goal: financialGoals,
    })
    .from(goalMilestones)
    .innerJoin(financialGoals, eq(goalMilestones.goalId, financialGoals.id))
    .where(
      and(
        eq(financialGoals.userId, userId),
        eq(goalMilestones.celebrationShown, 0)
      )
    )
    .orderBy(desc(goalMilestones.achievedDate));

  return result;
}
