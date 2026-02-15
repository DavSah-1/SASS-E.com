import { SupabaseClient } from '@supabase/supabase-js';
import { TranslationAdapter } from "./TranslationAdapter";
import { getSupabaseClient } from '../supabaseClient';

/**
 * Supabase implementation of TranslationAdapter
 * All operations are scoped to the current user via RLS
 */
export class SupabaseTranslationAdapter implements TranslationAdapter {
  private clientPromise: Promise<SupabaseClient> | null = null;

  constructor(
    private userId: string,
    private accessToken: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    if (!this.clientPromise) {
      this.clientPromise = getSupabaseClient(this.userId, this.accessToken);
    }
    return this.clientPromise;
  }

  async createTranslateConversation(userId: string, title: string) {
    const supabase = await this.getClient();
    
    // Generate shareable code (12 characters)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
    let shareableCode = '';
    for (let i = 0; i < 12; i++) {
      shareableCode += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    
    const { data, error } = await supabase
      .from('translate_conversations')
      .insert({
        creator_id: this.userId,
        title,
        shareable_code: shareableCode,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase createTranslateConversation error: ${error.message}`);
    
    return {
      conversationId: data.id,
      shareableCode: data.shareable_code,
    };
  }

  async getConversationById(conversationId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_conversations')
      .select('*')
      .eq('id', conversationId)
      .single();
    
    if (error) return null;
    if (!data) return null;
    
    return {
      id: data.id,
      creatorId: data.creator_id,
      title: data.title,
      shareableCode: data.shareable_code,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  }

  async getConversationByCode(shareableCode: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_conversations')
      .select('*')
      .eq('shareable_code', shareableCode)
      .single();
    
    if (error) return null;
    if (!data) return null;
    
    return {
      id: data.id,
      creatorId: data.creator_id,
      title: data.title,
      shareableCode: data.shareable_code,
      isActive: data.is_active,
      expiresAt: data.expires_at,
      createdAt: data.created_at,
    };
  }

  async getUserTranslateConversations(userId: string) {
    const supabase = await this.getClient();
    
    // Get conversations where user is a participant
    const { data: participantData, error: participantError } = await supabase
      .from('translate_conversation_participants')
      .select('conversation_id')
      .eq('user_id', this.userId);
    
    if (participantError) throw new Error(`Supabase getUserTranslateConversations error: ${participantError.message}`);
    
    if (!participantData || participantData.length === 0) return [];
    
    const conversationIds = participantData.map(p => p.conversation_id);
    
    const { data, error } = await supabase
      .from('translate_conversations')
      .select('*')
      .in('id', conversationIds)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getUserTranslateConversations error: ${error.message}`);
    
    return (data || []).map(conv => ({
      id: conv.id,
      creatorId: conv.creator_id,
      title: conv.title,
      shareableCode: conv.shareable_code,
      createdAt: conv.created_at,
    }));
  }

  async addConversationParticipant(conversationId: number, userId: string, language: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .insert({
        conversation_id: conversationId,
        user_id: this.userId,
        preferred_language: language,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase addConversationParticipant error: ${error.message}`);
    return data.id;
  }

  async removeConversationParticipant(conversationId: number, userId: string) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('translate_conversation_participants')
      .delete()
      .eq('conversation_id', conversationId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase removeConversationParticipant error: ${error.message}`);
    return true;
  }

  async getConversationParticipants(conversationId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .select('*')
      .eq('conversation_id', conversationId);
    
    if (error) throw new Error(`Supabase getConversationParticipants error: ${error.message}`);
    
    return (data || []).map(p => ({
      id: p.id,
      conversationId: p.conversation_id,
      userId: p.user_id,
      preferredLanguage: p.preferred_language,
      joinedAt: p.joined_at,
    }));
  }

  async isUserParticipant(conversationId: number, userId: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_conversation_participants')
      .select('id')
      .eq('conversation_id', conversationId)
      .eq('user_id', this.userId)
      .single();
    
    if (error) return false;
    return !!data;
  }

  async saveTranslateMessage(conversationId: number, userId: string, originalText: string, originalLanguage: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_messages')
      .insert({
        conversation_id: conversationId,
        sender_id: this.userId,
        original_text: originalText,
        original_language: originalLanguage,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveTranslateMessage error: ${error.message}`);
    return data.id;
  }

  async getTranslateConversationMessages(conversationId: number, limit: number = 50) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Supabase getTranslateConversationMessages error: ${error.message}`);
    
    return (data || []).map(msg => ({
      id: msg.id,
      conversationId: msg.conversation_id,
      senderId: msg.sender_id,
      originalText: msg.original_text,
      originalLanguage: msg.original_language,
      createdAt: msg.created_at,
    }));
  }

  async saveMessageTranslation(messageId: number, userId: string, translatedText: string, targetLanguage: string) {
    const supabase = await this.getClient();
    
    // Check if translation already exists
    const { data: existing, error: checkError } = await supabase
      .from('translate_message_translations')
      .select('id')
      .eq('message_id', messageId)
      .eq('user_id', this.userId)
      .maybeSingle();
    
    if (checkError) throw new Error(`Supabase saveMessageTranslation check error: ${checkError.message}`);
    
    if (existing) {
      return existing.id;
    }
    
    const { data, error } = await supabase
      .from('translate_message_translations')
      .insert({
        message_id: messageId,
        user_id: this.userId,
        translated_text: translatedText,
        target_language: targetLanguage,
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveMessageTranslation error: ${error.message}`);
    return data.id;
  }

  async getMessageTranslation(messageId: number, userId: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translate_message_translations')
      .select('*')
      .eq('message_id', messageId)
      .eq('user_id', this.userId)
      .maybeSingle();
    
    if (error) return null;
    if (!data) return null;
    
    return {
      id: data.id,
      messageId: data.message_id,
      userId: data.user_id,
      translatedText: data.translated_text,
      targetLanguage: data.target_language,
      createdAt: data.created_at,
    };
  }

  async getUserById(userId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();
    
    if (error) return undefined;
    return data;
  }

  async createConversationSession(userId: number, title: string, language1: string, language2: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_sessions')
      .insert({
        user_id: this.userId,
        title,
        language1,
        language2,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase createConversationSession error: ${error.message}`);
    return data;
  }

  async getUserConversationSessions(userId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getUserConversationSessions error: ${error.message}`);
    return data || [];
  }

  async getConversationSession(sessionId: number, userId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_sessions')
      .select('*')
      .eq('id', sessionId)
      .eq('user_id', this.userId)
      .single();
    
    if (error) return null;
    return data;
  }

  async deleteConversationSession(sessionId: number, userId: number) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('conversation_sessions')
      .delete()
      .eq('id', sessionId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase deleteConversationSession error: ${error.message}`);
    return true;
  }

  async addConversationMessage(sessionId: number, messageText: string, translatedText: string, language: string, sender: 'user' | 'practice') {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_messages')
      .insert({
        session_id: sessionId,
        message_text: messageText,
        translated_text: translatedText,
        language,
        sender,
        sent_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase addConversationMessage error: ${error.message}`);
    return data;
  }

  async getConversationMessages(sessionId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('sent_at', { ascending: true });
    
    if (error) throw new Error(`Supabase getConversationMessages error: ${error.message}`);
    return data || [];
  }

  async saveConversationSessionToPhrasebook(sessionId: number, userId: number, categoryId?: number) {
    const supabase = await this.getClient();
    
    // Get all messages from the session
    const { data: messages, error: messagesError } = await supabase
      .from('conversation_messages')
      .select('*')
      .eq('session_id', sessionId);
    
    if (messagesError) throw new Error(`Supabase saveConversationSessionToPhrasebook (messages) error: ${messagesError.message}`);
    
    // Save each message as a translation
    const translations = (messages || []).map(msg => ({
      user_id: this.userId,
      original_text: msg.message_text,
      translated_text: msg.translated_text,
      source_language: msg.language,
      target_language: msg.language === 'en' ? 'es' : 'en', // Simple toggle for demo
      category_id: categoryId,
      created_at: new Date(),
    }));
    
    if (translations.length > 0) {
      const { error: insertError } = await supabase
        .from('saved_translations')
        .insert(translations);
      
      if (insertError) throw new Error(`Supabase saveConversationSessionToPhrasebook (insert) error: ${insertError.message}`);
    }
  }

  async deleteTranslateConversation(conversationId: number, userId: number) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('translate_conversations')
      .delete()
      .eq('id', conversationId)
      .eq('creator_id', userId);
    
    if (error) throw new Error(`Supabase deleteTranslateConversation error: ${error.message}`);
    return true;
  }

  // Saved Translations (phrasebook)
  async saveTranslation(translation: any) {
    const supabase = await this.getClient();
    
    // Check if translation already exists
    const { data: existing } = await supabase
      .from('saved_translations')
      .select('id')
      .eq('user_id', this.userId)
      .eq('original_text', translation.originalText)
      .eq('translated_text', translation.translatedText)
      .single();
    
    if (existing) return existing.id;
    
    const { data, error } = await supabase
      .from('saved_translations')
      .insert({
        user_id: this.userId,
        original_text: translation.originalText,
        translated_text: translation.translatedText,
        source_language: translation.sourceLanguage,
        target_language: translation.targetLanguage,
        category_id: translation.categoryId,
        created_at: new Date(),
      })
      .select('id')
      .single();
    
    if (error) throw new Error(`Supabase saveTranslation error: ${error.message}`);
    return data?.id || null;
  }

  async getSavedTranslations(userId: number, categoryId?: number) {
    const supabase = await this.getClient();
    let query = supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });
    
    if (categoryId !== undefined) {
      query = query.eq('category_id', categoryId);
    }
    
    const { data, error } = await query;
    if (error) throw new Error(`Supabase getSavedTranslations error: ${error.message}`);
    return data || [];
  }

  async getFrequentTranslations(userId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', this.userId)
      .order('use_count', { ascending: false })
      .limit(10);
    
    if (error) throw new Error(`Supabase getFrequentTranslations error: ${error.message}`);
    return data || [];
  }

  async deleteSavedTranslation(translationId: number, userId: number) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('saved_translations')
      .delete()
      .eq('id', translationId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase deleteSavedTranslation error: ${error.message}`);
    return true;
  }

  async updateTranslationCategory(translationId: number, userId: number, categoryId: number | null) {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('saved_translations')
      .update({ category_id: categoryId })
      .eq('id', translationId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase updateTranslationCategory error: ${error.message}`);
    return true;
  }

  // Translation Categories
  async createTranslationCategory(category: any) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translation_categories')
      .insert({
        user_id: this.userId,
        name: category.name,
        color: category.color,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase createTranslationCategory error: ${error.message}`);
    return data;
  }

  async getTranslationCategories(userId: number) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('translation_categories')
      .select('*')
      .eq('user_id', this.userId)
      .order('name', { ascending: true });
    
    if (error) throw new Error(`Supabase getTranslationCategories error: ${error.message}`);
    return data || [];
  }

  async deleteTranslationCategory(categoryId: number, userId: number) {
    const supabase = await this.getClient();
    
    // Remove category from all translations
    await supabase
      .from('saved_translations')
      .update({ category_id: null })
      .eq('category_id', categoryId)
      .eq('user_id', this.userId);
    
    // Delete the category
    const { error } = await supabase
      .from('translation_categories')
      .delete()
      .eq('id', categoryId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase deleteTranslationCategory error: ${error.message}`);
    return true;
  }

  // Translation Search
  async searchSavedTranslations(userId: number, searchTerm: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', this.userId)
      .or(`original_text.ilike.%${searchTerm}%,translated_text.ilike.%${searchTerm}%`)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase searchSavedTranslations error: ${error.message}`);
    return data || [];
  }

  async getTranslationsByLanguage(userId: number, sourceLanguage: string, targetLanguage: string) {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('saved_translations')
      .select('*')
      .eq('user_id', this.userId)
      .eq('source_language', sourceLanguage)
      .eq('target_language', targetLanguage)
      .order('created_at', { ascending: false });
    
    if (error) throw new Error(`Supabase getTranslationsByLanguage error: ${error.message}`);
    return data || [];
  }

  // Translation Favorites
  async toggleTranslationFavorite(translationId: number, userId: number) {
    const supabase = await this.getClient();
    
    // Get current translation
    const { data: translation, error: fetchError } = await supabase
      .from('saved_translations')
      .select('*')
      .eq('id', translationId)
      .eq('user_id', this.userId)
      .single();
    
    if (fetchError || !translation) return null;
    
    // Toggle favorite status
    const newFavoriteStatus = translation.is_favorite ? false : true;
    
    const { data, error } = await supabase
      .from('saved_translations')
      .update({ is_favorite: newFavoriteStatus })
      .eq('id', translationId)
      .select()
      .single();
    
    if (error) throw new Error(`Supabase toggleTranslationFavorite error: ${error.message}`);
    return data;
  }
}
