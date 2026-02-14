import * as db from '../db';
import { GoalsAdapter } from './GoalsAdapter';

/**
 * MySQL implementation of GoalsAdapter
 * Delegates all operations to db.ts functions
 */
export class MysqlGoalsAdapter implements GoalsAdapter {
  async createFinancialGoal(goal: any): Promise<number> {
    return db.createFinancialGoal(goal);
  }

  async getUserGoals(userId: number): Promise<any[]> {
    return db.getUserGoals(userId);
  }

  async getGoalById(goalId: number): Promise<any | undefined> {
    return db.getGoalById(goalId);
  }

  async updateFinancialGoal(goalId: number, updates: any): Promise<void> {
    await db.updateFinancialGoal(goalId, updates);
  }

  async deleteFinancialGoal(goalId: number): Promise<void> {
    await db.deleteFinancialGoal(goalId);
  }

  async recordGoalProgress(goalId: number, amount: number, note?: string, source?: "manual" | "auto_budget" | "auto_debt"): Promise<number | null> {
    return db.recordGoalProgress(goalId, amount, note, source);
  }

  async getGoalProgressHistory(goalId: number): Promise<any[]> {
    return db.getGoalProgressHistory(goalId);
  }

  async getGoalMilestones(goalId: number): Promise<any[]> {
    return db.getGoalMilestones(goalId);
  }

  async getUnshownCelebrations(userId: number): Promise<any[]> {
    return db.getUnshownCelebrations(userId);
  }

  async markMilestoneCelebrationShown(milestoneId: number): Promise<void> {
    await db.markMilestoneCelebrationShown(milestoneId);
  }
}
