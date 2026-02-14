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

/**
 * Create learning adapter based on user role
 */
export function createLearningAdapter(ctx: AdapterContext): LearningAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlLearningAdapter();
  } else {
    const userId = String(ctx.user.numericId || ctx.user.id);
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
    const userId = String(ctx.user.numericId || ctx.user.id);
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
    const userId = String(ctx.user.numericId || ctx.user.id);
    const accessToken = ctx.accessToken || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    return new SupabaseGoalsAdapter(userId, accessToken, supabaseUrl, supabaseKey);
  }
}

/**
 * Create translation adapter based on user role
 */
export function createTranslationAdapter(ctx: AdapterContext): TranslationAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlTranslationAdapter();
  } else {
    const userId = String(ctx.user.numericId || ctx.user.id);
    const accessToken = ctx.accessToken || '';
    const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
    const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
    const getClient = async () => {
      const { createClient } = await import('@supabase/supabase-js');
      return createClient(supabaseUrl, supabaseKey, {
        global: { headers: { Authorization: `Bearer ${accessToken}` } },
      });
    };
    return new SupabaseTranslationAdapter(userId, getClient);
  }
}

// Export adapters and interfaces
export type { NotificationAdapter } from './NotificationAdapter';
export type { BudgetAdapter } from './BudgetAdapter';
export type { DebtAdapter } from './DebtAdapter';
export type { LearningAdapter } from './LearningAdapter';
export type { IoTAdapter } from './IoTAdapter';
export type { GoalsAdapter } from './GoalsAdapter';
export type { TranslationAdapter } from './TranslationAdapter';
export { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
export { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
export { MysqlBudgetAdapter } from './MysqlBudgetAdapter';
export { SupabaseBudgetAdapter } from './SupabaseBudgetAdapter';
export { MysqlIoTAdapter } from './MysqlIoTAdapter';
export { SupabaseIoTAdapter } from './SupabaseIoTAdapter';
