import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { GoalsAdapter } from './GoalsAdapter';

function handleSupabaseError(error: any, operation: string): never {
  console.error(`[SupabaseGoalsAdapter] ${operation} error:`, error);
  throw new Error(`Supabase ${operation} error: ${error.message}`);
}

/**
 * Supabase implementation of GoalsAdapter
 * Uses RLS policies to enforce user-level data isolation
 */
export class SupabaseGoalsAdapter implements GoalsAdapter {
  private userId: string;
  private accessToken: string;
  private supabaseUrl: string;
  private supabaseKey: string;
  private clientPromise: Promise<SupabaseClient> | null = null;

  constructor(userId: string, accessToken: string, supabaseUrl: string, supabaseKey: string) {
    this.userId = userId;
    this.accessToken = accessToken;
    this.supabaseUrl = supabaseUrl;
    this.supabaseKey = supabaseKey;
  }

  private async getClient(): Promise<SupabaseClient> {
    if (!this.clientPromise) {
      this.clientPromise = (async () => {
        const client = createClient(this.supabaseUrl, this.supabaseKey, {
          global: {
            headers: {
              Authorization: `Bearer ${this.accessToken}`,
            },
          },
        });
        return client;
      })();
    }
    return this.clientPromise;
  }

  async createFinancialGoal(goal: any): Promise<number> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('financial_goals')
      .insert({
        user_id: this.userId,
        name: goal.name || goal.goalName,
        description: goal.description,
        target_amount: goal.targetAmount,
        current_amount: goal.currentAmount || 0,
        target_date: goal.targetDate,
        category: goal.category || goal.goalType,
        status: goal.status || 'active',
        created_at: goal.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'createFinancialGoal');
    return data?.id || 0;
  }

  async getUserGoals(userId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', this.userId)
      .order('priority', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getUserGoals');
    
    // Convert to match MySQL schema format
    return (data || []).map(goal => ({
      id: goal.id,
      userId: goal.user_id,
      name: goal.name,
      description: goal.description,
      type: goal.type || 'custom',
      targetAmount: goal.target_amount ? parseFloat(goal.target_amount) * 100 : 0,
      currentAmount: goal.current_amount ? parseFloat(goal.current_amount) * 100 : 0,
      targetDate: goal.target_date,
      status: goal.status || 'active',
      priority: goal.priority || 0,
      icon: goal.icon || '🎯',
      color: goal.color || '#10b981',
      isAutoTracked: 0,
      linkedCategoryId: null,
      completedAt: null,
      createdAt: goal.created_at,
      updatedAt: goal.updated_at,
    }));
  }

  async getGoalById(goalId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('id', goalId)
      .eq('user_id', this.userId)
      .maybeSingle();
    
    if (error) handleSupabaseError(error, 'getGoalById');
    
    if (!data) return undefined;
    
    return {
      id: data.id,
      userId: data.user_id,
      name: data.name,
      description: data.description,
      type: data.type || 'custom',
      targetAmount: data.target_amount ? parseFloat(data.target_amount) * 100 : 0,
      currentAmount: data.current_amount ? parseFloat(data.current_amount) * 100 : 0,
      targetDate: data.target_date,
      status: data.status || 'active',
      priority: data.priority || 0,
      icon: data.icon || '🎯',
      color: data.color || '#10b981',
      isAutoTracked: 0,
      linkedCategoryId: null,
      completedAt: null,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  async updateFinancialGoal(goalId: number, updates: any): Promise<void> {
    const supabase = await this.getClient();
    const supabaseUpdates: any = {
      updated_at: new Date(),
    };
    
    if (updates.name !== undefined) supabaseUpdates.name = updates.name;
    if (updates.description !== undefined) supabaseUpdates.description = updates.description;
    if (updates.targetAmount !== undefined) supabaseUpdates.target_amount = updates.targetAmount;
    if (updates.currentAmount !== undefined) supabaseUpdates.current_amount = updates.currentAmount;
    if (updates.targetDate !== undefined) supabaseUpdates.target_date = updates.targetDate;
    if (updates.status !== undefined) supabaseUpdates.status = updates.status;
    if (updates.priority !== undefined) supabaseUpdates.priority = updates.priority;
    if (updates.icon !== undefined) supabaseUpdates.icon = updates.icon;
    if (updates.color !== undefined) supabaseUpdates.color = updates.color;
    
    const { error } = await supabase
      .from('financial_goals')
      .update(supabaseUpdates)
      .eq('id', goalId)
      .eq('user_id', this.userId);
    
    if (error) handleSupabaseError(error, 'updateFinancialGoal');
  }

  async deleteFinancialGoal(goalId: number): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('financial_goals')
      .delete()
      .eq('id', goalId)
      .eq('user_id', this.userId);
    
    if (error) handleSupabaseError(error, 'deleteFinancialGoal');
  }

  async recordGoalProgress(goalId: number, amount: number, note?: string, source?: "manual" | "auto_budget" | "auto_debt"): Promise<number | null> {
    const supabase = await this.getClient();
    
    // Get current goal
    const goal = await this.getGoalById(goalId);
    if (!goal) {
      throw new Error("Goal not found");
    }
    
    // Calculate new current amount
    const newCurrentAmount = goal.currentAmount + amount;
    
    // Record progress entry
    const { data: progressData, error: progressError } = await supabase
      .from('goal_progress')
      .insert({
        goal_id: goalId,
        user_id: this.userId,
        amount: amount,
        note: note || null,
        source: source || 'manual',
        recorded_at: new Date(),
      })
      .select()
      .single();
    
    if (progressError) handleSupabaseError(progressError, 'recordGoalProgress');
    
    // Update goal current amount
    const { error: updateError } = await supabase
      .from('financial_goals')
      .update({
        current_amount: newCurrentAmount,
        updated_at: new Date(),
      })
      .eq('id', goalId)
      .eq('user_id', this.userId);
    
    if (updateError) handleSupabaseError(updateError, 'recordGoalProgress.update');
    
    return newCurrentAmount;
  }

  async getGoalProgressHistory(goalId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('goal_progress')
      .select('*')
      .eq('goal_id', goalId)
      .eq('user_id', this.userId)
      .order('recorded_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getGoalProgressHistory');
    
    return (data || []).map(p => ({
      id: p.id,
      goalId: p.goal_id,
      userId: p.user_id,
      amount: p.amount,
      note: p.note,
      source: p.source,
      recordedAt: p.recorded_at,
    }));
  }

  async getGoalMilestones(goalId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('goal_milestones')
      .select('*')
      .eq('goal_id', goalId)
      .order('percentage', { ascending: true });
    
    if (error) handleSupabaseError(error, 'getGoalMilestones');
    
    return (data || []).map(m => ({
      id: m.id,
      goalId: m.goal_id,
      percentage: m.percentage,
      title: m.title,
      description: m.description,
      isReached: m.is_reached || false,
      reachedAt: m.reached_at,
      celebrationShown: m.celebration_shown || false,
    }));
  }

  async getUnshownCelebrations(userId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('goal_milestones')
      .select(`
        *,
        financial_goals(*)
      `)
      .eq('financial_goals.user_id', this.userId)
      .eq('is_reached', true)
      .eq('celebration_shown', false)
      .order('reached_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUnshownCelebrations');
    
    return (data || []).map(m => ({
      id: m.id,
      goalId: m.goal_id,
      goalName: Array.isArray(m.financial_goals) ? m.financial_goals[0]?.name : m.financial_goals?.name,
      percentage: m.percentage,
      title: m.title,
      description: m.description,
      reachedAt: m.reached_at,
    }));
  }

  async markMilestoneCelebrationShown(milestoneId: number): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('goal_milestones')
      .update({
        celebration_shown: true,
      })
      .eq('id', milestoneId);
    
    if (error) handleSupabaseError(error, 'markMilestoneCelebrationShown');
  }
}
