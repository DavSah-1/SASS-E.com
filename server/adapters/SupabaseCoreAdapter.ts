import { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseClient } from '../supabaseClient';
import { CoreAdapter } from './CoreAdapter';

/**
 * Supabase implementation of CoreAdapter for regular users
 * All operations are scoped to the current user via RLS
 */
export class SupabaseCoreAdapter implements CoreAdapter {
  constructor(
    private userId: string,
    private accessToken?: string
  ) {}

  private async getClient(): Promise<SupabaseClient> {
    return await getSupabaseClient(this.userId, this.accessToken);
  }

  async updateUserLanguage(userId: number, language: string): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .update({ preferred_language: language })
      .eq('id', this.userId)
      .select()
      .single();
    
    if (error) throw new Error(`Supabase updateUserLanguage error: ${error.message}`);
    return data;
  }

  async updateUserHubSelection(userId: number, hubs: string[]): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .update({ selected_hubs: hubs })
      .eq('id', this.userId)
      .select()
      .single();
    
    if (error) throw new Error(`Supabase updateUserHubSelection error: ${error.message}`);
    return data;
  }

  async updateUserStaySignedIn(userId: number, staySignedIn: boolean): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .update({ stay_signed_in: staySignedIn })
      .eq('id', this.userId)
      .select()
      .single();
    
    if (error) throw new Error(`Supabase updateUserStaySignedIn error: ${error.message}`);
    return data;
  }

  async getUserById(userId: number): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', this.userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getUserById error: ${error.message}`);
    }
    return data;
  }

  async getUserProfile(userId: number): Promise<any | undefined> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single();
    
    if (error) {
      if (error.code === 'PGRST116') return undefined;
      throw new Error(`Supabase getUserProfile error: ${error.message}`);
    }
    return data;
  }

  async createUserProfile(profile: any): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        user_id: this.userId,
        personality_type: profile.personalityType,
        humor_style: profile.humorStyle,
        response_style: profile.responseStyle,
        created_at: profile.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase createUserProfile error: ${error.message}`);
    return data;
  }

  async updateUserProfile(userId: number, updates: any): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('user_profiles')
      .update({
        ...updates,
        updated_at: new Date(),
      })
      .eq('user_id', this.userId)
      .select()
      .single();
    
    if (error) throw new Error(`Supabase updateUserProfile error: ${error.message}`);
    return data;
  }

  async saveConversation(conversation: any): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversations')
      .insert({
        user_id: this.userId,
        user_message: conversation.userMessage,
        assistant_response: conversation.assistantResponse,
        context: conversation.context,
        created_at: conversation.timestamp || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveConversation error: ${error.message}`);
    return data;
  }

  async getUserConversations(userId: number, limit: number = 50): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) throw new Error(`Supabase getUserConversations error: ${error.message}`);
    return data || [];
  }

  async deleteAllUserConversations(userId: number): Promise<void> {
    const supabase = await this.getClient();
    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase deleteAllUserConversations error: ${error.message}`);
  }

  async saveConversationFeedback(feedback: any): Promise<any> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_feedback')
      .insert({
        conversation_id: feedback.conversationId,
        user_id: this.userId,
        rating: feedback.rating,
        feedback_text: feedback.feedbackText,
        created_at: feedback.createdAt || new Date(),
      })
      .select()
      .single();
    
    if (error) throw new Error(`Supabase saveConversationFeedback error: ${error.message}`);
    return data;
  }

  async getConversationFeedback(conversationId: number): Promise<any[]> {
    const supabase = await this.getClient();
    const { data, error } = await supabase
      .from('conversation_feedback')
      .select('*')
      .eq('conversation_id', conversationId)
      .eq('user_id', this.userId);
    
    if (error) throw new Error(`Supabase getConversationFeedback error: ${error.message}`);
    return data || [];
  }
}
