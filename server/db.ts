import { eq, and } from "drizzle-orm";
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
  InsertQuizAttempt,
  vocabularyItems,
  InsertVocabularyItem,
  userVocabulary,
  InsertUserVocabulary,
  grammarLessons,
  InsertGrammarLesson,
  userGrammarProgress,
  InsertUserGrammarProgress,
  languageExercises,
  InsertLanguageExercise,
  exerciseAttempts,
  InsertExerciseAttempt,
  userLanguageProgress,
  InsertUserLanguageProgress,
  dailyLessons,
  InsertDailyLesson,
  languageAchievements,
  InsertLanguageAchievement
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

export async function updateUserLanguage(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update user language: database not available");
    return;
  }

  await db.update(users).set({ preferredLanguage: language }).where(eq(users.id, userId));
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



// ============================================
// Language Learning Database Helpers
// ============================================

/**
 * Get vocabulary items by language and difficulty
 */
export async function getVocabularyItems(language: string, difficulty?: string, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get vocabulary items: database not available");
    return [];
  }

  let conditions = [eq(vocabularyItems.language, language)];
  
  if (difficulty) {
    conditions.push(eq(vocabularyItems.difficulty, difficulty as any));
  }
  
  const query = db.select().from(vocabularyItems).where(and(...conditions));
  
  const result = await query.limit(limit);
  return result;
}

/**
 * Get user's vocabulary progress for a language
 */
export async function getUserVocabularyProgress(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user vocabulary progress: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(userVocabulary)
    .where(and(
      eq(userVocabulary.userId, userId),
      eq(userVocabulary.language, language)
    ));
  
  return result;
}

/**
 * Save or update user vocabulary progress
 */
export async function saveUserVocabularyProgress(progress: InsertUserVocabulary) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save user vocabulary progress: database not available");
    return undefined;
  }

  const result = await db.insert(userVocabulary).values(progress);
  return result;
}

/**
 * Get grammar lessons by language and difficulty
 */
export async function getGrammarLessons(language: string, difficulty?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get grammar lessons: database not available");
    return [];
  }

  let conditions = [eq(grammarLessons.language, language)];
  
  if (difficulty) {
    conditions.push(eq(grammarLessons.difficulty, difficulty as any));
  }
  
  const query = db.select().from(grammarLessons).where(and(...conditions));
  
  const result = await query;
  return result;
}

/**
 * Get user's grammar progress for a language
 */
export async function getUserGrammarProgress(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user grammar progress: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(userGrammarProgress)
    .where(and(
      eq(userGrammarProgress.userId, userId),
      eq(userGrammarProgress.language, language)
    ));
  
  return result;
}

/**
 * Save or update user grammar progress
 */
export async function saveUserGrammarProgress(progress: InsertUserGrammarProgress) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save user grammar progress: database not available");
    return undefined;
  }

  const result = await db.insert(userGrammarProgress).values(progress);
  return result;
}

/**
 * Get language exercises by type and difficulty
 */
export async function getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get language exercises: database not available");
    return [];
  }

  let conditions = [eq(languageExercises.language, language)];
  
  if (exerciseType) {
    conditions.push(eq(languageExercises.exerciseType, exerciseType as any));
  }
  
  if (difficulty) {
    conditions.push(eq(languageExercises.difficulty, difficulty as any));
  }
  
  const query = db.select().from(languageExercises).where(and(...conditions));
  
  const result = await query.limit(limit);
  return result;
}

/**
 * Save exercise attempt
 */
export async function saveExerciseAttempt(attempt: InsertExerciseAttempt) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save exercise attempt: database not available");
    return undefined;
  }

  const result = await db.insert(exerciseAttempts).values(attempt);
  return result;
}

/**
 * Get user's language progress
 */
export async function getUserLanguageProgress(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user language progress: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(userLanguageProgress)
    .where(and(
      eq(userLanguageProgress.userId, userId),
      eq(userLanguageProgress.language, language)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Initialize or update user language progress
 */
export async function upsertUserLanguageProgress(progress: InsertUserLanguageProgress) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user language progress: database not available");
    return undefined;
  }

  const result = await db.insert(userLanguageProgress).values(progress).onDuplicateKeyUpdate({
    set: {
      fluencyScore: progress.fluencyScore,
      vocabularySize: progress.vocabularySize,
      grammarTopicsMastered: progress.grammarTopicsMastered,
      exercisesCompleted: progress.exercisesCompleted,
      totalStudyTime: progress.totalStudyTime,
      currentStreak: progress.currentStreak,
      longestStreak: progress.longestStreak,
      lastStudied: progress.lastStudied,
      updatedAt: new Date(),
    },
  });
  
  return result;
}

/**
 * Get daily lesson for user
 */
export async function getDailyLesson(userId: number, language: string, lessonDate: Date) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get daily lesson: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(dailyLessons)
    .where(and(
      eq(dailyLessons.userId, userId),
      eq(dailyLessons.language, language),
      eq(dailyLessons.lessonDate, lessonDate)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Save daily lesson
 */
export async function saveDailyLesson(lesson: InsertDailyLesson) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save daily lesson: database not available");
    return undefined;
  }

  const result = await db.insert(dailyLessons).values(lesson);
  return result;
}

/**
 * Get user's achievements for a language
 */
export async function getUserAchievements(userId: number, language: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user achievements: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(languageAchievements)
    .where(and(
      eq(languageAchievements.userId, userId),
      eq(languageAchievements.language, language)
    ));
  
  return result;
}

/**
 * Save achievement
 */
export async function saveAchievement(achievement: InsertLanguageAchievement) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save achievement: database not available");
    return undefined;
  }

  const result = await db.insert(languageAchievements).values(achievement);
  return result;
}
