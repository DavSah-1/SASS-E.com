/**
 * Supabase Notification Adapter
 * 
 * Implements notification operations using Supabase client with RLS.
 * Used when ctx.user.role !== "admin".
 * 
 * Extracted from dbRoleAware.ts to demonstrate the adapter pattern.
 */

import { getSupabaseClient } from '../supabaseClient';
import { deleteAllSupabaseUserNotifications } from '../dbRoleAware-deleteAll';

/**
 * Helper function to handle Supabase errors consistently
 */
function handleSupabaseError(error: any, operation: string): never {  console.error(`[Supabase Error] ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation} - ${error.message || error.code}`);
}
import type { NotificationAdapter } from './NotificationAdapter';

export class SupabaseNotificationAdapter implements NotificationAdapter {
  private userId: string;
  private accessToken: string;
  
  constructor(userId: number, accessToken: string) {
    this.userId = String(userId);
    this.accessToken = accessToken;
  }
  
  async getUserNotifications(userId: number, includeRead = false) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', this.userId);
    
    if (!includeRead) {
      query = query.eq('is_read', 0); // Supabase uses integer 0/1 for boolean
    }
    
    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) handleSupabaseError(error, 'getUserNotifications');
    return data || [];
  }
  
  async getUnreadNotificationCount(userId: number) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', this.userId)
      .eq('is_read', 0)
      .eq('is_dismissed', 0);
    
    if (error) handleSupabaseError(error, 'getUnreadNotificationCount');
    return count || 0;
  }
  
  async markNotificationAsRead(notificationId: number, userId: number) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: 1 })
      .eq('id', notificationId)
      .eq('user_id', this.userId);
    
    if (error) {
      handleSupabaseError(error, 'markNotificationAsRead');
      return false;
    }
    return true;
  }
  
  async dismissNotification(notificationId: number, userId: number) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { error } = await supabase
      .from('notifications')
      .update({ is_dismissed: 1 })
      .eq('id', notificationId)
      .eq('user_id', this.userId);
    
    if (error) {
      handleSupabaseError(error, 'dismissNotification');
      return false;
    }
    return true;
  }
  
  async deleteAllUserNotifications(userId: number) {
    await deleteAllSupabaseUserNotifications(this.userId, this.accessToken);
  }
  
  async getNotificationPreferences(userId: number) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { data, error } = await supabase
      .from('notification_preferences')
      .select('*')
      .eq('user_id', this.userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return null; // No preferences found
      handleSupabaseError(error, 'getNotificationPreferences');
      return null;
    }
    return data;
  }
  
  async updateNotificationPreferences(userId: number, preferences: any) {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { error } = await supabase
      .from('notification_preferences')
      .upsert({
        user_id: this.userId,
        ...preferences
      });
    
    if (error) {
      handleSupabaseError(error, 'updateNotificationPreferences');
      return false;
    }
    return true;
  }
  
  async createFactUpdateNotifications(oldFact: any, newFact: any): Promise<number | undefined> {
    // This operation is typically only done by admins
    // For now, throw an error if a regular user tries to call this
    throw new Error('createFactUpdateNotifications is not available for regular users');
  }
}
