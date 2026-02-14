/**
 * MySQL Notification Adapter
 * 
 * Delegates all notification operations to the existing db.ts module.
 * Used when ctx.user.role === "admin".
 */

import * as db from '../db';
import { deleteAllUserNotifications } from '../db-deleteAll';
import type { NotificationAdapter } from './NotificationAdapter';

export class MysqlNotificationAdapter implements NotificationAdapter {
  
  async getUserNotifications(userId: number, includeRead = false) {
    return db.getUserNotifications(userId, includeRead);
  }
  
  async getUnreadNotificationCount(userId: number) {
    return db.getUnreadNotificationCount(userId);
  }
  
  async markNotificationAsRead(notificationId: number, userId: number) {
    return db.markNotificationAsRead(notificationId, userId);
  }
  
  async dismissNotification(notificationId: number, userId: number) {
    return db.dismissNotification(notificationId, userId);
  }
  
  async deleteAllUserNotifications(userId: number) {
    await deleteAllUserNotifications(userId);
  }
  
  async getNotificationPreferences(userId: number) {
    return db.getNotificationPreferences(userId);
  }
  
  async updateNotificationPreferences(userId: number, preferences: any) {
    return db.updateNotificationPreferences(userId, preferences);
  }
  
  async createFactUpdateNotifications(oldFact: any, newFact: any) {
    return db.createFactUpdateNotifications(oldFact, newFact);
  }
}
