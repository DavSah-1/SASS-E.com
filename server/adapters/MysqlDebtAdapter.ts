/**
 * MysqlDebtAdapter
 * 
 * MySQL implementation of DebtAdapter - delegates to db.ts functions
 */

import * as db from '../db';
import type { DebtAdapter } from './DebtAdapter';

export class MysqlDebtAdapter implements DebtAdapter {
  async addDebt(debt: any): Promise<void> {
    await db.addDebt(debt);
  }

  async getUserDebts(userId: number, includeInactive: boolean = false): Promise<any[]> {
    return db.getUserDebts(userId, includeInactive);
  }

  async getDebtById(debtId: number, userId: number): Promise<any | undefined> {
    return db.getDebtById(debtId, userId);
  }

  async updateDebt(debtId: number, userId: number, updates: any): Promise<void> {
    await db.updateDebt(debtId, userId, updates);
  }

  async deleteDebt(debtId: number, userId: number): Promise<void> {
    await db.deleteDebt(debtId, userId);
  }

  async recordDebtPayment(payment: any): Promise<void> {
    await db.recordDebtPayment(payment);
  }

  async getDebtPaymentHistory(debtId: number, userId: number, limit: number = 50): Promise<any[]> {
    return db.getDebtPaymentHistory(debtId, userId, limit);
  }

  async saveDebtStrategy(strategy: any): Promise<void> {
    await db.saveDebtStrategy(strategy);
  }

  async saveDebtMilestone(milestone: any): Promise<void> {
    await db.saveDebtMilestone(milestone);
  }

  async getUserMilestones(userId: number, debtId?: number): Promise<any[]> {
    return db.getUserMilestones(userId, debtId);
  }

  async saveBudgetSnapshot(snapshot: any): Promise<void> {
    await db.saveBudgetSnapshot(snapshot);
  }

  async getDebtSummary(userId: number): Promise<any> {
    return db.getDebtSummary(userId);
  }

  async getAllUserPayments(userId: number, limit?: number): Promise<any[]> {
    return db.getAllUserPayments(userId, limit);
  }

  async getLatestStrategy(userId: number, strategyType?: string): Promise<any | undefined> {
    return db.getLatestStrategy(userId, strategyType);
  }

  async saveCoachingSession(session: any): Promise<void> {
    await db.saveCoachingSession(session);
  }

  async getRecentCoachingSessions(userId: number, limit?: number): Promise<any[]> {
    return db.getRecentCoachingSessions(userId, limit);
  }

  async getBudgetSnapshots(userId: number, limit?: number): Promise<any[]> {
    return db.getBudgetSnapshots(userId, limit);
  }
}
