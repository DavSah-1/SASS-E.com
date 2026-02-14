/**
 * DebtAdapter Interface
 * 
 * Unified interface for debt management operations across MySQL (admin) and Supabase (user) databases.
 */

export interface DebtAdapter {
  // Debt Management
  addDebt(debt: any): Promise<void>;
  getUserDebts(userId: number, includeInactive?: boolean): Promise<any[]>;
  getDebtById(debtId: number, userId: number): Promise<any | undefined>;
  updateDebt(debtId: number, userId: number, updates: any): Promise<void>;
  deleteDebt(debtId: number, userId: number): Promise<void>;

  // Payment Tracking
  recordDebtPayment(payment: any): Promise<void>;
  getDebtPaymentHistory(debtId: number, userId: number, limit?: number): Promise<any[]>;

  // Strategy & Milestones
  saveDebtStrategy(strategy: any): Promise<void>;
  saveDebtMilestone(milestone: any): Promise<void>;
  getUserMilestones(userId: number, debtId?: number): Promise<any[]>;

  // Budget Snapshots
  saveBudgetSnapshot(snapshot: any): Promise<void>;

  // Summary & Analytics
  getDebtSummary(userId: number): Promise<any>;
  getAllUserPayments(userId: number, limit?: number): Promise<any[]>;
  getLatestStrategy(userId: number, strategyType?: string): Promise<any | undefined>;
  
  // Coaching & Sessions
  saveCoachingSession(session: any): Promise<void>;
  getRecentCoachingSessions(userId: number, limit?: number): Promise<any[]>;
  
  // Budget Snapshots
  getBudgetSnapshots(userId: number, limit?: number): Promise<any[]>;
}
