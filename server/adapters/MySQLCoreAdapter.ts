import * as db from '../db';
import { CoreAdapter } from './CoreAdapter';

/**
 * MySQL implementation of CoreAdapter for admin users
 * Delegates directly to db.ts functions
 */
export class MySQLCoreAdapter implements CoreAdapter {
  constructor(private userId: number) {}

  async updateUserLanguage(userId: number, language: string): Promise<any> {
    return await db.updateUserLanguage(userId, language);
  }

  async updateUserHubSelection(userId: number, hubs: string[]): Promise<any> {
    return await db.updateUserHubSelection(userId, hubs);
  }

  async updateUserStaySignedIn(userId: number, staySignedIn: boolean): Promise<any> {
    return await db.updateUserStaySignedIn(userId, staySignedIn);
  }

  async getUserById(userId: number): Promise<any> {
    return await db.getUserById(userId);
  }

  async getUserProfile(userId: number): Promise<any | undefined> {
    return await db.getUserProfile(userId);
  }

  async createUserProfile(profile: any): Promise<any> {
    return await db.createUserProfile(profile);
  }

  async updateUserProfile(userId: number, updates: any): Promise<any> {
    return await db.updateUserProfile(userId, updates);
  }

  async saveConversation(conversation: any): Promise<any> {
    return await db.saveConversation(conversation);
  }

  async getUserConversations(userId: number, limit?: number): Promise<any[]> {
    return await db.getUserConversations(userId, limit);
  }

  async deleteAllUserConversations(userId: number): Promise<void> {
    return await db.deleteAllUserConversations(userId);
  }

  async saveConversationFeedback(feedback: any): Promise<any> {
    return await db.saveConversationFeedback(feedback);
  }

  async getConversationFeedback(conversationId: number): Promise<any[]> {
    return await db.getConversationFeedback(conversationId);
  }
}
