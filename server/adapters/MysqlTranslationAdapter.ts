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

  async createConversationSession(userId: number, title: string, language1: string, language2: string) {
    return db.createConversationSession(userId, title, language1, language2);
  }

  async getUserConversationSessions(userId: number) {
    return db.getUserConversationSessions(userId);
  }

  async getConversationSession(sessionId: number, userId: number) {
    return db.getConversationSession(sessionId, userId);
  }

  async deleteConversationSession(sessionId: number, userId: number) {
    return db.deleteConversationSession(sessionId, userId);
  }

  async addConversationMessage(sessionId: number, messageText: string, translatedText: string, language: string, sender: 'user' | 'practice') {
    return db.addConversationMessage(sessionId, messageText, translatedText, language, sender);
  }

  async getConversationMessages(sessionId: number) {
    return db.getConversationMessages(sessionId);
  }

  async saveConversationSessionToPhrasebook(sessionId: number, userId: number, categoryId?: number): Promise<void> {
    await db.saveConversationSessionToPhrasebook(sessionId, userId, categoryId);
  }

  async deleteTranslateConversation(conversationId: number, userId: number) {
    return db.deleteTranslateConversation(conversationId, userId);
  }

  // Saved Translations (phrasebook)
  async saveTranslation(translation: any) {
    const result = await db.saveTranslation(translation);
    return result?.id || null;
  }

  async getSavedTranslations(userId: number, categoryId?: number) {
    return db.getSavedTranslations(userId, categoryId);
  }

  async getFrequentTranslations(userId: number) {
    return db.getFrequentTranslations(userId);
  }

  async deleteSavedTranslation(translationId: number, userId: number) {
    return db.deleteSavedTranslation(translationId, userId);
  }

  async updateTranslationCategory(translationId: number, userId: number, categoryId: number | null) {
    return db.updateTranslationCategory(translationId, userId, categoryId);
  }

  // Translation Categories
  async createTranslationCategory(category: any) {
    return db.createTranslationCategory(category);
  }

  async getTranslationCategories(userId: number) {
    return db.getTranslationCategories(userId);
  }

  async deleteTranslationCategory(categoryId: number, userId: number) {
    return db.deleteTranslationCategory(categoryId, userId);
  }

  // Translation Search
  async searchSavedTranslations(userId: number, searchTerm: string) {
    return db.searchSavedTranslations(userId, searchTerm);
  }

  async getTranslationsByLanguage(userId: number, sourceLanguage: string, targetLanguage: string) {
    return db.getTranslationsByLanguage(userId, sourceLanguage, targetLanguage);
  }

  // Translation Favorites
  async toggleTranslationFavorite(translationId: number, userId: number) {
    return db.toggleTranslationFavorite(translationId, userId);
  }
}
