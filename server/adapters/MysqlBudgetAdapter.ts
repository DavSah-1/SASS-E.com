/**
 * MysqlBudgetAdapter
 * 
 * Implements BudgetAdapter for MySQL database (admin users).
 * Delegates all operations to existing db.ts functions.
 */

import * as db from "../db";
import type { BudgetAdapter } from "./BudgetAdapter";

export class MysqlBudgetAdapter implements BudgetAdapter {
  async saveBudgetSnapshot(snapshot: any) {
    return db.saveBudgetSnapshot(snapshot);
  }

  async getBudgetSnapshots(userId: number, limit: number = 12) {
    return db.getBudgetSnapshots(userId, limit);
  }

  async createBudgetCategory(category: any) {
    return db.createBudgetCategory(category);
  }

  async getUserBudgetCategories(userId: number, type?: "income" | "expense") {
    return db.getUserBudgetCategories(userId, type);
  }

  async updateBudgetCategory(categoryId: number, updates: any) {
    return db.updateBudgetCategory(categoryId, updates);
  }

  async deleteBudgetCategory(categoryId: number) {
    return db.deleteBudgetCategory(categoryId);
  }

  async createBudgetTransaction(transaction: any) {
    return db.createBudgetTransaction(transaction);
  }

  async getUserBudgetTransactions(userId: number, options?: { categoryId?: number; startDate?: Date; endDate?: Date }) {
    return db.getUserBudgetTransactions(userId, options);
  }

  async updateBudgetTransaction(transactionId: number, updates: any) {
    return db.updateBudgetTransaction(transactionId, updates);
  }

  async deleteBudgetTransaction(transactionId: number) {
    return db.deleteBudgetTransaction(transactionId);
  }

  async calculateMonthlyBudgetSummary(userId: number, monthYear: string) {
    return db.calculateMonthlyBudgetSummary(userId, monthYear);
  }

  async saveMonthlyBudgetSummary(summary: any) {
    return db.saveMonthlyBudgetSummary(summary);
  }

  async getUserMonthlyBudgetSummaries(userId: number, limit: number = 12) {
    return db.getUserMonthlyBudgetSummaries(userId, limit);
  }

  async getCategorySpendingBreakdown(userId: number, monthYear: string) {
    return db.getCategorySpendingBreakdown(userId, monthYear);
  }

  async findDuplicateTransaction(userId: number, date: string, amount: number, description: string) {
    return db.findDuplicateTransaction(userId, date, amount, description);
  }
}
