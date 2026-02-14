/**
 * Notification Batching Utilities
 * 
 * Groups similar notifications by type and time window to reduce UI clutter.
 * Example: "3 new debt milestones" instead of 3 separate notifications
 */

export type NotificationType = 
  | 'fact_update'
  | 'debt_milestone'
  | 'debt_payment_reminder'
  | 'debt_strategy_update'
  | 'learning_achievement'
  | 'streak_reminder'
  | 'quiz_result'
  | 'budget_alert'
  | 'system_alert'
  | 'security_alert';

export interface BatchConfig {
  /** Time window in hours for batching (default: 1 hour) */
  windowHours: number;
  /** Notification types that should be batched */
  batchableTypes: NotificationType[];
}

const DEFAULT_BATCH_CONFIG: BatchConfig = {
  windowHours: 1,
  batchableTypes: [
    'debt_milestone',
    'learning_achievement',
    'quiz_result',
    'budget_alert',
    'fact_update',
  ],
};

/**
 * Generate a batch key for grouping notifications
 * Format: {type}_{date}_{hour}
 * Example: "debt_milestone_2026-02-14-16"
 */
export function generateBatchKey(
  notificationType: NotificationType,
  timestamp: Date = new Date(),
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  // Round down to the nearest window boundary
  const hourWindow = Math.floor(date.getHours() / config.windowHours) * config.windowHours;
  const hour = String(hourWindow).padStart(2, '0');
  
  return `${notificationType}_${year}-${month}-${day}-${hour}`;
}

/**
 * Check if a notification type should be batched
 */
export function shouldBatch(
  notificationType: NotificationType,
  config: BatchConfig = DEFAULT_BATCH_CONFIG
): boolean {
  return config.batchableTypes.includes(notificationType);
}

/**
 * Generate a batched notification title
 */
export function generateBatchedTitle(
  notificationType: NotificationType,
  count: number,
  originalTitle?: string
): string {
  if (count === 1) {
    return originalTitle || getDefaultTitle(notificationType);
  }
  
  const typeLabels: Record<NotificationType, string> = {
    fact_update: 'Fact Updates',
    debt_milestone: 'Debt Milestones',
    debt_payment_reminder: 'Payment Reminders',
    debt_strategy_update: 'Strategy Updates',
    learning_achievement: 'Learning Achievements',
    streak_reminder: 'Streak Reminders',
    quiz_result: 'Quiz Results',
    budget_alert: 'Budget Alerts',
    system_alert: 'System Alerts',
    security_alert: 'Security Alerts',
  };
  
  return `${count} New ${typeLabels[notificationType]}`;
}

/**
 * Generate a batched notification message
 */
export function generateBatchedMessage(
  notificationType: NotificationType,
  count: number,
  originalMessage?: string
): string {
  if (count === 1) {
    return originalMessage || getDefaultMessage(notificationType);
  }
  
  const typeMessages: Record<NotificationType, string> = {
    fact_update: `You have ${count} fact updates to review.`,
    debt_milestone: `You've reached ${count} debt payoff milestones!`,
    debt_payment_reminder: `You have ${count} upcoming payment reminders.`,
    debt_strategy_update: `${count} new debt strategy recommendations are available.`,
    learning_achievement: `You have earned ${count} new learning achievements!`,
    streak_reminder: `${count} streak reminders to keep your progress going.`,
    quiz_result: `${count} quiz results are ready to view.`,
    budget_alert: `You have ${count} budget alerts to review.`,
    system_alert: `${count} system updates require your attention.`,
    security_alert: `${count} security alerts need immediate attention.`,
  };
  
  return typeMessages[notificationType];
}

function getDefaultTitle(notificationType: NotificationType): string {
  const titles: Record<NotificationType, string> = {
    fact_update: 'Fact Update',
    debt_milestone: 'Debt Milestone',
    debt_payment_reminder: 'Payment Reminder',
    debt_strategy_update: 'Strategy Update',
    learning_achievement: 'Learning Achievement',
    streak_reminder: 'Streak Reminder',
    quiz_result: 'Quiz Result',
    budget_alert: 'Budget Alert',
    system_alert: 'System Alert',
    security_alert: 'Security Alert',
  };
  
  return titles[notificationType];
}

function getDefaultMessage(notificationType: NotificationType): string {
  const messages: Record<NotificationType, string> = {
    fact_update: 'A fact you accessed has been updated.',
    debt_milestone: "You've reached a debt payoff milestone!",
    debt_payment_reminder: 'You have an upcoming payment due.',
    debt_strategy_update: 'A new debt strategy recommendation is available.',
    learning_achievement: "You've earned a new learning achievement!",
    streak_reminder: 'Keep your learning streak going!',
    quiz_result: 'Your quiz result is ready.',
    budget_alert: 'Your budget needs attention.',
    system_alert: 'System update available.',
    security_alert: 'Security alert requires attention.',
  };
  
  return messages[notificationType];
}
