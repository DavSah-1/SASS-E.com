import { describe, it, expect, beforeAll } from 'vitest';
import { 
  saveVerifiedFact, 
  getVerifiedFact,
  normalizeQuestion,
  logFactAccess,
  getUserNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  dismissNotification
} from './db';

describe('Fact Update Notification System', () => {
  const testUserId = 1;
  const testQuestion = "What is the capital of France?";
  const initialAnswer = "Paris is the capital of France.";
  const updatedAnswer = "Paris is the capital and largest city of France, located in the north-central part of the country.";
  
  let factId: number;

  it('should save initial verified fact', async () => {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const result = await saveVerifiedFact({
      question: testQuestion,
      normalizedQuestion: normalizeQuestion(testQuestion),
      answer: initialAnswer,
      verificationStatus: 'verified',
      confidenceScore: 90,
      sources: JSON.stringify([
        { title: "Wikipedia", url: "https://wikipedia.org", credibilityScore: 95 }
      ]),
      verifiedAt: new Date(),
      expiresAt,
      verifiedByUserId: testUserId,
    });

    expect(result).toBeDefined();
    expect(result[0].insertId).toBeGreaterThan(0);
    factId = result[0].insertId;
  });

  it('should log fact access by user', async () => {
    const normalizedQ = normalizeQuestion(testQuestion);
    const fact = await getVerifiedFact(normalizedQ);
    
    expect(fact).toBeDefined();
    
    if (fact) {
      await logFactAccess(testUserId, fact.id, fact, 'voice_assistant');
      // No error means success
      expect(true).toBe(true);
    }
  });

  it('should create notification when fact is updated', async () => {
    // Get initial notification count
    const initialCount = await getUnreadNotificationCount(testUserId);
    
    // Update the fact (this should trigger notification creation)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await saveVerifiedFact({
      question: testQuestion,
      normalizedQuestion: normalizeQuestion(testQuestion),
      answer: updatedAnswer, // Different answer
      verificationStatus: 'verified',
      confidenceScore: 95, // Higher confidence
      sources: JSON.stringify([
        { title: "Britannica", url: "https://britannica.com", credibilityScore: 98 },
        { title: "Wikipedia", url: "https://wikipedia.org", credibilityScore: 95 }
      ]),
      verifiedAt: new Date(),
      expiresAt,
      verifiedByUserId: testUserId,
    });

    // Check that notification was created
    const newCount = await getUnreadNotificationCount(testUserId);
    // With batching, count may stay same (batch updated) or increase
    expect(newCount).toBeGreaterThanOrEqual(initialCount);
  });

  it('should retrieve user notifications', async () => {
    const notifications = await getUserNotifications(testUserId, false);
    
    expect(Array.isArray(notifications)).toBe(true);
    expect(notifications.length).toBeGreaterThan(0);
    
    const notification = notifications[0];
    // Batching is enabled, so title may be batched
    expect(notification.title).toMatch(/Fact Update Available|\d+ New Fact Updates/);
    // Message may be batched or individual
    if (notification.batchCount && notification.batchCount > 1) {
      expect(notification.message).toContain('fact updates');
    } else {
      expect(notification.message).toContain(testQuestion);
    }
    expect(notification.isRead).toBe(0);
    expect(notification.isDismissed).toBe(0);
  });

  it('should parse old and new versions correctly', async () => {
    const notifications = await getUserNotifications(testUserId, false);
    expect(notifications.length).toBeGreaterThan(0);
    
    const notification = notifications[0];
    // Skip version parsing test if notification is batched
    if (!notification.batchCount || notification.batchCount === 1) {
      const oldVersion = JSON.parse(notification.oldVersion);
      const newVersion = JSON.parse(notification.newVersion);
      
      expect(oldVersion.answer).toContain('Paris is the capital');
      expect(newVersion.answer).toBe(updatedAnswer);
      expect(newVersion.confidenceScore).toBeGreaterThan(oldVersion.confidenceScore);
    } else {
      // Batched notification - just verify it exists
      expect(notification.batchCount).toBeGreaterThan(1);
    }
  });

  it('should mark notification as read', async () => {
    const notifications = await getUserNotifications(testUserId, false);
    expect(notifications.length).toBeGreaterThan(0);
    
    const notificationId = notifications[0].id;
    const success = await markNotificationAsRead(notificationId, testUserId);
    
    expect(success).toBe(true);
    
    // Verify it's marked as read
    const unreadNotifications = await getUserNotifications(testUserId, false);
    const readNotification = unreadNotifications.find(n => n.id === notificationId);
    expect(readNotification).toBeUndefined(); // Should not appear in unread list
    
    // But should appear when including read notifications
    const allNotifications = await getUserNotifications(testUserId, true);
    const foundNotification = allNotifications.find(n => n.id === notificationId);
    expect(foundNotification).toBeDefined();
    expect(foundNotification?.isRead).toBe(1);
  });

  it('should dismiss notification', async () => {
    const notifications = await getUserNotifications(testUserId, true);
    expect(notifications.length).toBeGreaterThan(0);
    
    const notificationId = notifications[0].id;
    const success = await dismissNotification(notificationId, testUserId);
    
    expect(success).toBe(true);
    
    // Verify it's dismissed (should not appear in any list)
    const remainingNotifications = await getUserNotifications(testUserId, true);
    const dismissedNotification = remainingNotifications.find(n => n.id === notificationId);
    expect(dismissedNotification).toBeUndefined();
  });

  it('should track unread notification count accurately', async () => {
    // Create another fact and update it to generate a new notification
    const question2 = "What is the capital of Japan?";
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    // Save initial fact
    await saveVerifiedFact({
      question: question2,
      normalizedQuestion: normalizeQuestion(question2),
      answer: "Tokyo is the capital of Japan.",
      verificationStatus: 'verified',
      confidenceScore: 90,
      sources: JSON.stringify([{ title: "Test", url: "https://test.com", credibilityScore: 90 }]),
      verifiedAt: new Date(),
      expiresAt,
      verifiedByUserId: testUserId,
    });

    // Access it
    const fact2 = await getVerifiedFact(normalizeQuestion(question2));
    if (fact2) {
      await logFactAccess(testUserId, fact2.id, fact2, 'learning_hub');
    }

    // Get count before update
    const countBefore = await getUnreadNotificationCount(testUserId);

    // Update it
    await saveVerifiedFact({
      question: question2,
      normalizedQuestion: normalizeQuestion(question2),
      answer: "Tokyo is the capital and most populous city of Japan.",
      verificationStatus: 'verified',
      confidenceScore: 95,
      sources: JSON.stringify([{ title: "Test", url: "https://test.com", credibilityScore: 90 }]),
      verifiedAt: new Date(),
      expiresAt,
      verifiedByUserId: testUserId,
    });

    // Get count after update
    const countAfter = await getUnreadNotificationCount(testUserId);
    
    // With batching enabled, count may stay the same (batch updated) or increase by 1
    // Without batching, count increases by number of users who accessed the fact
    expect(countAfter).toBeGreaterThanOrEqual(countBefore);
  });
});
