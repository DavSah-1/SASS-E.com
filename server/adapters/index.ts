/**
 * Adapter Factory
 * 
 * Creates the appropriate adapter instance based on user role.
 * This is the single point where routing decisions are made.
 */

import { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
import { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
import type { NotificationAdapter } from './NotificationAdapter';

export interface AdapterContext {
  user: {
    id: string | number;
    numericId?: number;
    role: 'admin' | 'user';
  };
  accessToken?: string;
}

/**
 * Create notification adapter based on user role
 */
export function createNotificationAdapter(ctx: AdapterContext): NotificationAdapter {
  if (ctx.user.role === 'admin') {
    return new MysqlNotificationAdapter();
  } else {
    const userId = ctx.user.numericId || Number(ctx.user.id);
    const accessToken = ctx.accessToken || '';
    return new SupabaseNotificationAdapter(userId, accessToken);
  }
}

// Export adapters and interfaces
export type { NotificationAdapter } from './NotificationAdapter';
export { MysqlNotificationAdapter } from './MysqlNotificationAdapter';
export { SupabaseNotificationAdapter } from './SupabaseNotificationAdapter';
