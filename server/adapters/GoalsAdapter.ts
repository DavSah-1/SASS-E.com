/**
 * GoalsAdapter Interface
 * 
 * Defines all financial goals-related database operations.
 * Implementations handle routing to MySQL (admin) or Supabase (user) databases.
 */

export interface GoalsAdapter {
  /**
   * Goal CRUD Operations
   */
  createFinancialGoal(goal: any): Promise<number>;
  getUserGoals(userId: number): Promise<any[]>;
  getGoalById(goalId: number): Promise<any | undefined>;
  updateFinancialGoal(goalId: number, updates: any): Promise<void>;
  deleteFinancialGoal(goalId: number): Promise<void>;

  /**
   * Goal Progress Tracking
   */
  recordGoalProgress(goalId: number, amount: number, note?: string, source?: "manual" | "auto_budget" | "auto_debt"): Promise<number | null>;
  getGoalProgressHistory(goalId: number): Promise<any[]>;

  /**
   * Goal Milestones
   */
  getGoalMilestones(goalId: number): Promise<any[]>;
  getUnshownCelebrations(userId: number): Promise<any[]>;
  markMilestoneCelebrationShown(milestoneId: number): Promise<void>;
}
