/**
 * SupabaseVerifiedFactAdapter
 * 
 * Supabase implementation for verified facts (user database)
 */

import { getSupabaseClient } from '../supabaseClient';

/**
 * Helper function to handle Supabase errors consistently
 */
function handleSupabaseError(error: any, operation: string): never {
  console.error(`[Supabase Error] ${operation}:`, error);
  throw new Error(`Database operation failed: ${operation} - ${error.message || error.code}`);
}
import type { VerifiedFactAdapter } from './VerifiedFactAdapter';

export class SupabaseVerifiedFactAdapter implements VerifiedFactAdapter {
  constructor(private userId: string, private accessToken?: string) {}

  async saveVerifiedFact(fact: {
    question: string;
    normalizedQuestion: string;
    answer: string;
    verificationStatus: 'verified' | 'disputed' | 'debunked' | 'unverified';
    confidenceScore: number;
    sources: string;
    verifiedAt: Date;
    expiresAt: Date;
    verifiedByUserId: number;
  }): Promise<any> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .insert({
        ...fact,
        created_at: new Date(),
      })
      .select()
      .single();
    
    if (error) handleSupabaseError(error, 'saveVerifiedFact');
    return data;
  }

  async getVerifiedFact(normalizedQuestion: string): Promise<any | undefined> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .eq('normalized_question', normalizedQuestion)
      .single();
    
    if (error) return undefined;
    return data;
  }

  async searchVerifiedFacts(searchTerm: string, limit: number = 5): Promise<any[]> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .or(`question.ilike.%${searchTerm}%,answer.ilike.%${searchTerm}%`)
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'searchVerifiedFacts');
    return data || [];
  }

  async getRecentVerifiedFacts(limit: number = 10): Promise<any[]> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { data, error } = await supabase
      .from('verified_facts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    
    if (error) handleSupabaseError(error, 'getRecentVerifiedFacts');
    return data || [];
  }

  async logFactAccess(
    userId: number,
    verifiedFactId: number,
    fact: any,
    source: 'voice_assistant' | 'learning_hub'
  ): Promise<void> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    const { error } = await supabase
      .from('fact_access_logs')
      .insert({
        user_id: this.userId,
        verified_fact_id: verifiedFactId,
        question: fact.question,
        answer: fact.answer,
        source,
        accessed_at: new Date(),
      });
    
    if (error) handleSupabaseError(error, 'logFactAccess');
  }

  async createFactUpdateNotifications(oldFact: any, newFact: any): Promise<void> {
    const supabase = await getSupabaseClient(this.userId, this.accessToken);
    
    // Get users who accessed the old fact
    const { data: accessLogs } = await supabase
      .from('fact_access_logs')
      .select('user_id')
      .eq('verified_fact_id', oldFact.id);
    
    const uniqueUsers = Array.from(new Set((accessLogs || []).map((log: any) => log.user_id)));
    
    const notificationType = 'fact_update';
    const now = new Date();
    
    // For simplicity, create individual notifications (batching logic can be added later)
    for (const targetUserId of uniqueUsers) {
      await supabase
        .from('notifications')
        .insert({
          user_id: targetUserId,
          type: notificationType,
          title: 'Verified Fact Updated',
          message: `A fact you previously accessed has been updated: "${oldFact.question}"`,
          data: JSON.stringify({ oldFact, newFact }),
          created_at: now,
          is_read: false,
        });
    }
  }
}
