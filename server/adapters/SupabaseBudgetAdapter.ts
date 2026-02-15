/**
 * SupabaseBudgetAdapter
 * 
 * Implements BudgetAdapter for Supabase database (regular users).
 * Extracts logic from dbRoleAware.ts with RLS enforcement.
 */

import { getSupabaseClient } from "../supabaseClient";
import type { BudgetAdapter } from "./BudgetAdapter";

function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Supabase Error] ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation}`);
}

export class SupabaseBudgetAdapter implements BudgetAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient() {
    return getSupabaseClient(this.userId, this.accessToken);
  }

  async saveBudgetSnapshot(snapshot: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('debt_budget_snapshots')
      .insert({
        user_id: this.userId,
        month_year: snapshot.monthYear || snapshot.snapshotDate,
        snapshot_date: snapshot.snapshotDate || new Date(),
        total_income: snapshot.totalIncome || 0,
        total_expenses: snapshot.totalExpenses || 0,
        total_debt_payments: snapshot.totalDebtPayments || 0,
        extra_payment_budget: snapshot.extraPaymentBudget || 0,
        actual_extra_payments: snapshot.actualExtraPayments || 0,
        notes: snapshot.notes || null,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveBudgetSnapshot');
    return data;
  }

  async getBudgetSnapshots(userId: number, limit: number = 12) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('debt_budget_snapshots')
      .select('*')
      .eq('user_id', this.userId)
      .order('snapshot_date', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getBudgetSnapshots');
    return data || [];
  }

  async createBudgetCategory(category: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('budget_categories')
      .insert({
        user_id: this.userId,
        name: category.name || category.categoryName,
        monthly_limit: category.monthlyLimit,
        type: category.type || category.categoryType,
        color: category.color,
        created_at: category.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createBudgetCategory');
    return data;
  }

  async getUserBudgetCategories(userId: number, type?: "income" | "expense") {
    const supabase = await this.getClient();
    let query = supabase
      .from('budget_categories')
      .select('*')
      .eq('user_id', this.userId);
    
    if (type) {
      query = query.eq('type', type);
    }
    
    const { data, error } = await query;
    if (error) handleSupabaseError(error, 'getUserBudgetCategories');
    return data || [];
  }

  async updateBudgetCategory(categoryId: number, updates: any) {
    const supabase = await this.getClient();
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.monthlyLimit !== undefined) updateData.monthly_limit = updates.monthlyLimit;
    if (updates.type !== undefined) updateData.type = updates.type;
    if (updates.color !== undefined) updateData.color = updates.color;
    
    const { data, error } = await supabase
      .from('budget_categories')
      .update(updateData)
      .eq('id', categoryId)
      .eq('user_id', this.userId)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateBudgetCategory');
    return data;
  }

  async deleteBudgetCategory(categoryId: number) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('budget_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', this.userId);
    
    if (error) handleSupabaseError(error, 'deleteBudgetCategory');
    return { success: true };
  }

  async createBudgetTransaction(transaction: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('budget_transactions')
      .insert({
        user_id: this.userId,
        category_id: transaction.categoryId,
        amount: transaction.amount,
        description: transaction.description,
        transaction_date: transaction.transactionDate || new Date(),
        type: transaction.type,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createBudgetTransaction');
    return data;
  }

  async getUserBudgetTransactions(userId: number, options?: { categoryId?: number; startDate?: Date; endDate?: Date }) {
    const supabase = await this.getClient();
    let query = supabase
      .from('budget_transactions')
      .select('*')
      .eq('user_id', this.userId);
    
    if (options?.categoryId) {
      query = query.eq('category_id', options.categoryId);
    }
    if (options?.startDate) {
      query = query.gte('transaction_date', options.startDate.toISOString());
    }
    if (options?.endDate) {
      query = query.lte('transaction_date', options.endDate.toISOString());
    }
    
    const { data, error } = await query.order('transaction_date', { ascending: false });
    if (error) handleSupabaseError(error, 'getUserBudgetTransactions');
    return data || [];
  }

  async updateBudgetTransaction(transactionId: number, updates: any) {
    const supabase = await this.getClient();
    const updateData: any = {};
    
    if (updates.categoryId !== undefined) updateData.category_id = updates.categoryId;
    if (updates.amount !== undefined) updateData.amount = updates.amount;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.transactionDate !== undefined) updateData.transaction_date = updates.transactionDate;
    if (updates.type !== undefined) updateData.type = updates.type;
    
    const { data, error } = await supabase
      .from('budget_transactions')
      .update(updateData)
      .eq('id', transactionId)
      .eq('user_id', this.userId)
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'updateBudgetTransaction');
    return data;
  }

  async deleteBudgetTransaction(transactionId: number) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('budget_transactions')
      .delete()
      .eq('id', transactionId)
      .eq('user_id', this.userId);
    
    if (error) handleSupabaseError(error, 'deleteBudgetTransaction');
    return { success: true };
  }

  async calculateMonthlyBudgetSummary(userId: number, monthYear: string) {
    // This is a complex calculation - for now, delegate to a helper
    // In production, you might want to use Supabase RPC or edge functions
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('monthly_budget_summaries')
      .select('*')
      .eq('user_id', this.userId)
      .eq('month_year', monthYear)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      handleSupabaseError(error, 'calculateMonthlyBudgetSummary');
    }
    return data || null;
  }

  async saveMonthlyBudgetSummary(summary: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('monthly_budget_summaries')
      .upsert({
        user_id: this.userId,
        month_year: summary.monthYear,
        total_income: summary.totalIncome,
        total_expenses: summary.totalExpenses,
        net_savings: summary.netSavings,
        category_breakdown: summary.categoryBreakdown,
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveMonthlyBudgetSummary');
    return data;
  }

  async getUserMonthlyBudgetSummaries(userId: number, limit: number = 12) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('monthly_budget_summaries')
      .select('*')
      .eq('user_id', this.userId)
      .order('month_year', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getUserMonthlyBudgetSummaries');
    return data || [];
  }

  async getCategorySpendingBreakdown(userId: number, monthYear: string) {
    const supabase = await this.getClient();
    const [year, month] = monthYear.split("-");
    const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
    const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);
    
    const { data, error } = await supabase
      .from('budget_transactions')
      .select(`
        amount,
        category_id,
        budget_categories(category_name, monthly_limit)
      `)
      .eq('user_id', this.userId)
      .eq('transaction_type', 'expense')
      .gte('transaction_date', startDate.toISOString())
      .lte('transaction_date', endDate.toISOString());
    
    if (error) throw new Error(`Supabase getCategorySpendingBreakdown error: ${error.message}`);
    
    // Group by category
    const breakdown = new Map();
    (data || []).forEach((t: any) => {
      const catId = t.category_id;
      const category = Array.isArray(t.budget_categories) ? t.budget_categories[0] : t.budget_categories;
      if (!breakdown.has(catId)) {
        breakdown.set(catId, {
          categoryId: catId,
          categoryName: category?.category_name,
          monthlyLimit: category?.monthly_limit,
          totalSpent: 0,
        });
      }
      breakdown.get(catId).totalSpent += t.amount;
    });
    
    return Array.from(breakdown.values());
  }

  async findDuplicateTransaction(userId: number, date: string, amount: number, description: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('budget_transactions')
      .select('*')
      .eq('user_id', this.userId)
      .eq('transaction_date', date)
      .eq('amount', amount)
      .eq('description', description)
      .limit(1)
      .maybeSingle();
    
    if (error) throw new Error(`Supabase findDuplicateTransaction error: ${error.message}`);
    return data;
  }
}
