import { getDb } from "./db";
import { factUpdateNotifications } from "../drizzle/schema";
import { eq } from "drizzle-orm";

/**
 * Delete all notifications for a specific user
 * @param userId - The user ID whose notifications should be deleted
 * @returns Number of notifications deleted
 */
export async function deleteAllUserNotifications(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) {
    console.warn("[Delete All] Cannot delete notifications: database not available");
    return 0;
  }

  try {
    const result = await db
      .delete(factUpdateNotifications)
      .where(eq(factUpdateNotifications.userId, userId));

    const deletedCount = result[0]?.affectedRows || 0;
    
    if (deletedCount > 0) {
      console.log(`[Delete All] Deleted ${deletedCount} notifications for user ${userId}`);
    }

    return deletedCount;
  } catch (error) {
    console.error("[Delete All] Error deleting user notifications:", error);
    throw error;
  }
}
