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
import { MySQLWellbeingAdapter } from './MySQLWellbeingAdapter';
import { SupabaseWellbeingAdapter } from './SupabaseWellbeingAdapter';
import type { WellbeingAdapter } from './WellbeingAdapter';
import { MySQLSharingAdapter } from './MySQLSharingAdapter';
import { SupabaseSharingAdapter } from './SupabaseSharingAdapter';
import type { SharingAdapter } from './SharingAdapter';
import { MySQLWearableAdapter } from './MySQLWearableAdapter';
import { SupabaseWearableAdapter } from './SupabaseWearableAdapter';
import type { WearableAdapter } from './WearableAdapter';
import { MySQLAlertsAdapter } from './MySQLAlertsAdapter';
import { SupabaseAlertsAdapter } from './SupabaseAlertsAdapter';
import type { AlertsAdapter } from './AlertsAdapter';
import { MySQLRecurringAdapter } from './MySQLRecurringAdapter';
import { SupabaseRecurringAdapter } from './SupabaseRecurringAdapter';
import type { RecurringAdapter } from './RecurringAdapter';
import { MySQLInsightsAdapter } from './MySQLInsightsAdapter';
import { SupabaseInsightsAdapter } from './SupabaseInsightsAdapter';
import type { InsightsAdapter } from './InsightsAdapter';
import { MySQLReceiptsAdapter } from './MySQLReceiptsAdapter';
import { SupabaseReceiptsAdapter } from './SupabaseReceiptsAdapter';
import type { ReceiptsAdapter } from './ReceiptsAdapter';
import { MySQLLanguageLearningAdapter, createMySQLLanguageLearningAdapter } from './MySQLLanguageLearningAdapter';
import { SupabaseLanguageLearningAdapter, createSupabaseLanguageLearningAdapter } from './SupabaseLanguageLearningAdapter';
import type { LanguageLearningAdapter } from './LanguageLearningAdapter';
import { MySQLMathScienceAdapter, createMySQLMathScienceAdapter } from './MySQLMathScienceAdapter';
import { SupabaseMathScienceAdapter, createSupabaseMathScienceAdapter } from './SupabaseMathScienceAdapter';
import type { MathScienceAdapter } from './MathScienceAdapter';
import { MySQLLearningHubAdapter, createMySQLLearningHubAdapter } from './MySQLLearningHubAdapter';
import { SupabaseLearningHubAdapter, createSupabaseLearningHubAdapter } from './SupabaseLearningHubAdapter';
import type { LearningHubAdapter } from './LearningHubAdapter';
import { MySQLLearnFinanceAdapter, createMySQLLearnFinanceAdapter } from './MySQLLearnFinanceAdapter';
import { SupabaseLearnFinanceAdapter, createSupabaseLearnFinanceAdapter } from './SupabaseLearnFinanceAdapter';
import type { LearnFinanceAdapter } from './LearnFinanceAdapter';

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

/**
 * Create wellbeing adapter based on user role
 */
export function createWellbeingAdapter(ctx: AdapterContext): WellbeingAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLWellbeingAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseWellbeingAdapter(userId, accessToken);
  }
}

/**
 * Create sharing adapter based on user role
 */
export function createSharingAdapter(ctx: AdapterContext): SharingAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLSharingAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseSharingAdapter(userId, accessToken);
  }
}

/**
 * Create wearable adapter based on user role
 */
export function createWearableAdapter(ctx: AdapterContext): WearableAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLWearableAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseWearableAdapter(userId, accessToken);
  }
}

/**
 * Create alerts adapter based on user role
 */
export function createAlertsAdapter(ctx: AdapterContext): AlertsAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLAlertsAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseAlertsAdapter(userId, accessToken);
  }
}

/**
 * Create recurring adapter based on user role
 */
export function createRecurringAdapter(ctx: AdapterContext): RecurringAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLRecurringAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseRecurringAdapter(userId, accessToken);
  }
}

/**
 * Create insights adapter based on user role
 */
export function createInsightsAdapter(ctx: AdapterContext): InsightsAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLInsightsAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseInsightsAdapter(userId, accessToken);
  }
}

/**
 * Create receipts adapter based on user role
 */
export function createReceiptsAdapter(ctx: AdapterContext): ReceiptsAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLReceiptsAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseReceiptsAdapter(userId, accessToken);
  }
}

/**
 * Create language learning adapter based on user role
 */
export function createLanguageLearningAdapter(ctx: AdapterContext): LanguageLearningAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLLanguageLearningAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseLanguageLearningAdapter(userId, accessToken);
  }
}

/**
 * Create math science adapter based on user role
 */
export function createMathScienceAdapter(ctx: AdapterContext): MathScienceAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLMathScienceAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseMathScienceAdapter(userId, accessToken);
  }
}

/**
 * Create learning hub adapter based on user role
 */
export function createLearningHubAdapter(ctx: AdapterContext): LearningHubAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLLearningHubAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseLearningHubAdapter(userId, accessToken);
  }
}

/**
 * Create learn finance adapter based on user role
 */
export function createLearnFinanceAdapter(ctx: AdapterContext): LearnFinanceAdapter {
  if (ctx.user.role === 'admin') {
    return new MySQLLearnFinanceAdapter();
  } else {
    const userId = String(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseLearnFinanceAdapter(userId, accessToken);
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
export type { WellbeingAdapter } from './WellbeingAdapter';
export type { SharingAdapter } from './SharingAdapter';
export type { WearableAdapter } from './WearableAdapter';
export type { AlertsAdapter} from './AlertsAdapter';
export type { RecurringAdapter } from './RecurringAdapter';
export type { InsightsAdapter } from './InsightsAdapter';
export type { ReceiptsAdapter } from './ReceiptsAdapter';
export type { LanguageLearningAdapter } from './LanguageLearningAdapter';
export type { MathScienceAdapter } from './MathScienceAdapter';
export type { LearningHubAdapter } from './LearningHubAdapter';
export type { LearnFinanceAdapter } from './LearnFinanceAdapter';
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
