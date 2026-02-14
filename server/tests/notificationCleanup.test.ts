import { describe, it, expect, beforeAll } from 'vitest';
import { dismissOldNotifications, getOldNotificationCount } from '../db-cleanup';
import { dismissOldSupabaseNotifications, getOldSupabaseNotificationCount } from '../dbRoleAware-cleanup';
import { runCleanupNow } from '../scheduledJobs';

describe('Notification Cleanup System', () => {
  it('should count old MySQL notifications', async () => {
    const count = await getOldNotificationCount(15);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should count old Supabase notifications', async () => {
    const count = await getOldSupabaseNotificationCount(15);
    expect(typeof count).toBe('number');
    expect(count).toBeGreaterThanOrEqual(0);
  });

  it('should dismiss old MySQL notifications', async () => {
    const result = await dismissOldNotifications(15);
    expect(result).toHaveProperty('dismissed');
    expect(typeof result.dismissed).toBe('number');
    expect(result.dismissed).toBeGreaterThanOrEqual(0);
  });

  it('should dismiss old Supabase notifications', async () => {
    const result = await dismissOldSupabaseNotifications(15);
    expect(result).toHaveProperty('dismissed');
    expect(typeof result.dismissed).toBe('number');
    expect(result.dismissed).toBeGreaterThanOrEqual(0);
  });

  it('should run cleanup job manually', async () => {
    const result = await runCleanupNow();
    expect(result).toHaveProperty('mysql');
    expect(result).toHaveProperty('supabase');
    expect(result).toHaveProperty('total');
    expect(typeof result.total).toBe('number');
    expect(result.total).toBeGreaterThanOrEqual(0);
  });

  it('should respect custom days parameter', async () => {
    // Test with 30 days instead of 15
    const count30 = await getOldNotificationCount(30);
    const count15 = await getOldNotificationCount(15);
    
    // 30-day count should be >= 15-day count (more time = more old notifications)
    expect(count30).toBeGreaterThanOrEqual(count15);
  });
});
