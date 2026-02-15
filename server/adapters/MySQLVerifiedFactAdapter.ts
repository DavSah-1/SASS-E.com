/**
 * MySQLVerifiedFactAdapter
 * 
 * MySQL implementation for verified facts (admin database)
 */

import * as db from '../db';
import type { VerifiedFactAdapter } from './VerifiedFactAdapter';

export class MySQLVerifiedFactAdapter implements VerifiedFactAdapter {
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
    return await db.saveVerifiedFact(fact);
  }

  async getVerifiedFact(normalizedQuestion: string): Promise<any | undefined> {
    return await db.getVerifiedFact(normalizedQuestion);
  }

  async searchVerifiedFacts(searchTerm: string, limit: number = 5): Promise<any[]> {
    return await db.searchVerifiedFacts(searchTerm, limit);
  }

  async getRecentVerifiedFacts(limit: number = 10): Promise<any[]> {
    return await db.getRecentVerifiedFacts(limit);
  }

  async logFactAccess(
    userId: number,
    verifiedFactId: number,
    fact: any,
    source: 'voice_assistant' | 'learning_hub'
  ): Promise<void> {
    await db.logFactAccess(userId, verifiedFactId, fact, source);
  }

  async createFactUpdateNotifications(oldFact: any, newFact: any): Promise<void> {
    await db.createFactUpdateNotifications(oldFact, newFact);
  }
}
