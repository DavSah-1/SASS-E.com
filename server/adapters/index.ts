/**
 * Adapter Factory
 * 
 * Creates the appropriate adapter instance based on user role.
 * This is the single point where routing decisions are made.
 */

import { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
import { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
import type { NotificationAdapter } from './NotificationAdapter';
import { MysqlBudgetAdapter } from './MysqlBudgetAdapter';
import { SupabaseBudgetAdapter } from './SupabaseBudgetAdapter';
import type { BudgetAdapter } from './BudgetAdapter';
import { MysqlDebtAdapter } from './MysqlDebtAdapter';
import { SupabaseDebtAdapter } from './SupabaseDebtAdapter';
import type { DebtAdapter } from './DebtAdapter';

export interface AdapterContext {
  user: {
    id: string | number;
    numericId?: number;
    role: 'admin' | 'user';
  };
  accessToken?: string;
}

/**
 * Create notification adapter based on user role
 */
export function createNotificationAdapter(ctx: AdapterContext): NotificationAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlNotificationAdapter();
  } else {
    const userId = ctx.user.numericId || Number(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseNotificationAdapter(userId, accessToken);
  }
}

/**
 * Create budget adapter based on user role
 */
export function createBudgetAdapter(ctx: AdapterContext): BudgetAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlBudgetAdapter();
  } else {
    const userId = String(ctx.user.numericId || ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseBudgetAdapter(userId, accessToken);
  }
}

/**
 * Create debt adapter based on user role
 */
export function createDebtAdapter(ctx: AdapterContext): DebtAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlDebtAdapter();
  } else {
    const userId = String(ctx.user.numericId || ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseDebtAdapter(userId, accessToken);
  }
}

// Export adapters and interfaces
export type { NotificationAdapter } from './NotificationAdapter';
export type { BudgetAdapter } from './BudgetAdapter';
export type { DebtAdapter } from './DebtAdapter';
export { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
export { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
export { MysqlBudgetAdapter } from './MysqlBudgetAdapter';
export { SupabaseBudgetAdapter } from './SupabaseBudgetAdapter';
