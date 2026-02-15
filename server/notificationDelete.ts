import { getSupabaseClient } from "./supabaseClient";

/**
 * Delete all notifications for a specific Supabase user
 * @param userId - The Supabase user ID whose notifications should be deleted
 * @param accessToken - User's access token for RLS enforcement
 * @returns Number of notifications deleted
 */
export async function deleteAllSupabaseUserNotifications(
  userId: string,
  accessToken?: string
): Promise<number> {
  try {
    const supabase = await getSupabaseClient(userId, accessToken);
    
    // First count how many will be deleted
    const { count: countBefore } = await supabase
      .from('fact_update_notifications')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId);
    
    // Delete all notifications for this user
    const { error } = await supabase
      .from('fact_update_notifications')
      .delete()
      .eq('user_id', userId);

    if (error) {
      console.error("[Delete All] Error deleting Supabase user notifications:", error);
      throw error;
    }

    const deletedCount = countBefore || 0;
    
    if (deletedCount > 0) {
      console.log(`[Delete All] Deleted ${deletedCount} Supabase notifications for user ${userId}`);
    }

    return deletedCount;
  } catch (error) {
    console.error("[Delete All] Error deleting Supabase user notifications:", error);
    throw error;
  }
}
