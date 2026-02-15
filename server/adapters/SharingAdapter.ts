/**
 * SharingAdapter - Interface for shared budget operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

export interface SharingAdapter {
  /**
   * Create a new shared budget
   */
  createSharedBudget(
    ownerId: number,
    name: string,
    description?: string
  ): Promise<{ success: boolean; budgetId?: number }>;

  /**
   * Invite user to shared budget
   */
  inviteToSharedBudget(
    budgetId: number,
    inviterId: number,
    inviteeId: number,
    role: "editor" | "viewer"
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Accept or decline invitation
   */
  respondToInvitation(
    invitationId: number,
    userId: number,
    accept: boolean
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Get shared budgets for user
   */
  getUserSharedBudgets(userId: number): Promise<any[]>;

  /**
   * Get members of a shared budget
   */
  getSharedBudgetMembers(budgetId: number): Promise<any[]>;

  /**
   * Add transaction to shared budget
   */
  addSharedTransaction(
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
  ): Promise<{ success: boolean; transactionId?: number; error?: string }>;

  /**
   * Create split expense
   */
  createSplitExpense(
    transactionId: number,
    splits: Array<{ userId: number; amount: number }>
  ): Promise<{ success: boolean }>;

  /**
   * Mark split expense as paid
   */
  markSplitPaid(
    splitId: number,
    userId: number
  ): Promise<{ success: boolean; error?: string }>;

  /**
   * Get settlement summary (who owes whom)
   */
  getSettlementSummary(budgetId: number): Promise<any[]>;

  /**
   * Get activity log for shared budget
   */
  getSharedBudgetActivity(budgetId: number, limit?: number): Promise<any[]>;

  /**
   * Remove member from shared budget
   */
  removeMember(
    budgetId: number,
    removerId: number,
    memberIdToRemove: number
  ): Promise<{ success: boolean; error?: string }>;
}
