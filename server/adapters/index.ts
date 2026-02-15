/**
 * Adapter Factory
 * 
 * Creates the appropriate adapter instance based on user role.
 * This is the single point where routing decisions are made.
 */

import { MySQLCoreAdapter } from './MySQLCoreAdapter';
import { SupabaseCoreAdapter } from './SupabaseCoreAdapter';
import type { CoreAdapter } from './CoreAdapter';
import { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
import { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
import type { NotificationAdapter } from './NotificationAdapter';
import { MysqlBudgetAdapter } from './MysqlBudgetAdapter';
import { SupabaseBudgetAdapter } from './SupabaseBudgetAdapter';
import type { BudgetAdapter } from './BudgetAdapter';
import { MysqlDebtAdapter } from './MysqlDebtAdapter';
import { SupabaseDebtAdapter } from './SupabaseDebtAdapter';
import type { DebtAdapter } from './DebtAdapter';
import { MysqlLearningAdapter } from './MysqlLearningAdapter';
import { SupabaseLearningAdapter } from './SupabaseLearningAdapter';
import type { LearningAdapter } from './LearningAdapter';
import { MysqlIoTAdapter } from './MysqlIoTAdapter';
import { SupabaseIoTAdapter } from './SupabaseIoTAdapter';
import type { IoTAdapter } from './IoTAdapter';
import { MysqlGoalsAdapter } from './MysqlGoalsAdapter';
import { SupabaseGoalsAdapter } from './SupabaseGoalsAdapter';
import type { GoalsAdapter } from './GoalsAdapter';
import { MysqlTranslationAdapter } from './MysqlTranslationAdapter';
import { SupabaseTranslationAdapter } from './SupabaseTranslationAdapter';
import type { TranslationAdapter } from './TranslationAdapter';
import { MySQLVerifiedFactAdapter } from './MySQLVerifiedFactAdapter';
import { SupabaseVerifiedFactAdapter } from './SupabaseVerifiedFactAdapter';
import type { VerifiedFactAdapter } from './VerifiedFactAdapter';

export interface AdapterContext {
  user: {
    id: string | number;
    numericId?: number;
    role: 'admin' | 'user';
  };
  accessToken?: string;
}

/**
 * Create core adapter based on user role
 */
export function createCoreAdapter(ctx: AdapterContext): CoreAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLCoreAdapter(ctx.user.numericId || Number(ctx.user.id));
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseCoreAdapter(userId, accessToken);
  }
}

/**
 * Create notification adapter based on user role
 */
export function createNotificationAdapter(ctx: AdapterContext): NotificationAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlNotificationAdapter();
  } else {
    const userId = String(ctx.user.id);
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
    const userId = String(ctx.user.id);
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
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseDebtAdapter(userId, accessToken);
  }
}

/**
 * Create learning adapter based on user role
 */
export function createLearningAdapter(ctx: AdapterContext): LearningAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlLearningAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseLearningAdapter(userId, accessToken);
  }
}

/**
 * Create IoT adapter based on user role
 */
export function createIoTAdapter(ctx: AdapterContext): IoTAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlIoTAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseIoTAdapter(userId, accessToken);
  }
}

/**
 * Create goals adapter based on user role
 */
export function createGoalsAdapter(ctx: AdapterContext): GoalsAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlGoalsAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseGoalsAdapter(userId, accessToken);
  }
}

/**
 * Create translation adapter based on user role
 */
export function createTranslationAdapter(ctx: AdapterContext): TranslationAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlTranslationAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseTranslationAdapter(userId, accessToken);
  }
}

/**
 * Create verified fact adapter based on user role
 */
export function createVerifiedFactAdapter(ctx: AdapterContext): VerifiedFactAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLVerifiedFactAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseVerifiedFactAdapter(userId, accessToken);
  }
}

// Export adapters and interfaces
export type { CoreAdapter } from './CoreAdapter';
export type { NotificationAdapter } from './NotificationAdapter';
export type { BudgetAdapter } from './BudgetAdapter';
export type { DebtAdapter } from './DebtAdapter';
export type { LearningAdapter } from './LearningAdapter';
export type { IoTAdapter } from './IoTAdapter';
export type { GoalsAdapter } from './GoalsAdapter';
export type { TranslationAdapter } from './TranslationAdapter';
export type { VerifiedFactAdapter } from './VerifiedFactAdapter';
export { MySQLCoreAdapter } from './MySQLCoreAdapter';
export { SupabaseCoreAdapter } from './SupabaseCoreAdapter';
export { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
export { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
export { MysqlBudgetAdapter } from './MysqlBudgetAdapter';
export { SupabaseBudgetAdapter } from './SupabaseBudgetAdapter';
export { MysqlIoTAdapter } from './MysqlIoTAdapter';
export { SupabaseIoTAdapter } from './SupabaseIoTAdapter';
export { MySQLVerifiedFactAdapter } from './MySQLVerifiedFactAdapter';
export { SupabaseVerifiedFactAdapter } from './SupabaseVerifiedFactAdapter';
