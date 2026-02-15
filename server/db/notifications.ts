import { and, desc, eq, count } from "drizzle-orm";
import {
  InsertFactUpdateNotification,
  VerifiedFact,
  factAccessLog,
  factUpdateNotifications,
  notificationPreferences,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";
import { shouldBatch, generateBatchKey, generateBatchedTitle, generateBatchedMessage } from '../notificationBatching';
import { getNotificationAction } from '../notificationActions';



// ============================================================================
// Fact Access Tracking & Notification Functions
// ============================================================================

/**
 * Log when a user accesses a verified fact
 */
export async function logFactAccess(userId: number, verifiedFactId: number, fact: VerifiedFact, source: 'voice_assistant' | 'learning_hub') {
  const db = await getDb();
  if (!db) return;
  
  // Create a snapshot of the fact for version tracking
  const factVersion = JSON.stringify({
    answer: fact.answer,
    confidenceScore: fact.confidenceScore,
    sources: fact.sources,
    verifiedAt: fact.verifiedAt
  });
  
  await db.insert(factAccessLog).values({
    userId,
    verifiedFactId,
    factVersion,
    accessSource: source,
  });
}


export async function createFactUpdateNotifications(oldFact: VerifiedFact, newFact: VerifiedFact) {
  const db = await getDb();
  if (!db) return;
  
  // Find all users who accessed the old version
  const accessLogs = await db
    .select()
    .from(factAccessLog)
    .where(eq(factAccessLog.verifiedFactId, oldFact.id));
  
  // Get unique user IDs
  const userIds = Array.from(new Set(accessLogs.map(log => log.userId)));
  
  const oldVersion = JSON.stringify({
    answer: oldFact.answer,
    confidenceScore: oldFact.confidenceScore,
    sources: oldFact.sources,
    verifiedAt: oldFact.verifiedAt
  });
  
  const newVersion = JSON.stringify({
    answer: newFact.answer,
    confidenceScore: newFact.confidenceScore,
    sources: newFact.sources,
    verifiedAt: newFact.verifiedAt
  });
  
  const notificationType = 'fact_update';
  const now = new Date();
  
  // Check if batching is enabled for this notification type
  if (shouldBatch(notificationType)) {
    const batchKey = generateBatchKey(notificationType, now);
    
    // Process each user's notification with batching
    for (const userId of userIds) {
      // Check if a batch notification already exists for this user
      const existingBatch = await db
        .select()
        .from(factUpdateNotifications)
        .where(
          and(
            eq(factUpdateNotifications.userId, userId),
            eq(factUpdateNotifications.batchKey, batchKey),
            eq(factUpdateNotifications.isDismissed, 0)
          )
        )
        .limit(1);
      
      if (existingBatch.length > 0) {
        // Update existing batch: increment count
        const currentCount = existingBatch[0].batchCount || 1;
        const newCount = currentCount + 1;
        
        await db
          .update(factUpdateNotifications)
          .set({
            batchCount: newCount,
            title: generateBatchedTitle(notificationType, newCount),
            message: generateBatchedMessage(notificationType, newCount),
          })
          .where(eq(factUpdateNotifications.id, existingBatch[0].id));
      } else {
        // Create new batch notification
        const action = getNotificationAction('fact_update', { factId: oldFact.id });
        await db.insert(factUpdateNotifications).values({
          userId,
          verifiedFactId: oldFact.id,
          oldVersion,
          newVersion,
          notificationType,
          batchKey,
          batchCount: 1,
          title: 'Fact Update Available',
          message: `The answer to "${oldFact.question}" has been updated with new information.`,
          actionUrl: action.actionUrl,
          actionType: action.actionType,
          actionLabel: action.actionLabel,
        });
      }
    }
  } else {
    // No batching: create individual notifications
    const action = getNotificationAction('fact_update', { factId: oldFact.id });
    const notifications: InsertFactUpdateNotification[] = userIds.map(userId => ({
      userId,
      verifiedFactId: oldFact.id,
      oldVersion,
      newVersion,
      notificationType,
      title: 'Fact Update Available',
      message: `The answer to "${oldFact.question}" has been updated with new information.`,
      actionUrl: action.actionUrl,
      actionType: action.actionType,
      actionLabel: action.actionLabel,
    }));
    
    if (notifications.length > 0) {
      await db.insert(factUpdateNotifications).values(notifications);
    }
  }
  
  return userIds.length;
}


/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(userId: number, includeRead: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(factUpdateNotifications.userId, userId),
    eq(factUpdateNotifications.isDismissed, 0)
  ];
  
  if (!includeRead) {
    conditions.push(eq(factUpdateNotifications.isRead, 0));
  }
  
  const notifications = await db
    .select()
    .from(factUpdateNotifications)
    .where(and(...conditions))
    .orderBy(desc(factUpdateNotifications.createdAt))
    .limit(50);
  
  return notifications;
}


/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(factUpdateNotifications)
    .set({
      isRead: 1,
      readAt: new Date()
    })
    .where(
      and(
        eq(factUpdateNotifications.id, notificationId),
        eq(factUpdateNotifications.userId, userId)
      )
    );
  
  return true;
}


/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(factUpdateNotifications)
    .set({
      isDismissed: 1,
      dismissedAt: new Date()
    })
    .where(
      and(
        eq(factUpdateNotifications.id, notificationId),
        eq(factUpdateNotifications.userId, userId)
      )
    );
  
  return true;
}


/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const notifications = await db
    .select()
    .from(factUpdateNotifications)
    .where(
      and(
        eq(factUpdateNotifications.userId, userId),
        eq(factUpdateNotifications.isRead, 0),
        eq(factUpdateNotifications.isDismissed, 0)
      )
    );
  
  return notifications.length;
}


/**
 * Get user's notification preferences
 */
export async function getNotificationPreferences(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const prefs = await db
    .select()
    .from(notificationPreferences)
    .where(eq(notificationPreferences.userId, userId))
    .limit(1);
  
  return prefs.length > 0 ? prefs[0] : null;
}


/**
 * Update user's notification preferences (creates if doesn't exist)
 */
export async function updateNotificationPreferences(userId: number, preferences: any) {
  const db = await getDb();
  if (!db) return false;
  
  const existing = await getNotificationPreferences(userId);
  
  if (existing) {
    // Update existing preferences
    await db
      .update(notificationPreferences)
      .set({
        ...preferences,
        updatedAt: new Date()
      })
      .where(eq(notificationPreferences.userId, userId));
  } else {
    // Create new preferences
    await db
      .insert(notificationPreferences)
      .values({
        userId,
        ...preferences
      });
  }
  
  return true;
}
