import { SupabaseClient } from "@supabase/supabase-js";
import { TranslationAdapter } from "./TranslationAdapter";

/**
 * Supabase implementation of TranslationAdapter
 * All operations are scoped to the current user via RLS
 */
export class SupabaseTranslationAdapter implements TranslationAdapter {
  constructor(
    private userId: string,
    private getClient: () => Promise<SupabaseClient>
  ) {}

  async createTranslateConversation(userId: string, title: string) {
    const supabase = await this.getClient();
    
    // Generate shareable code
    const shareableCode = Math.random().toString(36).substring(2, 10).toUpperCase();
    
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
}
