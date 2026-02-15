import { and, desc, eq, like, or, count } from "drizzle-orm";
import {
  InsertSavedTranslation,
  InsertTranslationCategory,
  conversationMessages,
  conversationSessions,
  conversations,
  savedTranslations,
  translateConversationParticipants,
  translateConversations,
  translateMessageTranslations,
  translateMessages,
  translationCategories,
} from "../../drizzle/schema";
import { getDb } from "./connection";


/**
 * Generate a unique shareable code for a conversation
 */
function generateShareableCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let code = '';
  for (let i = 0; i < 12; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}



// ============================================================================
// Translation Phrasebook Functions
// ============================================================================

/**
 * Save a translation to user's phrasebook
 */
export async function saveTranslation(translation: InsertSavedTranslation) {
  const db = await getDb();
  if (!db) return null;
  
  // Check if translation already exists
  const existing = await db
    .select()
    .from(savedTranslations)
    .where(
      and(
        eq(savedTranslations.userId, translation.userId),
        eq(savedTranslations.originalText, translation.originalText),
        eq(savedTranslations.sourceLanguage, translation.sourceLanguage),
        eq(savedTranslations.targetLanguage, translation.targetLanguage)
      )
    )
    .limit(1);
  
  if (existing.length > 0) {
    // Update usage count and last used time
    await db
      .update(savedTranslations)
      .set({
        usageCount: existing[0].usageCount + 1,
        lastUsedAt: new Date()
      })
      .where(eq(savedTranslations.id, existing[0].id));
    
    return existing[0];
  }
  
  // Insert new translation
  const result = await db.insert(savedTranslations).values(translation);
  const insertedId = Number(result[0].insertId);
  
  const newTranslation = await db
    .select()
    .from(savedTranslations)
    .where(eq(savedTranslations.id, insertedId))
    .limit(1);
  
  return newTranslation[0];
}


/**
 * Get saved translations for a user
 */
export async function getSavedTranslations(userId: number, categoryId?: number) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [eq(savedTranslations.userId, userId)];
  if (categoryId !== undefined) {
    conditions.push(eq(savedTranslations.categoryId, categoryId));
  }
  
  const translations = await db
    .select()
    .from(savedTranslations)
    .where(and(...conditions))
    .orderBy(desc(savedTranslations.lastUsedAt));
  
  return translations;
}


/**
 * Get frequently used translations for caching (top 100)
 */
export async function getFrequentTranslations(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const translations = await db
    .select()
    .from(savedTranslations)
    .where(eq(savedTranslations.userId, userId))
    .orderBy(desc(savedTranslations.usageCount))
    .limit(100);
  
  return translations;
}


/**
 * Find cached translation
 */
export async function findCachedTranslation(
  userId: number,
  originalText: string,
  sourceLanguage: string,
  targetLanguage: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(savedTranslations)
    .where(
      and(
        eq(savedTranslations.userId, userId),
        eq(savedTranslations.originalText, originalText),
        eq(savedTranslations.sourceLanguage, sourceLanguage),
        eq(savedTranslations.targetLanguage, targetLanguage)
      )
    )
    .limit(1);
  
  if (result.length > 0) {
    // Update usage count
    await db
      .update(savedTranslations)
      .set({
        usageCount: result[0].usageCount + 1,
        lastUsedAt: new Date()
      })
      .where(eq(savedTranslations.id, result[0].id));
    
    return result[0];
  }
  
  return null;
}


/**
 * Delete saved translation
 */
export async function deleteSavedTranslation(translationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .delete(savedTranslations)
    .where(
      and(
        eq(savedTranslations.id, translationId),
        eq(savedTranslations.userId, userId)
      )
    );
  
  return true;
}


/**
 * Toggle favorite status
 */
export async function toggleTranslationFavorite(translationId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const translation = await db
    .select()
    .from(savedTranslations)
    .where(
      and(
        eq(savedTranslations.id, translationId),
        eq(savedTranslations.userId, userId)
      )
    )
    .limit(1);
  
  if (translation.length === 0) return null;
  
  const newFavoriteStatus = translation[0].isFavorite === 1 ? 0 : 1;
  
  await db
    .update(savedTranslations)
    .set({ isFavorite: newFavoriteStatus })
    .where(eq(savedTranslations.id, translationId));
  
  return { ...translation[0], isFavorite: newFavoriteStatus };
}


// ============================================================================
// Translation Categories Functions
// ============================================================================

/**
 * Create translation category
 */
export async function createTranslationCategory(category: InsertTranslationCategory) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(translationCategories).values(category);
  const insertedId = Number(result[0].insertId);
  
  const newCategory = await db
    .select()
    .from(translationCategories)
    .where(eq(translationCategories.id, insertedId))
    .limit(1);
  
  return newCategory[0];
}


/**
 * Get user's translation categories
 */
export async function getTranslationCategories(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  const categories = await db
    .select()
    .from(translationCategories)
    .where(eq(translationCategories.userId, userId))
    .orderBy(translationCategories.name);
  
  return categories;
}


/**
 * Delete translation category
 */
export async function deleteTranslationCategory(categoryId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // First, remove category from all translations
  await db
    .update(savedTranslations)
    .set({ categoryId: null })
    .where(
      and(
        eq(savedTranslations.categoryId, categoryId),
        eq(savedTranslations.userId, userId)
      )
    );
  
  // Then delete the category
  await db
    .delete(translationCategories)
    .where(
      and(
        eq(translationCategories.id, categoryId),
        eq(translationCategories.userId, userId)
      )
    );
  
  return true;
}


/**
 * Update translation category assignment
 */
export async function updateTranslationCategory(
  translationId: number,
  userId: number,
  categoryId: number | null
) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(savedTranslations)
    .set({ categoryId })
    .where(
      and(
        eq(savedTranslations.id, translationId),
        eq(savedTranslations.userId, userId)
      )
    );
  
  return true;
}



/**
 * Create a new conversation session
 */
export async function createConversationSession(
  userId: number,
  title: string,
  language1: string,
  language2: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db.insert(conversationSessions).values({
    userId,
    title,
    language1,
    language2,
  });
  
  return Number(result[0].insertId);
}


/**
 * Get all conversation sessions for a user
 */
export async function getUserConversationSessions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(conversationSessions)
    .where(eq(conversationSessions.userId, userId))
    .orderBy(desc(conversationSessions.lastMessageAt));
}


/**
 * Get a specific conversation session
 */
export async function getConversationSession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const result = await db
    .select()
    .from(conversationSessions)
    .where(
      and(
        eq(conversationSessions.id, sessionId),
        eq(conversationSessions.userId, userId)
      )
    )
    .limit(1);
  
  return result.length > 0 ? result[0] : null;
}


/**
 * Get messages for a conversation session
 */
export async function getConversationMessages(sessionId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(conversationMessages)
    .where(eq(conversationMessages.sessionId, sessionId))
    .orderBy(conversationMessages.timestamp);
}


/**
 * Add a message to a conversation
 */
export async function addConversationMessage(
  sessionId: number,
  messageText: string,
  translatedText: string,
  language: string,
  sender: "user" | "practice"
) {
  const db = await getDb();
  if (!db) return null;
  
  // Insert the message
  const result = await db.insert(conversationMessages).values({
    sessionId,
    messageText,
    translatedText,
    language,
    sender,
  });
  
  // Update the session's lastMessageAt timestamp
  await db
    .update(conversationSessions)
    .set({ lastMessageAt: new Date() })
    .where(eq(conversationSessions.id, sessionId));
  
  return Number(result[0].insertId);
}


/**
 * Delete a conversation session and all its messages
 */
export async function deleteConversationSession(sessionId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // First delete all messages
  await db
    .delete(conversationMessages)
    .where(eq(conversationMessages.sessionId, sessionId));
  
  // Then delete the session
  await db
    .delete(conversationSessions)
    .where(
      and(
        eq(conversationSessions.id, sessionId),
        eq(conversationSessions.userId, userId)
      )
    );
  
  return true;
}


/**
 * Save conversation session to phrasebook
 */
export async function saveConversationSessionToPhrasebook(
  sessionId: number,
  userId: number,
  categoryId?: number
) {
  const db = await getDb();
  if (!db) return false;
  
  // Get all messages from the conversation
  const messages = await getConversationMessages(sessionId);
  
  // Save each message as a translation
  for (const message of messages) {
    await db.insert(savedTranslations).values({
      userId,
      originalText: message.messageText,
      translatedText: message.translatedText,
      sourceLanguage: message.language,
      targetLanguage: message.language === "en" ? "es" : "en", // Simple logic, can be improved
      categoryId: categoryId || null,
      isFavorite: 0,
      usageCount: 1,
    });
  }
  
  return true;
}


/**
 * Create a new translate conversation
 */
export async function createTranslateConversation(creatorId: string, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const shareableCode = generateShareableCode();
  
  const insertResult = await db.insert(translateConversations).values({
    shareableCode,
    creatorId: Number(creatorId),
    title: title || null,
    isActive: 1,
    expiresAt: null,
  });

  // Drizzle returns [ResultSetHeader] for MySQL, extract insertId
  const conversationId = Number((insertResult as any)[0]?.insertId || (insertResult as any).insertId);
  
  return { conversationId, shareableCode };
}


/**
 * Get conversation by shareable code
 */
export async function getConversationByCode(shareableCode: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(translateConversations)
    .where(eq(translateConversations.shareableCode, shareableCode))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}


/**
 * Get conversation by ID
 */
export async function getConversationById(conversationId: number) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(translateConversations)
    .where(eq(translateConversations.id, conversationId))
    .limit(1);

  return results.length > 0 ? results[0] : null;
}


/**
 * Add participant to conversation
 */
export async function addConversationParticipant(
  conversationId: number,
  userId: string,
  preferredLanguage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if already a participant
  const existing = await db
    .select()
    .from(translateConversationParticipants)
    .where(
      and(
        eq(translateConversationParticipants.conversationId, conversationId),
        eq(translateConversationParticipants.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const insertResult = await db.insert(translateConversationParticipants).values({
    conversationId: Number(conversationId),
    userId: userId,
    preferredLanguage: preferredLanguage,
  });

  return (insertResult as any).insertId as number;
}


/**
 * Get conversation participants
 */
export async function getConversationParticipants(conversationId: number) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(translateConversationParticipants)
    .where(eq(translateConversationParticipants.conversationId, conversationId))
    .orderBy(translateConversationParticipants.joinedAt);

  return results;
}


/**
 * Check if user is participant
 */
export async function isUserParticipant(conversationId: number, userId: string) {
  const db = await getDb();
  if (!db) return false;

  const results = await db
    .select()
    .from(translateConversationParticipants)
    .where(
      and(
        eq(translateConversationParticipants.conversationId, conversationId),
        eq(translateConversationParticipants.userId, userId)
      )
    )
    .limit(1);

  return results.length > 0;
}


/**
 * Save a message
 */
export async function saveTranslateMessage(
  conversationId: number,
  senderId: string,
  originalText: string,
  originalLanguage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertResult = await db.insert(translateMessages).values({
    conversationId,
    senderId: Number(senderId),
    originalText,
    originalLanguage,
  });

  return (insertResult as any).insertId as number;
}


/**
 * Get messages for a translate conversation
 */
export async function getTranslateConversationMessages(conversationId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(translateMessages)
    .where(eq(translateMessages.conversationId, conversationId))
    .orderBy(desc(translateMessages.createdAt))
    .limit(limit);

  return results.reverse(); // Return in chronological order
}


/**
 * Save message translation
 */
export async function saveMessageTranslation(
  messageId: number,
  userId: string,
  translatedText: string,
  targetLanguage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  // Check if translation already exists
  const existing = await db
    .select()
    .from(translateMessageTranslations)
    .where(
      and(
        eq(translateMessageTranslations.messageId, messageId),
        eq(translateMessageTranslations.userId, userId)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    return existing[0].id;
  }

  const insertResult = await db.insert(translateMessageTranslations).values({
    messageId,
    userId,
    translatedText,
    targetLanguage,
  });

  return (insertResult as any).insertId as number;
}


/**
 * Get message translation for user
 */
export async function getMessageTranslation(messageId: number, userId: string) {
  const db = await getDb();
  if (!db) return null;

  const results = await db
    .select()
    .from(translateMessageTranslations)
    .where(
      and(
        eq(translateMessageTranslations.messageId, messageId),
        eq(translateMessageTranslations.userId, userId)
      )
    )
    .limit(1);

  return results.length > 0 ? results[0] : null;
}


/**
 * Get user's translate conversations
 */
export async function getUserTranslateConversations(userId: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select({
      conversation: translateConversations,
      participant: translateConversationParticipants,
    })
    .from(translateConversationParticipants)
    .innerJoin(
      translateConversations,
      eq(translateConversationParticipants.conversationId, translateConversations.id)
    )
    .where(eq(translateConversationParticipants.userId, userId))
    .orderBy(desc(translateConversations.updatedAt));

  return results.map(r => r.conversation);
}


/**
 * Remove participant from conversation
 */
export async function removeConversationParticipant(conversationId: number, userId: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db
    .delete(translateConversationParticipants)
    .where(
      and(
        eq(translateConversationParticipants.conversationId, conversationId),
        eq(translateConversationParticipants.userId, userId)
      )
    );

  return true;
}


/**
 * Delete translate conversation
 */
export async function deleteTranslateConversation(conversationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  // Verify ownership before deletion
  const conversation = await db
    .select()
    .from(translateConversations)
    .where(
      and(
        eq(translateConversations.id, conversationId),
        eq(translateConversations.creatorId, userId)
      )
    )
    .limit(1);
  
  if (conversation.length === 0) {
    return false; // Not found or not owner
  }
  
  // Delete conversation - CASCADE DELETE handles related records automatically
  // (participants, messages, message translations)
  await db
    .delete(translateConversations)
    .where(eq(translateConversations.id, conversationId));
  
  return true;
}


/**
 * Search saved translations
 */
export async function searchSavedTranslations(userId: number, searchTerm: string) {
  const db = await getDb();
  if (!db) return [];
  
  const translations = await db
    .select()
    .from(savedTranslations)
    .where(
      and(
        eq(savedTranslations.userId, userId),
        or(
          like(savedTranslations.originalText, `%${searchTerm}%`),
          like(savedTranslations.translatedText, `%${searchTerm}%`)
        )
      )
    )
    .orderBy(desc(savedTranslations.lastUsedAt))
    .limit(50);
  
  return translations;
}


/**
 * Get translations by language pair
 */
export async function getTranslationsByLanguage(userId: number, sourceLanguage: string, targetLanguage: string) {
  const db = await getDb();
  if (!db) return [];
  
  const translations = await db
    .select()
    .from(savedTranslations)
    .where(
      and(
        eq(savedTranslations.userId, userId),
        eq(savedTranslations.sourceLanguage, sourceLanguage),
        eq(savedTranslations.targetLanguage, targetLanguage)
      )
    )
    .orderBy(desc(savedTranslations.lastUsedAt));
  
  return translations;
}
