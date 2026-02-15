import { eq } from "drizzle-orm";
import {
  InsertConversation,
  InsertConversationFeedback,
  InsertUser,
  InsertUserProfile,
  conversationFeedback,
  conversations,
  userProfiles,
  users,
} from "../../drizzle/schema";
import { getDb } from "./connection";


export async function upsertUser(user: InsertUser, retryCount = 0): Promise<void> {
  if (!user.supabaseId) {
    throw new Error("User supabaseId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      supabaseId: user.supabaseId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    }
    // Owner check removed - will be handled by Supabase email check in context

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error: any) {
    // Handle connection reset errors with retry
    if (error?.cause?.code === 'ECONNRESET' && retryCount < 3) {
      console.warn(`[Database] Connection reset, retrying (${retryCount + 1}/3)...`);
      // Wait a bit before retrying
      await new Promise(resolve => setTimeout(resolve, 100 * (retryCount + 1)));
      return upsertUser(user, retryCount + 1);
    }
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}


export async function getUserBySupabaseId(supabaseId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.supabaseId, supabaseId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}


export async function updateUserLanguage(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user language: database not available");
    return;
  }

  await db.update(users).set({ preferredLanguage: language }).where(eq(users.id, userId));
}


export async function updateUserHubSelection(userId: number, hubs: string[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user hub selection: database not available");
    return;
  }

  await db.update(users).set({ 
    selectedSpecializedHubs: JSON.stringify(hubs),
    hubsSelectedAt: new Date()
  }).where(eq(users.id, userId));
}


export async function updateUserStaySignedIn(userId: number, staySignedIn: boolean) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user stay signed in preference: database not available");
    return;
  }

  await db.update(users).set({ staySignedIn }).where(eq(users.id, userId));
}


export function generateBackupCodes(): string[] {
  const codes: string[] = [];
  for (let i = 0; i < 10; i++) {
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  return codes;
}


export async function enable2FA(userId: number, secret: string, backupCodes: string[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot enable 2FA: database not available");
    return;
  }

  await db.update(users).set({
    twoFactorEnabled: true,
    twoFactorSecret: secret,
    backupCodes: JSON.stringify(backupCodes),
  }).where(eq(users.id, userId));
}


export async function disable2FA(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot disable 2FA: database not available");
    return;
  }

  await db.update(users).set({
    twoFactorEnabled: false,
    twoFactorSecret: null,
    backupCodes: null,
  }).where(eq(users.id, userId));
}


export async function updateBackupCodes(userId: number, backupCodes: string[]) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update backup codes: database not available");
    return;
  }

  await db.update(users).set({
    backupCodes: JSON.stringify(backupCodes),
  }).where(eq(users.id, userId));
}


export async function getUserById(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}


export async function useBackupCode(userId: number, code: string): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot use backup code: database not available");
    return false;
  }

  const user = await getUserById(userId);
  if (!user?.backupCodes) {
    return false;
  }

  try {
    const backupCodes: string[] = JSON.parse(user.backupCodes);
    const codeIndex = backupCodes.findIndex(c => c === code.toUpperCase());
    
    if (codeIndex === -1) {
      return false;
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1);
    await db.update(users).set({
      backupCodes: JSON.stringify(backupCodes),
    }).where(eq(users.id, userId));

    return true;
  } catch (error) {
    console.error('[Database] Failed to parse backup codes:', error);
    return false;
  }
}


export async function saveConversation(conversation: InsertConversation) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save conversation: database not available");
    return undefined;
  }

  const result = await db.insert(conversations).values(conversation);
  return result;
}


export async function getUserConversations(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get conversations: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(conversations)
    .where(eq(conversations.userId, userId))
    .orderBy(conversations.createdAt)
    .limit(limit);

  return result;
}


export async function deleteAllUserConversations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete conversations: database not available");
    return;
  }

  await db
    .delete(conversations)
    .where(eq(conversations.userId, userId));
}


export async function getUserProfile(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user profile: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(userProfiles)
    .where(eq(userProfiles.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}


export async function createUserProfile(profile: InsertUserProfile) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create user profile: database not available");
    return undefined;
  }

  const result = await db.insert(userProfiles).values(profile);
  return result;
}


export async function updateUserProfile(userId: number, updates: Partial<InsertUserProfile>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user profile: database not available");
    return undefined;
  }

  const result = await db
    .update(userProfiles)
    .set({
      ...updates,
      updatedAt: new Date(),
    })
    .where(eq(userProfiles.userId, userId));

  return result;
}


export async function saveConversationFeedback(feedback: InsertConversationFeedback) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save feedback: database not available");
    return undefined;
  }

  const result = await db.insert(conversationFeedback).values(feedback);
  return result;
}


export async function getConversationFeedback(conversationId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get feedback: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(conversationFeedback)
    .where(eq(conversationFeedback.conversationId, conversationId));

  return result;
}
