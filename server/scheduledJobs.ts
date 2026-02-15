import cron from 'node-cron';
import { dismissOldNotifications, getOldNotificationCount } from './db-cleanup';
import { dismissOldSupabaseNotifications, getOldSupabaseNotificationCount } from './notificationCleanup';

/**
 * Scheduled job to clean up old notifications
 * Runs daily at 2:00 AM to dismiss notifications older than 15 days
 * Handles both MySQL (admin) and Supabase (user) databases
 */
export function startNotificationCleanupJob() {
  // Run daily at 2:00 AM
  // Cron format: second minute hour day month weekday
  // '0 2 * * *' = At 02:00 every day
  const cleanupJob = cron.schedule('0 2 * * *', async () => {
    console.log('[Scheduled Job] Starting notification cleanup...');
    
    try {
      // Check how many notifications will be dismissed
      const mysqlCount = await getOldNotificationCount(15);
      const supabaseCount = await getOldSupabaseNotificationCount(15);
      
      console.log(`[Scheduled Job] Found ${mysqlCount} old MySQL notifications and ${supabaseCount} old Supabase notifications to dismiss`);
      
      // Dismiss old notifications in MySQL (admin database)
      const mysqlResult = await dismissOldNotifications(15);
      console.log(`[Scheduled Job] MySQL: Dismissed ${mysqlResult.dismissed} notifications`);
      
      // Dismiss old notifications in Supabase (user database)
      const supabaseResult = await dismissOldSupabaseNotifications(15);
      console.log(`[Scheduled Job] Supabase: Dismissed ${supabaseResult.dismissed} notifications`);
      
      const totalDismissed = mysqlResult.dismissed + supabaseResult.dismissed;
      console.log(`[Scheduled Job] Cleanup complete: ${totalDismissed} total notifications dismissed`);
    } catch (error) {
      console.error('[Scheduled Job] Error during notification cleanup:', error);
    }
  }, {
    timezone: "UTC"
  });

  console.log('[Scheduled Job] Notification cleanup job started (runs daily at 2:00 AM UTC)');
  
  return cleanupJob;
}

/**
 * Run cleanup job immediately (for testing)
 */
export async function runCleanupNow() {
  console.log('[Manual Cleanup] Running notification cleanup now...');
  
  try {
    const mysqlCount = await getOldNotificationCount(15);
    const supabaseCount = await getOldSupabaseNotificationCount(15);
    
    console.log(`[Manual Cleanup] Found ${mysqlCount} old MySQL notifications and ${supabaseCount} old Supabase notifications`);
    
    const mysqlResult = await dismissOldNotifications(15);
    const supabaseResult = await dismissOldSupabaseNotifications(15);
    
    const totalDismissed = mysqlResult.dismissed + supabaseResult.dismissed;
    console.log(`[Manual Cleanup] Dismissed ${totalDismissed} total notifications`);
    
    return {
      mysql: mysqlResult.dismissed,
      supabase: supabaseResult.dismissed,
      total: totalDismissed
    };
  } catch (error) {
    console.error('[Manual Cleanup] Error:', error);
    throw error;
  }
}
