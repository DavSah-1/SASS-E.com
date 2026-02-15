import { and, desc, eq, gt, like, or, count } from "drizzle-orm";
import {
  InsertVerifiedFact,
  VerifiedFact,
  users,
  verifiedFacts,
} from "../../drizzle/schema";
import { getDb } from "./connection";
import { createFactUpdateNotifications } from "./notifications";



// ============================================================================
// Verified Facts Functions (Cross-User Knowledge Base)
// ============================================================================

/**
 * Save a verified fact to the knowledge base
 * If fact already exists, update it and notify users who accessed the old version
 */
export async function saveVerifiedFact(fact: InsertVerifiedFact) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  // Check if a fact with this normalized question already exists
  const existingFact = await db
    .select()
    .from(verifiedFacts)
    .where(eq(verifiedFacts.normalizedQuestion, fact.normalizedQuestion))
    .limit(1);
  
  if (existingFact.length > 0) {
    // Fact exists - update it and create notifications
    const oldFact = existingFact[0];
    
    // Update the existing fact
    await db
      .update(verifiedFacts)
      .set({
        question: fact.question,
        answer: fact.answer,
        verificationStatus: fact.verificationStatus,
        confidenceScore: fact.confidenceScore,
        sources: fact.sources,
        verifiedAt: fact.verifiedAt || new Date(),
        expiresAt: fact.expiresAt,
        verifiedByUserId: fact.verifiedByUserId,
        updatedAt: new Date()
      })
      .where(eq(verifiedFacts.id, oldFact.id));
    
    // Get the updated fact
    const updatedFact = await db
      .select()
      .from(verifiedFacts)
      .where(eq(verifiedFacts.id, oldFact.id))
      .limit(1);
    
    // Create notifications for users who accessed the old version
    if (updatedFact.length > 0) {
      await createFactUpdateNotifications(oldFact, updatedFact[0]);
    }
    
    return [{ insertId: oldFact.id }];
  } else {
    // New fact - insert it
    const result = await db.insert(verifiedFacts).values(fact);
    return result;
  }
}


/**
 * Get a verified fact by normalized question (exact match)
 */
export async function getVerifiedFact(normalizedQuestion: string): Promise<VerifiedFact | undefined> {
  const db = await getDb();
  if (!db) return undefined;
  
  const now = new Date();
  const result = await db
    .select()
    .from(verifiedFacts)
    .where(
      and(
        eq(verifiedFacts.normalizedQuestion, normalizedQuestion),
        gt(verifiedFacts.expiresAt, now) // Only return facts that haven't expired
      )
    )
    .orderBy(desc(verifiedFacts.verifiedAt))
    .limit(1);
  
  if (result.length > 0) {
    // Update access count and last accessed timestamp
    await db
      .update(verifiedFacts)
      .set({
        accessCount: result[0].accessCount + 1,
        lastAccessedAt: now
      })
      .where(eq(verifiedFacts.id, result[0].id));
    
    return result[0];
  }
  
  return undefined;
}


/**
 * Search for verified facts by keyword matching
 */
export async function searchVerifiedFacts(searchTerm: string, limit: number = 5): Promise<VerifiedFact[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const result = await db
    .select()
    .from(verifiedFacts)
    .where(
      and(
        or(
          like(verifiedFacts.normalizedQuestion, `%${searchTerm}%`),
          like(verifiedFacts.question, `%${searchTerm}%`),
          like(verifiedFacts.answer, `%${searchTerm}%`)
        ),
        gt(verifiedFacts.expiresAt, now) // Only return facts that haven't expired
      )
    )
    .orderBy(desc(verifiedFacts.confidenceScore), desc(verifiedFacts.verifiedAt))
    .limit(limit);
  
  return result;
}


/**
 * Get recently verified facts (for Voice Assistant context)
 */
export async function getRecentVerifiedFacts(limit: number = 10): Promise<VerifiedFact[]> {
  const db = await getDb();
  if (!db) return [];
  
  const now = new Date();
  const result = await db
    .select()
    .from(verifiedFacts)
    .where(gt(verifiedFacts.expiresAt, now))
    .orderBy(desc(verifiedFacts.verifiedAt))
    .limit(limit);
  
  return result;
}


/**
 * Normalize a question for matching (lowercase, remove punctuation, trim)
 */
export function normalizeQuestion(question: string): string {
  return question
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}
