/**
 * VerifiedFactAdapter Interface
 * 
 * Handles verified knowledge base facts across MySQL (admin) and Supabase (user) databases
 */

export interface VerifiedFactAdapter {
  /**
   * Save a verified fact to the knowledge base
   */
  saveVerifiedFact(fact: {
    question: string;
    normalizedQuestion: string;
    answer: string;
    verificationStatus: 'verified' | 'disputed' | 'debunked' | 'unverified';
    confidenceScore: number;
    sources: string; // JSON string
    verifiedAt: Date;
    expiresAt: Date;
    verifiedByUserId: number;
  }): Promise<any>;

  /**
   * Get a verified fact by normalized question
   */
  getVerifiedFact(normalizedQuestion: string): Promise<any | undefined>;

  /**
   * Search verified facts by search term
   */
  searchVerifiedFacts(searchTerm: string, limit?: number): Promise<any[]>;

  /**
   * Get recent verified facts
   */
  getRecentVerifiedFacts(limit?: number): Promise<any[]>;

  /**
   * Log fact access for notification purposes
   */
  logFactAccess(
    userId: number,
    verifiedFactId: number,
    fact: any,
    source: 'voice_assistant' | 'learning_hub'
  ): Promise<void>;

  /**
   * Create notifications for users who accessed an updated fact
   */
  createFactUpdateNotifications(oldFact: any, newFact: any): Promise<void>;
}
