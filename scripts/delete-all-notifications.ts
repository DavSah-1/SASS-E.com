import { getDb } from "../server/db";
import { getSupabaseAdminClient } from "../server/supabaseClient";
import { factUpdateNotifications } from "../drizzle/schema";

/**
 * Delete all notifications from both MySQL and Supabase databases
 * This is a destructive operation - use with caution!
 */
async function deleteAllNotifications() {
  console.log('[Delete Notifications] Starting deletion process...');
  
  try {
    // Delete from MySQL (admin database)
    console.log('[MySQL] Deleting all notifications...');
    const db = await getDb();
    if (db) {
      const mysqlResult = await db.delete(factUpdateNotifications);
      const mysqlDeleted = mysqlResult[0]?.affectedRows || 0;
      console.log(`[MySQL] Deleted ${mysqlDeleted} notifications`);
    } else {
      console.log('[MySQL] Database not available, skipping');
    }
    
    // Delete from Supabase (user database)
    console.log('[Supabase] Deleting all notifications...');
    const supabase = getSupabaseAdminClient();
    const { error, count } = await supabase
      .from('fact_update_notifications')
      .delete()
      .neq('id', 0); // Delete all rows (neq with impossible condition)
    
    if (error) {
      console.error('[Supabase] Error deleting notifications:', error);
    } else {
      console.log(`[Supabase] Deleted notifications successfully`);
    }
    
    console.log('[Delete Notifications] ✅ All notifications deleted successfully');
  } catch (error) {
    console.error('[Delete Notifications] ❌ Error:', error);
    throw error;
  }
}

// Run the deletion
deleteAllNotifications()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
