/**
 * TranslationAdapter Interface
 * 
 * Defines all translation chat-related database operations.
 * Implementations handle routing to MySQL (admin) or Supabase (user) databases.
 */

export interface TranslationAdapter {
  /**
   * Conversation Management
   */
  createTranslateConversation(userId: string, title: string): Promise<{ conversationId: number; shareableCode: string }>;
  getConversationById(conversationId: number): Promise<any | null>;
  getConversationByCode(shareableCode: string): Promise<any | null>;
  getUserTranslateConversations(userId: string): Promise<any[]>;

  /**
   * Conversation Participants
   */
  addConversationParticipant(conversationId: number, userId: string, language: string): Promise<number>;
  removeConversationParticipant(conversationId: number, userId: string): Promise<boolean>;
  getConversationParticipants(conversationId: number): Promise<any[]>;
  isUserParticipant(conversationId: number, userId: string): Promise<boolean>;

  /**
   * Messages
   */
  saveTranslateMessage(conversationId: number, userId: string, originalText: string, originalLanguage: string): Promise<number>;
  getTranslateConversationMessages(conversationId: number, limit?: number): Promise<any[]>;

  /**
   * Message Translations
   */
  saveMessageTranslation(messageId: number, userId: string, translatedText: string, targetLanguage: string): Promise<number>;
  getMessageTranslation(messageId: number, userId: string): Promise<any | null>;

  /**
   * User Management
   */
  getUserById(userId: number): Promise<any | null>;

  /**
   * Conversation Sessions (for practice conversations)
   */
  createConversationSession(userId: number, title: string, language1: string, language2: string): Promise<any>;
  getUserConversationSessions(userId: number): Promise<any[]>;
  getConversationSession(sessionId: number, userId: number): Promise<any | null>;
  deleteConversationSession(sessionId: number, userId: number): Promise<boolean>;
  addConversationMessage(sessionId: number, messageText: string, translatedText: string, language: string, sender: 'user' | 'practice'): Promise<any>;
  getConversationMessages(sessionId: number): Promise<any[]>;
  saveConversationSessionToPhrasebook(sessionId: number, userId: number, categoryId?: number): Promise<void>;
  deleteTranslateConversation(conversationId: number, userId: number): Promise<boolean>;

  /**
   * Saved Translations (phrasebook)
   */
  saveTranslation(translation: any): Promise<number | null>;
  getSavedTranslations(userId: number, categoryId?: number): Promise<any[]>;
  getFrequentTranslations(userId: number): Promise<any[]>;
  deleteSavedTranslation(translationId: number, userId: number): Promise<boolean>;
  updateTranslationCategory(translationId: number, userId: number, categoryId: number | null): Promise<boolean>;

  /**
   * Translation Categories
   */
  createTranslationCategory(category: any): Promise<any | null>;
  getTranslationCategories(userId: number): Promise<any[]>;
  deleteTranslationCategory(categoryId: number, userId: number): Promise<boolean>;

  /**
   * Translation Search
   */
  searchSavedTranslations(userId: number, searchTerm: string): Promise<any[]>;
  getTranslationsByLanguage(userId: number, sourceLanguage: string, targetLanguage: string): Promise<any[]>;
}
