/**
 * MySQLSharingAdapter - MySQL implementation for shared budget operations
 * 
 * Used for admin users. Delegates to server/db/sharing.ts functions.
 */

import { SharingAdapter } from "./SharingAdapter";
import * as sharingDb from "../db/sharing";

export class MySQLSharingAdapter implements SharingAdapter {
  async createSharedBudget(
    ownerId: number,
    name: string,
    description?: string
  ): Promise<{ success: boolean; budgetId?: number }> {
    return sharingDb.createSharedBudget(ownerId, name, description);
  }

  async inviteToSharedBudget(
    budgetId: number,
    inviterId: number,
    inviteeId: number,
    role: "editor" | "viewer"
  ): Promise<{ success: boolean; error?: string }> {
    return sharingDb.inviteToSharedBudget(budgetId, inviterId, inviteeId, role);
  }

  async respondToInvitation(
    invitationId: number,
    userId: number,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }> {
    return sharingDb.respondToInvitation(invitationId, userId, accept);
  }

  async getUserSharedBudgets(userId: number): Promise<any[]> {
    return sharingDb.getUserSharedBudgets(userId);
  }

  async getSharedBudgetMembers(budgetId: number): Promise<any[]> {
    return sharingDb.getSharedBudgetMembers(budgetId);
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
    return sharingDb.addSharedTransaction(budgetId, userId, data);
  }

  async createSplitExpense(
    transactionId: number,
    splits: Array<{ userId: number; amount: number }>
  ): Promise<{ success: boolean }> {
    return sharingDb.createSplitExpense(transactionId, splits);
  }

  async markSplitPaid(
    splitId: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }> {
    return sharingDb.markSplitPaid(splitId, userId);
  }

  async getSettlementSummary(budgetId: number): Promise<any[]> {
    return sharingDb.getSettlementSummary(budgetId);
  }

  async getSharedBudgetActivity(budgetId: number, limit: number = 20): Promise<any[]> {
    return sharingDb.getSharedBudgetActivity(budgetId, limit);
  }

  async removeMember(
    budgetId: number,
    removerId: number,
    memberIdToRemove: number
  ): Promise<{ success: boolean; error?: string }> {
    return sharingDb.removeMember(budgetId, removerId, memberIdToRemove);
  }
}
