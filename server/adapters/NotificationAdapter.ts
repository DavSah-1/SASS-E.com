/**
 * NotificationAdapter Interface (Proof-of-Concept)
 * 
 * Demonstrates the adapter pattern for a single domain (notifications).
 * If successful, this pattern will be extended to all other domains.
 */

export interface NotificationAdapter {
  /**
   * Get user notifications with optional filtering
   */
  getUserNotifications(userId: number, includeRead?: boolean): Promise<any[]>;
  
  /**
   * Get count of unread notifications
   */
  getUnreadNotificationCount(userId: number): Promise<number>;
  
  /**
   * Mark a notification as read
   */
  markNotificationAsRead(notificationId: number, userId: number): Promise<boolean>;
  
  /**
   * Dismiss a notification (soft delete)
   */
  dismissNotification(notificationId: number, userId: number): Promise<boolean>;
  
  /**
   * Delete all notifications for a user
   */
  deleteAllUserNotifications(userId: number): Promise<void>;
  
  /**
   * Get notification preferences for a user
   */
  getNotificationPreferences(userId: number): Promise<any | null>;
  
  /**
   * Update notification preferences
   */
  updateNotificationPreferences(userId: number, preferences: any): Promise<boolean>;
  
  /**
   * Create notifications when a verified fact is updated
   * Returns the number of notifications created
   */
  createFactUpdateNotifications(oldFact: any, newFact: any): Promise<number | undefined>;
}
