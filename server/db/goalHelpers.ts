import { getDb } from "./connection";
import {
  financialGoals,
  goalMilestones,
  goalProgressHistory,
  budgetTransactions,
  budgetCategories,
} from "../../drizzle/schema";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { invokeLLM } from "../_core/llm";

/**
 * Update goal progress and check for milestone achievements
 */
export async function updateGoalProgress(
  goalId: number,
  newAmount: number,
  userId: number
): Promise<{ success: boolean; milestonesAchieved: number[] }> {
  const db = await getDb();
  if (!db) return { success: false, milestonesAchieved: [] };

  // Get the goal
  const goals = await db
    .select()
    .from(financialGoals)
    .where(and(eq(financialGoals.id, goalId), eq(financialGoals.userId, userId)))
    .limit(1);

  if (goals.length === 0) {
    return { success: false, milestonesAchieved: [] };
  }

  const goal = goals[0];
  const oldAmount = goal.currentAmount;
  const oldPercentage = (oldAmount / goal.targetAmount) * 100;
  const newPercentage = (newAmount / goal.targetAmount) * 100;

  // Update goal amount
  await db
    .update(financialGoals)
    .set({
      currentAmount: newAmount,
      status: newAmount >= goal.targetAmount ? "completed" : goal.status,
      completedAt: newAmount >= goal.targetAmount ? new Date() : goal.completedAt,
    })
    .where(eq(financialGoals.id, goalId));

  // Record progress history
  await db.insert(goalProgressHistory).values({
    goalId,
    amount: newAmount - oldAmount,
    newTotal: newAmount,
    note: `Progress updated to $${(newAmount / 100).toFixed(2)}`,
    source: "manual",
  });

  // Check for milestone achievements
  const milestonePercentages = [25, 50, 75, 100];
  const milestonesAchieved: number[] = [];

  for (const percentage of milestonePercentages) {
    if (oldPercentage < percentage && newPercentage >= percentage) {
      // Check if milestone already exists
      const existing = await db
        .select()
        .from(goalMilestones)
        .where(
          and(
            eq(goalMilestones.goalId, goalId),
            eq(goalMilestones.milestonePercentage, percentage)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Create new milestone
        const message = getMilestoneMessage(percentage, goal.name);
        await db.insert(goalMilestones).values({
          goalId,
          milestonePercentage: percentage,
          achievedDate: new Date(),
          celebrationShown: 0,
          message,
        });

        milestonesAchieved.push(percentage);
      }
    }
  }

  return { success: true, milestonesAchieved };
}

/**
 * Get celebration message for milestone
 */
function getMilestoneMessage(percentage: number, goalName: string): string {
  const messages: Record<number, string> = {
    25: `🎉 Quarter of the way there! You've hit 25% of your "${goalName}" goal. Keep that momentum going!`,
    50: `🚀 Halfway milestone! You're 50% closer to "${goalName}". The finish line is in sight!`,
    75: `⭐ Three-quarters complete! You've conquered 75% of "${goalName}". Almost there!`,
    100: `🏆 Goal achieved! You've completed "${goalName}"! Time to celebrate and set your next target!`,
  };

  return messages[percentage] || `Milestone ${percentage}% achieved!`;
}

/**
 * Calculate goal progress statistics
 */
export async function calculateGoalStats(goalId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;

  const goals = await db
    .select()
    .from(financialGoals)
    .where(and(eq(financialGoals.id, goalId), eq(financialGoals.userId, userId)))
    .limit(1);

  if (goals.length === 0) return null;

  const goal = goals[0];

  // Get progress history
  const history = await db
    .select()
    .from(goalProgressHistory)
    .where(eq(goalProgressHistory.goalId, goalId))
    .orderBy(desc(goalProgressHistory.progressDate))
    .limit(30);

  // Calculate statistics
  const percentageComplete = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
  const remaining = Math.max(0, goal.targetAmount - goal.currentAmount);

  // Calculate average monthly progress (if we have history)
  let avgMonthlyProgress = 0;
  let estimatedCompletionDate: Date | null = null;

  if (history.length >= 2) {
    const oldestRecord = history[history.length - 1];
    const newestRecord = history[0];

    const daysDiff =
      (new Date(newestRecord.progressDate).getTime() -
        new Date(oldestRecord.progressDate).getTime()) /
      (1000 * 60 * 60 * 24);

    if (daysDiff > 0) {
      const amountDiff = newestRecord.newTotal - oldestRecord.newTotal;
      avgMonthlyProgress = (amountDiff / daysDiff) * 30; // Convert to monthly

      // Estimate completion date
      if (avgMonthlyProgress > 0 && remaining > 0) {
        const monthsRemaining = remaining / avgMonthlyProgress;
        estimatedCompletionDate = new Date();
        estimatedCompletionDate.setMonth(
          estimatedCompletionDate.getMonth() + Math.ceil(monthsRemaining)
        );
      }
    }
  }

  // Get milestones
  const milestones = await db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId))
    .orderBy(goalMilestones.milestonePercentage);

  return {
    goal,
    percentageComplete: Math.round(percentageComplete * 10) / 10,
    remaining,
    avgMonthlyProgress: Math.round(avgMonthlyProgress),
    estimatedCompletionDate,
    milestones,
    history: history.reverse(), // Oldest first for chart display
  };
}

/**
 * Generate AI-powered goal insights and predictions
 */
export async function generateGoalInsights(goalId: number, userId: number): Promise<{
  success: boolean;
  prediction?: string;
  motivationalMessage?: string;
  recommendations?: string[];
}> {
  const stats = await calculateGoalStats(goalId, userId);

  if (!stats) {
    return { success: false };
  }

  const { goal, percentageComplete, remaining, avgMonthlyProgress, estimatedCompletionDate } =
    stats;

  // Prepare data for LLM
  const prompt = `Analyze this financial goal and provide insights with SASS-E's sarcastic personality:

Goal: ${goal.name}
Type: ${goal.type}
Target: $${(goal.targetAmount / 100).toFixed(2)}
Current: $${(goal.currentAmount / 100).toFixed(2)}
Progress: ${percentageComplete.toFixed(1)}%
Remaining: $${(remaining / 100).toFixed(2)}
Average Monthly Progress: $${(avgMonthlyProgress / 100).toFixed(2)}
Target Date: ${goal.targetDate ? new Date(goal.targetDate).toLocaleDateString() : "Not set"}
Estimated Completion: ${estimatedCompletionDate ? estimatedCompletionDate.toLocaleDateString() : "Unknown"}

Provide insights in JSON format:
{
  "prediction": "Brief prediction about goal achievement (1-2 sentences)",
  "motivationalMessage": "Sarcastic but encouraging message (2-3 sentences)",
  "recommendations": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content:
            "You are SASS-E, a sarcastic financial advisor. Provide witty but helpful goal insights.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const content = response.choices?.[0]?.message?.content;
    if (!content || typeof content !== "string") {
      throw new Error("No content in LLM response");
    }

    const result = JSON.parse(content);

    return {
      success: true,
      prediction: result.prediction,
      motivationalMessage: result.motivationalMessage,
      recommendations: result.recommendations,
    };
  } catch (error) {
    console.error("[generateGoalInsights] Error:", error);
    return { success: false };
  }
}

/**
 * Auto-update goals linked to budget categories
 */
export async function autoUpdateLinkedGoals(userId: number): Promise<{ success: boolean; updated: number }> {
  const db = await getDb();
  if (!db) return { success: false, updated: 0 };

  // Get all auto-tracked goals
  const goals = await db
    .select()
    .from(financialGoals)
    .where(
      and(
        eq(financialGoals.userId, userId),
        eq(financialGoals.isAutoTracked, 1),
        eq(financialGoals.status, "active")
      )
    );

  let updated = 0;

  for (const goal of goals) {
    if (!goal.linkedCategoryId) continue;

    // Calculate total saved in linked category
    const transactions = await db
      .select({ amount: budgetTransactions.amount })
      .from(budgetTransactions)
      .where(
        and(
          eq(budgetTransactions.userId, userId),
          eq(budgetTransactions.categoryId, goal.linkedCategoryId)
        )
      );

    const totalSaved = transactions.reduce((sum, tx) => sum + tx.amount, 0);

    if (totalSaved !== goal.currentAmount) {
      await updateGoalProgress(goal.id, totalSaved, userId);
      updated++;
    }
  }

  return { success: true, updated };
}

/**
 * Get uncelebrated milestones for user
 */
export async function getUncelebratedMilestones(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const milestones = await db
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
    .orderBy(desc(goalMilestones.achievedDate))
    .limit(5);

  return milestones;
}

/**
 * Mark milestone as celebrated
 */
export async function markMilestoneCelebrated(milestoneId: number): Promise<{ success: boolean }> {
  const db = await getDb();
  if (!db) return { success: false };

  await db
    .update(goalMilestones)
    .set({ celebrationShown: 1 })
    .where(eq(goalMilestones.id, milestoneId));

  return { success: true };
}

/**
 * Get all goals for user with progress
 */
export async function getUserGoalsWithProgress(userId: number) {
  const db = await getDb();
  if (!db) return [];

  const goals = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.userId, userId))
    .orderBy(desc(financialGoals.priority), desc(financialGoals.createdAt));

  const goalsWithProgress = await Promise.all(
    goals.map(async (goal) => {
      const percentageComplete = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);

      // Get latest milestone
      const latestMilestone = await db
        .select()
        .from(goalMilestones)
        .where(eq(goalMilestones.goalId, goal.id))
        .orderBy(desc(goalMilestones.milestonePercentage))
        .limit(1);

      return {
        ...goal,
        percentageComplete: Math.round(percentageComplete * 10) / 10,
        remaining: Math.max(0, goal.targetAmount - goal.currentAmount),
        latestMilestone: latestMilestone[0] || null,
      };
    })
  );

  return goalsWithProgress;
}
