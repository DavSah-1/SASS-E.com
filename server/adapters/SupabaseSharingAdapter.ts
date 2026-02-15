/**
 * SupabaseSharingAdapter - Supabase implementation for shared budget operations
 * 
 * Used for regular users. Enforces Row-Level Security (RLS) at database level.
 */

import { SharingAdapter } from "./SharingAdapter";
import { getSupabaseClient } from "../supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";

export class SupabaseSharingAdapter implements SharingAdapter {
  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return getSupabaseClient(this.accessToken);
  }

  async createSharedBudget(
    ownerId: number,
    name: string,
    description?: string
  ): Promise<{ success: boolean; budgetId?: number }> {
    const client = await this.getClient();

    const { data: budget, error: budgetError } = await client
      .from("shared_budgets")
      .insert({
        name,
        description,
        owner_id: ownerId,
        status: "active",
      })
      .select()
      .single();

    if (budgetError || !budget) {
      console.error("[SupabaseSharingAdapter] createSharedBudget error:", budgetError);
      return { success: false };
    }

    // Add owner as a member
    const { error: memberError } = await client
      .from("shared_budget_members")
      .insert({
        shared_budget_id: budget.id,
        user_id: ownerId,
        role: "owner",
        invited_by: ownerId,
        joined_at: new Date().toISOString(),
        status: "active",
      });

    if (memberError) {
      console.error("[SupabaseSharingAdapter] add owner as member error:", memberError);
    }

    // Log activity
    await client.from("shared_budget_activity").insert({
      shared_budget_id: budget.id,
      user_id: ownerId,
      action: "created_budget",
      details: JSON.stringify({ budgetName: name }),
    });

    return { success: true, budgetId: budget.id };
  }

  async inviteToSharedBudget(
    budgetId: number,
    inviterId: number,
    inviteeId: number,
    role: "editor" | "viewer"
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient();

    // Check if inviter has permission
    const { data: inviterMember, error: checkError } = await client
      .from("shared_budget_members")
      .select()
      .eq("shared_budget_id", budgetId)
      .eq("user_id", inviterId)
      .eq("status", "active")
      .in("role", ["owner", "editor"])
      .limit(1)
      .single();

    if (checkError || !inviterMember) {
      return { success: false, error: "No permission to invite" };
    }

    // Check if already invited/member
    const { data: existing } = await client
      .from("shared_budget_members")
      .select()
      .eq("shared_budget_id", budgetId)
      .eq("user_id", inviteeId)
      .limit(1)
      .single();

    if (existing) {
      return { success: false, error: "User already invited or is a member" };
    }

    // Create invitation
    const { error: inviteError } = await client
      .from("shared_budget_members")
      .insert({
        shared_budget_id: budgetId,
        user_id: inviteeId,
        role,
        invited_by: inviterId,
        status: "pending",
      });

    if (inviteError) {
      console.error("[SupabaseSharingAdapter] invite error:", inviteError);
      return { success: false, error: "Failed to create invitation" };
    }

    // Log activity
    await client.from("shared_budget_activity").insert({
      shared_budget_id: budgetId,
      user_id: inviterId,
      action: "invited_member",
      details: JSON.stringify({ inviteeId, role }),
    });

    return { success: true };
  }

  async respondToInvitation(
    invitationId: number,
    userId: number,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient();

    const { data: invitation, error: fetchError } = await client
      .from("shared_budget_members")
      .select()
      .eq("id", invitationId)
      .eq("user_id", userId)
      .eq("status", "pending")
      .limit(1)
      .single();

    if (fetchError || !invitation) {
      return { success: false, error: "Invitation not found" };
    }

    const newStatus = accept ? "active" : "declined";
    const joinedAt = accept ? new Date().toISOString() : null;

    const { error: updateError } = await client
      .from("shared_budget_members")
      .update({ status: newStatus, joined_at: joinedAt })
      .eq("id", invitationId);

    if (updateError) {
      console.error("[SupabaseSharingAdapter] respond error:", updateError);
      return { success: false, error: "Failed to update invitation" };
    }

    // Log activity
    await client.from("shared_budget_activity").insert({
      shared_budget_id: invitation.shared_budget_id,
      user_id: userId,
      action: accept ? "accepted_invitation" : "declined_invitation",
      details: JSON.stringify({}),
    });

    return { success: true };
  }

  async getUserSharedBudgets(userId: number): Promise<any[]> {
    const client = await this.getClient();

    const { data, error } = await client
      .from("shared_budget_members")
      .select(`
        *,
        budget:shared_budgets(*),
        owner:shared_budgets(owner:users(*))
      `)
      .eq("user_id", userId)
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SupabaseSharingAdapter] getUserSharedBudgets error:", error);
      return [];
    }

    return data || [];
  }

  async getSharedBudgetMembers(budgetId: number): Promise<any[]> {
    const client = await this.getClient();

    const { data, error } = await client
      .from("shared_budget_members")
      .select(`
        *,
        user:users(*)
      `)
      .eq("shared_budget_id", budgetId)
      .order("role", { ascending: true })
      .order("joined_at", { ascending: false });

    if (error) {
      console.error("[SupabaseSharingAdapter] getSharedBudgetMembers error:", error);
      return [];
    }

    return data || [];
  }

  async addSharedTransaction(
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
    const client = await this.getClient();

    // Check permission (must be owner or editor)
    const { data: member } = await client
      .from("shared_budget_members")
      .select()
      .eq("shared_budget_id", budgetId)
      .eq("user_id", userId)
      .eq("status", "active")
      .in("role", ["owner", "editor"])
      .limit(1)
      .single();

    if (!member) {
      return { success: false, error: "No permission to add transactions" };
    }

    const { data: transaction, error: insertError } = await client
      .from("shared_budget_transactions")
      .insert({
        shared_budget_id: budgetId,
        user_id: userId,
        category_id: data.categoryId,
        amount: data.amount,
        description: data.description,
        transaction_date: data.transactionDate.toISOString(),
        receipt_url: data.receiptUrl,
        notes: data.notes,
      })
      .select()
      .single();

    if (insertError || !transaction) {
      console.error("[SupabaseSharingAdapter] addSharedTransaction error:", insertError);
      return { success: false, error: "Failed to add transaction" };
    }

    // Log activity
    await client.from("shared_budget_activity").insert({
      shared_budget_id: budgetId,
      user_id: userId,
      action: "added_transaction",
      details: JSON.stringify({
        amount: data.amount,
        description: data.description,
      }),
    });

    return { success: true, transactionId: transaction.id };
  }

  async createSplitExpense(
    transactionId: number,
    splits: Array<{ userId: number; amount: number }>
  ): Promise<{ success: boolean }> {
    const client = await this.getClient();

    // Mark transaction as split
    const { error: updateError } = await client
      .from("shared_budget_transactions")
      .update({ is_split: true })
      .eq("id", transactionId);

    if (updateError) {
      console.error("[SupabaseSharingAdapter] mark split error:", updateError);
      return { success: false };
    }

    // Create split records
    const splitRecords = splits.map(split => ({
      transaction_id: transactionId,
      user_id: split.userId,
      amount: split.amount,
      is_paid: false,
    }));

    const { error: insertError } = await client
      .from("split_expenses")
      .insert(splitRecords);

    if (insertError) {
      console.error("[SupabaseSharingAdapter] create splits error:", insertError);
      return { success: false };
    }

    return { success: true };
  }

  async markSplitPaid(
    splitId: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient();

    const { data: split, error: fetchError } = await client
      .from("split_expenses")
      .select()
      .eq("id", splitId)
      .eq("user_id", userId)
      .limit(1)
      .single();

    if (fetchError || !split) {
      return { success: false, error: "Split expense not found" };
    }

    const { error: updateError } = await client
      .from("split_expenses")
      .update({ is_paid: true, paid_at: new Date().toISOString() })
      .eq("id", splitId);

    if (updateError) {
      console.error("[SupabaseSharingAdapter] markSplitPaid error:", updateError);
      return { success: false, error: "Failed to mark as paid" };
    }

    return { success: true };
  }

  async getSettlementSummary(budgetId: number): Promise<any[]> {
    const client = await this.getClient();

    const { data, error } = await client
      .from("split_expenses")
      .select(`
        *,
        transaction:shared_budget_transactions(*),
        user:users(*)
      `)
      .eq("shared_budget_transactions.shared_budget_id", budgetId)
      .eq("is_paid", false)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[SupabaseSharingAdapter] getSettlementSummary error:", error);
      return [];
    }

    return data || [];
  }

  async getSharedBudgetActivity(budgetId: number, limit: number = 20): Promise<any[]> {
    const client = await this.getClient();

    const { data, error } = await client
      .from("shared_budget_activity")
      .select(`
        *,
        user:users(*)
      `)
      .eq("shared_budget_id", budgetId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("[SupabaseSharingAdapter] getSharedBudgetActivity error:", error);
      return [];
    }

    return data || [];
  }

  async removeMember(
    budgetId: number,
    removerId: number,
    memberIdToRemove: number
  ): Promise<{ success: boolean; error?: string }> {
    const client = await this.getClient();

    // Check if remover is owner
    const { data: removerMember } = await client
      .from("shared_budget_members")
      .select()
      .eq("shared_budget_id", budgetId)
      .eq("user_id", removerId)
      .eq("status", "active")
      .eq("role", "owner")
      .limit(1)
      .single();

    if (!removerMember && removerId !== memberIdToRemove) {
      return { success: false, error: "Only owner can remove members" };
    }

    const { error: updateError } = await client
      .from("shared_budget_members")
      .update({ status: "removed" })
      .eq("shared_budget_id", budgetId)
      .eq("user_id", memberIdToRemove);

    if (updateError) {
      console.error("[SupabaseSharingAdapter] removeMember error:", updateError);
      return { success: false, error: "Failed to remove member" };
    }

    // Log activity
    await client.from("shared_budget_activity").insert({
      shared_budget_id: budgetId,
      user_id: removerId,
      action: "removed_member",
      details: JSON.stringify({ removedUserId: memberIdToRemove }),
    });

    return { success: true };
  }
}
