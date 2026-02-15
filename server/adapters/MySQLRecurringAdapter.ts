/**
 * MySQLRecurringAdapter - MySQL implementation for recurring transaction operations
 * 
 * Used for admin users. Delegates to server/db/recurring.ts functions.
 */

import { RecurringAdapter } from "./RecurringAdapter";
import * as recurringDb from "../db/recurring";

export class MySQLRecurringAdapter implements RecurringAdapter {
  async detectRecurringPatterns(userId: number): Promise<{ success: boolean; patternsFound: number }> {
    return recurringDb.detectRecurringPatterns(userId);
  }

  async getUserRecurringTransactions(userId: number, activeOnly: boolean = true): Promise<any[]> {
    return recurringDb.getUserRecurringTransactions(userId, activeOnly);
  }

  async calculateRecurringProjections(userId: number): Promise<{
    monthlyTotal: number;
    quarterlyTotal: number;
    yearlyTotal: number;
    byCategory: Record<string, number>;
  }> {
    return recurringDb.calculateRecurringProjections(userId);
  }

  async updateRecurringTransaction(
    userId: number,
    recurringId: number,
    updates: {
      reminderEnabled?: boolean;
      autoAdd?: boolean;
      isActive?: boolean;
      notes?: string;
    }
  ): Promise<{ success: boolean }> {
    return recurringDb.updateRecurringTransaction(userId, recurringId, updates);
  }

  async getUpcomingRecurring(userId: number): Promise<Array<{
    id: number;
    description: string;
    amount: number;
    dueDate: Date;
    daysUntilDue: number;
    category: string;
  }>> {
    return recurringDb.getUpcomingRecurring(userId);
  }
}
