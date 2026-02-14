/**
 * SupabaseDebtAdapter
 * 
 * Supabase implementation of DebtAdapter with RLS enforcement
 */

import { getSupabaseClient } from '../supabaseClient';
import type { DebtAdapter } from './DebtAdapter';

export class SupabaseDebtAdapter implements DebtAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient() {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async addDebt(debt: any): Promise<void> {
    const supabase = await this.getClient();
    const originalAmount = (debt.originalAmount || debt.originalBalance || debt.balance || debt.currentBalance || 0) / 100;
    const currentBalance = (debt.currentBalance || debt.balance || 0) / 100;
    const interestRate = (debt.interestRate || 0) / 100;
    const minimumPayment = (debt.minimumPayment || 0) / 100;
    
    const { error } = await supabase
      .from('debts')
      .insert({
        user_id: this.userId,
        debt_name: debt.name || debt.debtName,
        original_amount: originalAmount,
        current_balance: currentBalance,
        interest_rate: interestRate,
        minimum_payment: minimumPayment,
        due_date: debt.dueDate,
        due_day: debt.dueDay || 1,
        debt_type: debt.debtType,
        status: debt.status || 'active',
        creditor: debt.creditor,
        account_number: debt.accountNumber,
        notes: debt.notes,
      });

    if (error) throw new Error(`Supabase addDebt error: ${error.message}`);
  }

  async getUserDebts(userId: number, includeInactive: boolean = false): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('debts')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('status', 'active');
    }

    const { data, error } = await query;
    if (error) throw new Error(`Supabase getUserDebts error: ${error.message}`);

    // Convert from Supabase format (dollars, snake_case) to app format (cents, camelCase)
    return (data || []).map((d: any) => ({
      id: d.id,
      userId: parseInt(this.userId),
      name: d.debt_name,
      debtName: d.debt_name,
      originalAmount: Math.round((d.original_amount || 0) * 100),
      currentBalance: Math.round((d.current_balance || 0) * 100),
      interestRate: Math.round((d.interest_rate || 0) * 100),
      minimumPayment: Math.round((d.minimum_payment || 0) * 100),
      dueDate: d.due_date,
      dueDay: d.due_day,
      debtType: d.debt_type,
      status: d.status,
      creditor: d.creditor,
      accountNumber: d.account_number,
      notes: d.notes,
      createdAt: d.created_at,
      updatedAt: d.updated_at,
    }));
  }

  async getDebtById(debtId: number, userId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('debts')
      .select('*')
      .eq('id', debtId)
      .eq('user_id', this.userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return undefined; // Not found
      throw new Error(`Supabase getDebtById error: ${error.message}`);
    }

    if (!data) return undefined;

    return {
      id: data.id,
      userId: parseInt(this.userId),
      name: data.debt_name,
      debtName: data.debt_name,
      originalAmount: Math.round((data.original_amount || 0) * 100),
      currentBalance: Math.round((data.current_balance || 0) * 100),
      interestRate: Math.round((data.interest_rate || 0) * 100),
      minimumPayment: Math.round((data.minimum_payment || 0) * 100),
      dueDate: data.due_date,
      dueDay: data.due_day,
      debtType: data.debt_type,
      status: data.status,
      creditor: data.creditor,
      accountNumber: data.account_number,
      notes: data.notes,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateDebt(debtId: number, userId: number, updates: any): Promise<void> {
    const supabase = await this.getClient();
    const supabaseUpdates: any = {};

    if (updates.name !== undefined) supabaseUpdates.debt_name = updates.name;
    if (updates.debtName !== undefined) supabaseUpdates.debt_name = updates.debtName;
    if (updates.currentBalance !== undefined) supabaseUpdates.current_balance = updates.currentBalance / 100;
    if (updates.interestRate !== undefined) supabaseUpdates.interest_rate = updates.interestRate / 100;
    if (updates.minimumPayment !== undefined) supabaseUpdates.minimum_payment = updates.minimumPayment / 100;
    if (updates.dueDate !== undefined) supabaseUpdates.due_date = updates.dueDate;
    if (updates.dueDay !== undefined) supabaseUpdates.due_day = updates.dueDay;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.creditor !== undefined) supabaseUpdates.creditor = updates.creditor;
    if (updates.accountNumber !== undefined) supabaseUpdates.account_number = updates.accountNumber;
    if (updates.notes !== undefined) supabaseUpdates.notes = updates.notes;

    const { error } = await supabase
      .from('debts')
      .update(supabaseUpdates)
      .eq('id', debtId)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase updateDebt error: ${error.message}`);
  }

  async deleteDebt(debtId: number, userId: number): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('debts')
      .delete()
      .eq('id', debtId)
      .eq('user_id', this.userId);

    if (error) throw new Error(`Supabase deleteDebt error: ${error.message}`);
  }

  async recordDebtPayment(payment: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('debt_payments')
      .insert({
        debt_id: payment.debtId,
        user_id: this.userId,
        payment_amount: payment.paymentAmount / 100,
        payment_date: payment.paymentDate,
        payment_method: payment.paymentMethod,
        notes: payment.notes,
      });

    if (error) throw new Error(`Supabase recordDebtPayment error: ${error.message}`);
  }

  async getDebtPaymentHistory(debtId: number, userId: number, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('debt_payments')
      .select('*')
      .eq('debt_id', debtId)
      .eq('user_id', this.userId)
      .order('payment_date', { ascending: false })
      .limit(limit);

    if (error) throw new Error(`Supabase getDebtPaymentHistory error: ${error.message}`);

    return (data || []).map((p: any) => ({
      id: p.id,
      debtId: p.debt_id,
      userId: parseInt(this.userId),
      paymentAmount: Math.round((p.payment_amount || 0) * 100),
      paymentDate: p.payment_date,
      paymentMethod: p.payment_method,
      notes: p.notes,
      createdAt: p.created_at,
    }));
  }

  async saveDebtStrategy(strategy: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('debt_strategies')
      .insert({
        user_id: this.userId,
        strategy_type: strategy.strategyType,
        target_debt_free_date: strategy.targetDebtFreeDate,
        monthly_extra_payment: strategy.monthlyExtraPayment / 100,
        notes: strategy.notes,
      });

    if (error) throw new Error(`Supabase saveDebtStrategy error: ${error.message}`);
  }

  async saveDebtMilestone(milestone: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('debt_milestones')
      .insert({
        user_id: this.userId,
        debt_id: milestone.debtId,
        milestone_type: milestone.milestoneType,
        target_date: milestone.targetDate,
        target_amount: milestone.targetAmount / 100,
        achieved: milestone.achieved ? 1 : 0,
        achieved_date: milestone.achievedDate,
        notes: milestone.notes,
      });

    if (error) throw new Error(`Supabase saveDebtMilestone error: ${error.message}`);
  }

  async getUserMilestones(userId: number, debtId?: number): Promise<any[]> {
    const supabase = await this.getClient();
    let query = supabase
      .from('debt_milestones')
      .select('*')
      .eq('user_id', this.userId)
      .order('target_date', { ascending: true });

    if (debtId) {
      query = query.eq('debt_id', debtId);
    }

    const { data, error } = await query;
    if (error) throw new Error(`Supabase getUserMilestones error: ${error.message}`);

    return (data || []).map((m: any) => ({
      id: m.id,
      userId: parseInt(this.userId),
      debtId: m.debt_id,
      milestoneType: m.milestone_type,
      targetDate: m.target_date,
      targetAmount: Math.round((m.target_amount || 0) * 100),
      achieved: m.achieved === 1,
      achievedDate: m.achieved_date,
      notes: m.notes,
      createdAt: m.created_at,
    }));
  }

  async saveBudgetSnapshot(snapshot: any): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('debt_budget_snapshots')
      .insert({
        user_id: this.userId,
        snapshot_date: snapshot.snapshotDate,
        total_income: snapshot.totalIncome / 100,
        total_expenses: snapshot.totalExpenses / 100,
        available_for_debt: snapshot.availableForDebt / 100,
        notes: snapshot.notes,
      });

    if (error) throw new Error(`Supabase saveBudgetSnapshot error: ${error.message}`);
  }

  async getDebtSummary(userId: number): Promise<any> {
    const supabase = await this.getClient();
    
    // Get all active debts
    const { data: debts, error: debtsError } = await supabase
      .from('debts')
      .select('*')
      .eq('user_id', this.userId)
      .eq('status', 'active');

    if (debtsError) throw new Error(`Supabase getDebtSummary error: ${debtsError.message}`);

    const totalBalance = (debts || []).reduce((sum: number, d: any) => sum + (d.current_balance || 0), 0);
    const totalMonthlyMinimum = (debts || []).reduce((sum: number, d: any) => sum + (d.minimum_payment || 0), 0);
    const debtCount = (debts || []).length;

    return {
      totalBalance: Math.round(totalBalance * 100),
      totalMonthlyMinimum: Math.round(totalMonthlyMinimum * 100),
      debtCount,
    };
  }
}
