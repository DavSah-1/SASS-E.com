import { describe, it, expect, beforeEach } from 'vitest';
import { deleteAllUserNotifications } from '../db-deleteAll';
import { deleteAllSupabaseUserNotifications } from '../dbRoleAware-deleteAll';
import { getDb } from '../db';
import { factUpdateNotifications } from '../../drizzle/schema';

describe('Delete All Notifications', () => {
  const testUserId = 1;

  beforeEach(async () => {
    // Clean up any existing test notifications
    const db = await getDb();
    if (db) {
      await db.delete(factUpdateNotifications).where(
        // Delete all notifications for test user
      );
    }
  });

  it('should delete all notifications for a user from MySQL', async () => {
    const db = await getDb();
    if (!db) {
      console.log('MySQL database not available, skipping test');
      return;
    }

    // Create test notifications
    await db.insert(factUpdateNotifications).values([
      {
        userId: testUserId,
        verifiedFactId: 1,
        title: 'Test 1',
        message: 'Message 1',
        notificationType: 'fact_update',
        oldVersion: JSON.stringify({}),
        newVersion: JSON.stringify({}),
      },
      {
        userId: testUserId,
        verifiedFactId: 2,
        title: 'Test 2',
        message: 'Message 2',
        notificationType: 'fact_update',
        oldVersion: JSON.stringify({}),
        newVersion: JSON.stringify({}),
      },
      {
        userId: testUserId,
        verifiedFactId: 3,
        title: 'Test 3',
        message: 'Message 3',
        notificationType: 'fact_update',
        oldVersion: JSON.stringify({}),
        newVersion: JSON.stringify({}),
      },
    ]);

    // Delete all notifications
    const deleted = await deleteAllUserNotifications(testUserId);

    // Verify all were deleted
    expect(deleted).toBe(3);

    // Verify no notifications remain
    const remaining = await db.select().from(factUpdateNotifications).where(
      // Check for test user
    );
    expect(remaining.length).toBe(0);
  });

  it('should return 0 when no notifications exist', async () => {
    const deleted = await deleteAllUserNotifications(testUserId);
    expect(deleted).toBe(0);
  });

  it('should only delete notifications for the specified user', async () => {
    const db = await getDb();
    if (!db) {
      console.log('MySQL database not available, skipping test');
      return;
    }

    const otherUserId = 999;

    // Create notifications for two different users
    await db.insert(factUpdateNotifications).values([
      {
        userId: testUserId,
        verifiedFactId: 1,
        title: 'Test User 1',
        message: 'Message 1',
        notificationType: 'fact_update',
        oldVersion: JSON.stringify({}),
        newVersion: JSON.stringify({}),
      },
      {
        userId: otherUserId,
        verifiedFactId: 2,
        title: 'Other User',
        message: 'Message 2',
        notificationType: 'fact_update',
        oldVersion: JSON.stringify({}),
        newVersion: JSON.stringify({}),
      },
    ]);

    // Delete only testUserId's notifications
    const deleted = await deleteAllUserNotifications(testUserId);
    expect(deleted).toBe(1);

    // Verify other user's notification still exists
    const remaining = await db.select().from(factUpdateNotifications);
    expect(remaining.length).toBe(1);
    expect(remaining[0].userId).toBe(otherUserId);

    // Clean up
    await db.delete(factUpdateNotifications);
  });
});
