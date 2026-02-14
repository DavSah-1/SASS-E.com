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
}
