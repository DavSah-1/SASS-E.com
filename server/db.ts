import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  conversations, 
  InsertConversation, 
  InsertUser, 
  users,
  learningSessions,
  InsertLearningSession,
  factCheckResults,
  InsertFactCheckResult,
  learningSources,
  InsertLearningSource,
  studyGuides,
  InsertStudyGuide,
  quizzes,
  InsertQuiz,
  quizAttempts,
  InsertQuizAttempt
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
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
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
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


// IoT Device Management Functions

import { InsertIoTDevice, iotDevices, InsertIoTCommandHistory, iotCommandHistory } from "../drizzle/schema";

export async function addIoTDevice(device: InsertIoTDevice) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add IoT device: database not available");
    return undefined;
  }

  const result = await db.insert(iotDevices).values(device);
  return result;
}

export async function getUserIoTDevices(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get IoT devices: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(iotDevices)
    .where(eq(iotDevices.userId, userId))
    .orderBy(iotDevices.createdAt);

  return result;
}

export async function getIoTDeviceById(deviceId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get IoT device: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(iotDevices)
    .where(eq(iotDevices.deviceId, deviceId))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

export async function updateIoTDeviceState(deviceId: string, state: string, status: string = "online") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update IoT device: database not available");
    return undefined;
  }

  const result = await db
    .update(iotDevices)
    .set({ 
      state, 
      status: status as "online" | "offline" | "error",
      lastSeen: new Date() 
    })
    .where(eq(iotDevices.deviceId, deviceId));

  return result;
}

export async function deleteIoTDevice(deviceId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete IoT device: database not available");
    return undefined;
  }

  const result = await db
    .delete(iotDevices)
    .where(eq(iotDevices.deviceId, deviceId));

  return result;
}

export async function saveIoTCommand(command: InsertIoTCommandHistory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save IoT command: database not available");
    return undefined;
  }

  const result = await db.insert(iotCommandHistory).values(command);
  return result;
}

export async function getDeviceCommandHistory(deviceId: string, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get command history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(iotCommandHistory)
    .where(eq(iotCommandHistory.deviceId, deviceId))
    .orderBy(iotCommandHistory.executedAt)
    .limit(limit);

  return result;
}



// User Profile and Learning Functions

import { InsertUserProfile, userProfiles, InsertConversationFeedback, conversationFeedback } from "../drizzle/schema";

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




// ==================== Learning Assistant Functions ====================

export async function saveLearningSession(session: InsertLearningSession) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save learning session: database not available");
    return undefined;
  }

  const result = await db.insert(learningSessions).values(session);
  return result;
}

export async function getUserLearningSessions(userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get learning sessions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(learningSessions)
    .where(eq(learningSessions.userId, userId))
    .orderBy(learningSessions.createdAt)
    .limit(limit);

  return result;
}

export async function saveFactCheckResult(factCheck: InsertFactCheckResult) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save fact check result: database not available");
    return undefined;
  }

  const result = await db.insert(factCheckResults).values(factCheck);
  return result;
}

export async function getFactCheckResultsBySession(sessionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get fact check results: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(factCheckResults)
    .where(eq(factCheckResults.learningSessionId, sessionId));

  return result;
}

export async function saveLearningSource(source: InsertLearningSource) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save learning source: database not available");
    return undefined;
  }

  const result = await db.insert(learningSources).values(source);
  return result;
}

export async function saveStudyGuide(guide: InsertStudyGuide) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save study guide: database not available");
    return undefined;
  }

  const result = await db.insert(studyGuides).values(guide);
  return result;
}

export async function getUserStudyGuides(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get study guides: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(studyGuides)
    .where(eq(studyGuides.userId, userId))
    .orderBy(studyGuides.createdAt);

  return result;
}

export async function saveQuiz(quiz: InsertQuiz) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save quiz: database not available");
    return undefined;
  }

  const result = await db.insert(quizzes).values(quiz);
  return result;
}

export async function getUserQuizzes(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quizzes: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(quizzes)
    .where(eq(quizzes.userId, userId))
    .orderBy(quizzes.createdAt);

  return result;
}

export async function saveQuizAttempt(attempt: InsertQuizAttempt) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save quiz attempt: database not available");
    return undefined;
  }

  const result = await db.insert(quizAttempts).values(attempt);
  return result;
}

export async function getQuizAttempts(quizId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get quiz attempts: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(quizAttempts)
    .where(eq(quizAttempts.quizId, quizId))
    .orderBy(quizAttempts.createdAt);

  return result;
}

