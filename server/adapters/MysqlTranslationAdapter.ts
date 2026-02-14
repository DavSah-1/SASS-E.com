import * as db from "../db";
import { TranslationAdapter } from "./TranslationAdapter";

/**
 * MySQL implementation of TranslationAdapter
 * Delegates all operations to db.ts functions
 */
export class MysqlTranslationAdapter implements TranslationAdapter {
  async createTranslateConversation(userId: string, title: string) {
    return db.createTranslateConversation(userId, title);
  }

  async getConversationById(conversationId: number) {
    return db.getConversationById(conversationId);
  }

  async getConversationByCode(shareableCode: string) {
    return db.getConversationByCode(shareableCode);
  }

  async getUserTranslateConversations(userId: string) {
    return db.getUserTranslateConversations(userId);
  }

  async addConversationParticipant(conversationId: number, userId: string, language: string) {
    return db.addConversationParticipant(conversationId, userId, language);
  }

  async removeConversationParticipant(conversationId: number, userId: string) {
    return db.removeConversationParticipant(conversationId, userId);
  }

  async getConversationParticipants(conversationId: number) {
    return db.getConversationParticipants(conversationId);
  }

  async isUserParticipant(conversationId: number, userId: string) {
    return db.isUserParticipant(conversationId, userId);
  }

  async saveTranslateMessage(conversationId: number, userId: string, originalText: string, originalLanguage: string) {
    return db.saveTranslateMessage(conversationId, userId, originalText, originalLanguage);
  }

  async getTranslateConversationMessages(conversationId: number, limit: number = 50) {
    return db.getTranslateConversationMessages(conversationId, limit);
  }

  async saveMessageTranslation(messageId: number, userId: string, translatedText: string, targetLanguage: string) {
    return db.saveMessageTranslation(messageId, userId, translatedText, targetLanguage);
  }

  async getMessageTranslation(messageId: number, userId: string) {
    return db.getMessageTranslation(messageId, userId);
  }

  async getUserById(userId: number) {
    return db.getUserById(userId);
  }
}
