import { getDb } from "./db";
import { factUpdateNotifications } from "../drizzle/schema";
import { lt, and, eq } from "drizzle-orm";
import { sql } from "drizzle-orm";

/**
 * Dismiss notifications older than the specified number of days
 * This helps prevent database bloat by cleaning up old notifications
 * 
 * @param daysOld - Number of days after which notifications should be dismissed (default: 15)
 * @returns Object with count of dismissed notifications
 */
export async function dismissOldNotifications(daysOld: number = 15): Promise<{ dismissed: number }> {
  const db = await getDb();
  if (!db) {
    console.warn("[Cleanup] Cannot dismiss old notifications: database not available");
    return { dismissed: 0 };
  }

  try {
    // Calculate the cutoff date (15 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    // Update notifications older than cutoff date to dismissed
    const result = await db
      .update(factUpdateNotifications)
      .set({ 
        isDismissed: 1
      })
      .where(
        and(
          lt(factUpdateNotifications.createdAt, cutoffDate),
          eq(factUpdateNotifications.isDismissed, 0)
        )
      );

    const dismissedCount = result[0]?.affectedRows || 0;
    
    if (dismissedCount > 0) {
      console.log(`[Cleanup] Dismissed ${dismissedCount} notifications older than ${daysOld} days`);
    }

    return { dismissed: dismissedCount };
  } catch (error) {
    console.error("[Cleanup] Error dismissing old notifications:", error);
    throw error;
  }
}

/**
 * Get count of notifications that would be dismissed
 * Useful for testing and monitoring
 */
export async function getOldNotificationCount(daysOld: number = 15): Promise<number> {
  const db = await getDb();
  if (!db) {
    return 0;
  }

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(factUpdateNotifications)
      .where(
        and(
          lt(factUpdateNotifications.createdAt, cutoffDate),
          eq(factUpdateNotifications.isDismissed, 0)
        )
      );

    return result[0]?.count || 0;
  } catch (error) {
    console.error("[Cleanup] Error counting old notifications:", error);
    return 0;
  }
}
