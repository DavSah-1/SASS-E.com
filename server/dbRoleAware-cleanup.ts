import { getSupabaseAdminClient } from "./supabaseClient";

/**
 * Dismiss Supabase notifications older than the specified number of days
 * This helps prevent database bloat by cleaning up old notifications
 * 
 * @param daysOld - Number of days after which notifications should be dismissed (default: 15)
 * @returns Object with count of dismissed notifications
 */
export async function dismissOldSupabaseNotifications(daysOld: number = 15): Promise<{ dismissed: number }> {
  try {
    const supabase = getSupabaseAdminClient();
    
    // Calculate the cutoff date (15 days ago)
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    // First count how many will be dismissed
    const { count: countBefore } = await supabase
      .from('fact_update_notifications')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffISO)
      .eq('is_dismissed', 0);
    
    // Update notifications older than cutoff date to dismissed
    const { error } = await supabase
      .from('fact_update_notifications')
      .update({ is_dismissed: 1 })
      .lt('created_at', cutoffISO)
      .eq('is_dismissed', 0);

    if (error) {
      console.error("[Cleanup] Error dismissing old Supabase notifications:", error);
      throw error;
    }

    const dismissedCount = countBefore || 0;
    
    if (dismissedCount > 0) {
      console.log(`[Cleanup] Dismissed ${dismissedCount} Supabase notifications older than ${daysOld} days`);
    }

    return { dismissed: dismissedCount };
  } catch (error) {
    console.error("[Cleanup] Error dismissing old Supabase notifications:", error);
    throw error;
  }
}

/**
 * Get count of Supabase notifications that would be dismissed
 * Useful for testing and monitoring
 */
export async function getOldSupabaseNotificationCount(daysOld: number = 15): Promise<number> {
  try {
    const supabase = getSupabaseAdminClient();
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);
    const cutoffISO = cutoffDate.toISOString();

    const { count, error } = await supabase
      .from('fact_update_notifications')
      .select('id', { count: 'exact', head: true })
      .lt('created_at', cutoffISO)
      .eq('is_dismissed', 0);

    if (error) {
      console.error("[Cleanup] Error counting old Supabase notifications:", error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error("[Cleanup] Error counting old Supabase notifications:", error);
    return 0;
  }
}
