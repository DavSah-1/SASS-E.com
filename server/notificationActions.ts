/**
 * Notification Action Helpers
 * Generate action URLs and metadata for notification quick actions
 */

export type NotificationType =
  | "fact_update"
  | "debt_milestone"
  | "debt_payment_reminder"
  | "debt_strategy_update"
  | "learning_achievement"
  | "streak_reminder"
  | "quiz_result"
  | "budget_alert"
  | "system_alert"
  | "security_alert";

export type ActionType = "view_details" | "mark_read" | "dismiss" | "custom";

export interface NotificationAction {
  actionUrl: string | null;
  actionType: ActionType;
  actionLabel: string;
}

/**
 * Generate action metadata for a notification based on its type
 */
export function getNotificationAction(
  notificationType: NotificationType,
  metadata?: Record<string, any>
): NotificationAction {
  switch (notificationType) {
    case "fact_update":
      return {
        actionUrl: metadata?.factId ? `/learn?factId=${metadata.factId}` : "/learn",
        actionType: "view_details",
        actionLabel: "View Update",
      };

    case "debt_milestone":
    case "debt_payment_reminder":
    case "debt_strategy_update":
      return {
        actionUrl: metadata?.debtId ? `/money-hub?debtId=${metadata.debtId}` : "/money-hub",
        actionType: "view_details",
        actionLabel: "View Debt",
      };

    case "budget_alert":
      return {
        actionUrl: "/money-hub?tab=budget",
        actionType: "view_details",
        actionLabel: "View Budget",
      };

    case "learning_achievement":
    case "streak_reminder":
      return {
        actionUrl: metadata?.topicId ? `/learn?topicId=${metadata.topicId}` : "/learn",
        actionType: "view_details",
        actionLabel: "Continue Learning",
      };

    case "quiz_result":
      return {
        actionUrl: metadata?.quizId ? `/learn/quiz/${metadata.quizId}` : "/learn",
        actionType: "view_details",
        actionLabel: "View Results",
      };

    case "system_alert":
    case "security_alert":
      return {
        actionUrl: "/settings",
        actionType: "view_details",
        actionLabel: "View Settings",
      };

    default:
      return {
        actionUrl: null,
        actionType: "mark_read",
        actionLabel: "Mark as Read",
      };
  }
}

/**
 * Get action button configuration for UI rendering
 */
export interface ActionButton {
  label: string;
  action: "navigate" | "markRead" | "dismiss";
  url?: string;
  variant?: "default" | "outline" | "ghost";
}

export function getActionButtons(
  notificationType: NotificationType,
  metadata?: Record<string, any>
): ActionButton[] {
  const primaryAction = getNotificationAction(notificationType, metadata);
  
  const buttons: ActionButton[] = [];

  // Primary action button
  if (primaryAction.actionUrl) {
    buttons.push({
      label: primaryAction.actionLabel,
      action: "navigate",
      url: primaryAction.actionUrl,
      variant: "default",
    });
  }

  // Always include mark as read button
  buttons.push({
    label: "Mark as Read",
    action: "markRead",
    variant: "outline",
  });

  // Always include dismiss button
  buttons.push({
    label: "Dismiss",
    action: "dismiss",
    variant: "ghost",
  });

  return buttons;
}
