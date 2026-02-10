import { and, desc, eq, gt, gte, isNull, like, lte, or, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  conversations, 
  InsertConversation, 
  InsertUser, 
  users,
  conversationSessions,
  InsertConversationSession,
  conversationMessages,
  InsertConversationMessage,
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
  InsertLanguageAchievement,
  debts,
  InsertDebt,
  debtPayments,
  InsertDebtPayment,
  debtMilestones,
  InsertDebtMilestone,
  debtStrategies,
  InsertDebtStrategy,
  coachingSessions,
  InsertCoachingSession,
  debtBudgetSnapshots,
  InsertDebtBudgetSnapshot,
  budgetCategories,
  InsertBudgetCategory,
  budgetTransactions,
  InsertBudgetTransaction,
  monthlyBudgetSummaries,
  InsertMonthlyBudgetSummary,
  financialGoals,
  InsertFinancialGoal,
  goalMilestones,
  InsertGoalMilestone,
  goalProgressHistory,
  InsertGoalProgressHistory,
  mathProblems,
  InsertMathProblem,
  mathSolutions,
  InsertMathSolution,
  mathProgress,
  InsertMathProgress,
  experiments,
  InsertExperiment,
  experimentSteps,
  InsertExperimentStep,
  userLabResults,
  InsertUserLabResult,
  scienceProgress,
  InsertScienceProgress,
  labQuizQuestions,
  InsertLabQuizQuestion,
  labQuizAttempts,
  InsertLabQuizAttempt,
  verifiedFacts,
  InsertVerifiedFact,
  VerifiedFact,
  factAccessLog,
  InsertFactAccessLog,  factUpdateNotifications,
  InsertFactUpdateNotification,
  savedTranslations,
  InsertSavedTranslation,
  translationCategories,
  InsertTranslationCategory,
  topicProgress,
  topicQuizResults,
  practiceSessions,
  hubTrials,
  HubTrial,
  InsertHubTrial,
  dailyUsage,
  DailyUsage,
  InsertDailyUsage,
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
      // Reset the connection
      _db = null;
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


// ============================================================================
// DEBT ELIMINATION FINANCIAL COACH FUNCTIONS
// ============================================================================

/**
 * Add a new debt for a user
 */
export async function addDebt(debt: InsertDebt) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot add debt: database not available");
    return undefined;
  }

  const result = await db.insert(debts).values(debt);
  return result;
}

/**
 * Get all debts for a user
 */
export async function getUserDebts(userId: number, includeInactive: boolean = false) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user debts: database not available");
    return [];
  }

  const conditions = [eq(debts.userId, userId)];
  
  if (!includeInactive) {
    conditions.push(eq(debts.status, "active"));
  }

  const result = await db
    .select()
    .from(debts)
    .where(and(...conditions))
    .orderBy(debts.createdAt);
  
  return result;
}

/**
 * Get a specific debt by ID
 */
export async function getDebtById(debtId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get debt: database not available");
    return undefined;
  }

  const result = await db
    .select()
    .from(debts)
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update a debt
 */
export async function updateDebt(debtId: number, userId: number, updates: Partial<InsertDebt>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update debt: database not available");
    return undefined;
  }

  const result = await db
    .update(debts)
    .set(updates)
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ));
  
  return result;
}

/**
 * Delete a debt (soft delete by marking as closed)
 */
export async function deleteDebt(debtId: number, userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete debt: database not available");
    return undefined;
  }

  const result = await db
    .update(debts)
    .set({ status: "closed" })
    .where(and(
      eq(debts.id, debtId),
      eq(debts.userId, userId)
    ));
  
  return result;
}

/**
 * Record a payment toward a debt
 */
export async function recordDebtPayment(payment: InsertDebtPayment) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record payment: database not available");
    return undefined;
  }

  // Insert payment record
  const result = await db.insert(debtPayments).values(payment);
  
  // Update debt's current balance
  await db
    .update(debts)
    .set({ currentBalance: payment.balanceAfter })
    .where(eq(debts.id, payment.debtId));
  
  // Check if debt is paid off
  if (payment.balanceAfter === 0) {
    await db
      .update(debts)
      .set({ 
        status: "paid_off",
        paidOffAt: new Date()
      })
      .where(eq(debts.id, payment.debtId));
  }
  
  return result;
}

/**
 * Get payment history for a debt
 */
export async function getDebtPaymentHistory(debtId: number, userId: number, limit: number = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get payment history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtPayments)
    .where(and(
      eq(debtPayments.debtId, debtId),
      eq(debtPayments.userId, userId)
    ))
    .orderBy(desc(debtPayments.paymentDate))
    .limit(limit);
  
  return result;
}

/**
 * Get all payments for a user (across all debts)
 */
export async function getAllUserPayments(userId: number, limit: number = 100) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user payments: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtPayments)
    .where(eq(debtPayments.userId, userId))
    .orderBy(desc(debtPayments.paymentDate))
    .limit(limit);
  
  return result;
}

/**
 * Save a debt elimination strategy
 */
export async function saveDebtStrategy(strategy: InsertDebtStrategy) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save strategy: database not available");
    return undefined;
  }

  const result = await db.insert(debtStrategies).values(strategy);
  return result;
}

/**
 * Get latest strategy for a user
 */
export async function getLatestStrategy(userId: number, strategyType?: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get strategy: database not available");
    return undefined;
  }

  const conditions = [eq(debtStrategies.userId, userId)];
  
  if (strategyType) {
    conditions.push(eq(debtStrategies.strategyType, strategyType as any));
  }

  const result = await db
    .select()
    .from(debtStrategies)
    .where(and(...conditions))
    .orderBy(desc(debtStrategies.calculatedAt))
    .limit(1);
  
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Save a milestone achievement
 */
export async function saveDebtMilestone(milestone: InsertDebtMilestone) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save milestone: database not available");
    return undefined;
  }

  const result = await db.insert(debtMilestones).values(milestone);
  return result;
}

/**
 * Get user's debt milestones
 */
export async function getUserMilestones(userId: number, debtId?: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get milestones: database not available");
    return [];
  }

  const conditions = [eq(debtMilestones.userId, userId)];
  
  if (debtId !== undefined) {
    conditions.push(eq(debtMilestones.debtId, debtId));
  }

  const result = await db
    .select()
    .from(debtMilestones)
    .where(and(...conditions))
    .orderBy(desc(debtMilestones.achievedAt));
  
  return result;
}

/**
 * Save a coaching session
 */
export async function saveCoachingSession(session: InsertCoachingSession) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save coaching session: database not available");
    return undefined;
  }

  const result = await db.insert(coachingSessions).values(session);
  return result;
}

/**
 * Get recent coaching sessions for a user
 */
export async function getRecentCoachingSessions(userId: number, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get coaching sessions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(coachingSessions)
    .where(eq(coachingSessions.userId, userId))
    .orderBy(desc(coachingSessions.createdAt))
    .limit(limit);
  
  return result;
}

/**
 * Save budget snapshot
 */
export async function saveBudgetSnapshot(snapshot: InsertDebtBudgetSnapshot) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save budget snapshot: database not available");
    return undefined;
  }

  const result = await db.insert(debtBudgetSnapshots).values(snapshot);
  return result;
}

/**
 * Get budget snapshots for a user
 */
export async function getBudgetSnapshots(userId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget snapshots: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(debtBudgetSnapshots)
    .where(eq(debtBudgetSnapshots.userId, userId))
    .orderBy(desc(debtBudgetSnapshots.monthYear))
    .limit(limit);
  
  return result;
}

/**
 * Get debt summary statistics for a user
 */
export async function getDebtSummary(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get debt summary: database not available");
    return {
      totalDebts: 0,
      totalBalance: 0,
      totalOriginalBalance: 0,
      totalPaid: 0,
      averageInterestRate: 0,
      totalMonthlyMinimum: 0,
      debtsPaidOff: 0,
    };
  }

  const userDebts = await getUserDebts(userId, true);
  
  const totalDebts = userDebts.filter(d => d.status === "active").length;
  const totalBalance = userDebts
    .filter(d => d.status === "active")
    .reduce((sum, d) => sum + d.currentBalance, 0);
  const totalOriginalBalance = userDebts
    .reduce((sum, d) => sum + d.originalBalance, 0);
  const totalPaid = totalOriginalBalance - totalBalance;
  const averageInterestRate = userDebts.length > 0
    ? userDebts.reduce((sum, d) => sum + d.interestRate, 0) / userDebts.length
    : 0;
  const totalMonthlyMinimum = userDebts
    .filter(d => d.status === "active")
    .reduce((sum, d) => sum + d.minimumPayment, 0);
  const debtsPaidOff = userDebts.filter(d => d.status === "paid_off").length;

  return {
    totalDebts,
    totalBalance,
    totalOriginalBalance,
    totalPaid,
    averageInterestRate,
    totalMonthlyMinimum,
    debtsPaidOff,
  };
}


// ==================== Budget Management Functions ====================

/**
 * Create a budget category
 */
export async function createBudgetCategory(category: InsertBudgetCategory) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create budget category: database not available");
    return null;
  }

  const result = await db.insert(budgetCategories).values(category);
  return result;
}

/**
 * Get all budget categories for a user
 */
export async function getUserBudgetCategories(userId: number, type?: "income" | "expense") {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget categories: database not available");
    return [];
  }

  let query = db
    .select()
    .from(budgetCategories)
    .where(eq(budgetCategories.userId, userId))
    .$dynamic();

  if (type) {
    query = query.where(eq(budgetCategories.type, type));
  }

  const result = await query.orderBy(budgetCategories.sortOrder, budgetCategories.name);
  return result;
}

/**
 * Update a budget category
 */
export async function updateBudgetCategory(categoryId: number, updates: Partial<InsertBudgetCategory>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update budget category: database not available");
    return null;
  }

  const result = await db
    .update(budgetCategories)
    .set(updates)
    .where(eq(budgetCategories.id, categoryId));
  
  return result;
}

/**
 * Delete a budget category
 */
export async function deleteBudgetCategory(categoryId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete budget category: database not available");
    return null;
  }

  const result = await db
    .delete(budgetCategories)
    .where(eq(budgetCategories.id, categoryId));
  
  return result;
}

/**
 * Create a budget transaction
 */
export async function createBudgetTransaction(transaction: InsertBudgetTransaction) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create budget transaction: database not available");
    return null;
  }

  const result = await db.insert(budgetTransactions).values(transaction);
  return result;
}

/**
 * Find duplicate transaction
 */
export async function findDuplicateTransaction(
  userId: number,
  date: string,
  amount: number,
  description: string
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot find duplicate transaction: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(budgetTransactions)
    .where(
      and(
        eq(budgetTransactions.userId, userId),
        eq(budgetTransactions.transactionDate, new Date(date)),
        eq(budgetTransactions.amount, amount),
        eq(budgetTransactions.description, description)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Get budget transactions for a user with optional filters
 */
export async function getUserBudgetTransactions(
  userId: number,
  options?: {
    categoryId?: number;
    startDate?: Date;
    endDate?: Date;
    limit?: number;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget transactions: database not available");
    return [];
  }

  let query = db
    .select()
    .from(budgetTransactions)
    .where(eq(budgetTransactions.userId, userId))
    .$dynamic();

  if (options?.categoryId) {
    query = query.where(eq(budgetTransactions.categoryId, options.categoryId));
  }

  const result = await query
    .orderBy(desc(budgetTransactions.transactionDate))
    .limit(options?.limit || 100);
  
  return result;
}

/**
 * Update a budget transaction
 */
export async function updateBudgetTransaction(transactionId: number, updates: Partial<InsertBudgetTransaction>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update budget transaction: database not available");
    return null;
  }

  const result = await db
    .update(budgetTransactions)
    .set(updates)
    .where(eq(budgetTransactions.id, transactionId));
  
  return result;
}

/**
 * Delete a budget transaction
 */
export async function deleteBudgetTransaction(transactionId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete budget transaction: database not available");
    return null;
  }

  const result = await db
    .delete(budgetTransactions)
    .where(eq(budgetTransactions.id, transactionId));
  
  return result;
}

/**
 * Calculate monthly budget summary for a user
 */
export async function calculateMonthlyBudgetSummary(userId: number, monthYear: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot calculate budget summary: database not available");
    return null;
  }

  // Get all transactions for the month
  const [year, month] = monthYear.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  const transactions = await getUserBudgetTransactions(userId, {
    startDate,
    endDate,
  });

  const categories = await getUserBudgetCategories(userId);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const transaction of transactions) {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      if (category.type === "income") {
        totalIncome += transaction.amount;
      } else {
        totalExpenses += transaction.amount;
      }
    }
  }

  // Get debt payments for the month
  const debtPaymentsList = await db
    .select()
    .from(debtPayments)
    .where(
      and(
        eq(debtPayments.userId, userId),
        // Filter by month (simplified - would need better date filtering in production)
      )
    );

  const totalDebtPayments = debtPaymentsList.reduce((sum, p) => sum + p.amount, 0);

  const netCashFlow = totalIncome - totalExpenses - totalDebtPayments;
  const availableForExtraPayments = Math.max(0, netCashFlow);
  
  const savingsRate = totalIncome > 0 ? Math.round((netCashFlow / totalIncome) * 10000) : 0;
  const debtPaymentRate = totalIncome > 0 ? Math.round((totalDebtPayments / totalIncome) * 10000) : 0;

  // Determine budget health
  let budgetHealth: "excellent" | "good" | "warning" | "critical" = "excellent";
  if (netCashFlow < 0) {
    budgetHealth = "critical";
  } else if (savingsRate < 1000) { // Less than 10% savings
    budgetHealth = "warning";
  } else if (savingsRate < 2000) { // Less than 20% savings
    budgetHealth = "good";
  }

  return {
    totalIncome,
    totalExpenses,
    totalDebtPayments,
    netCashFlow,
    savingsRate,
    debtPaymentRate,
    availableForExtraPayments,
    budgetHealth,
  };
}

/**
 * Save monthly budget summary
 */
export async function saveMonthlyBudgetSummary(summary: InsertMonthlyBudgetSummary) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save budget summary: database not available");
    return null;
  }

  const result = await db.insert(monthlyBudgetSummaries).values(summary);
  return result;
}

/**
 * Get monthly budget summaries for a user
 */
export async function getUserMonthlyBudgetSummaries(userId: number, limit: number = 12) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get budget summaries: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(monthlyBudgetSummaries)
    .where(eq(monthlyBudgetSummaries.userId, userId))
    .orderBy(desc(monthlyBudgetSummaries.monthYear))
    .limit(limit);
  
  return result;
}

/**
 * Get category spending breakdown for a month
 */
export async function getCategorySpendingBreakdown(userId: number, monthYear: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get category breakdown: database not available");
    return [];
  }

  const [year, month] = monthYear.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

  const transactions = await getUserBudgetTransactions(userId, {
    startDate,
    endDate,
  });

  const categories = await getUserBudgetCategories(userId);
  const categoryMap = new Map(categories.map(c => [c.id, c]));

  const breakdown = new Map<number, { category: typeof categories[0], total: number, count: number }>();

  for (const transaction of transactions) {
    const category = categoryMap.get(transaction.categoryId);
    if (category) {
      const existing = breakdown.get(category.id) || { category, total: 0, count: 0 };
      existing.total += transaction.amount;
      existing.count += 1;
      breakdown.set(category.id, existing);
    }
  }

  return Array.from(breakdown.values()).sort((a, b) => b.total - a.total);
}


// ============================================================================
// Financial Goals Functions
// ============================================================================

/**
 * Create a new financial goal
 */
export async function createFinancialGoal(goal: InsertFinancialGoal) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot create goal: database not available");
    return null;
  }

  const result = await db.insert(financialGoals).values(goal);
  return Number(result[0].insertId);
}

/**
 * Get all goals for a user
 */
export async function getUserGoals(userId: number, includeCompleted = false) {
  const maxRetries = 3;
  let lastError: any;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const db = await getDb();
      if (!db) {
        console.warn("[Database] Cannot get goals: database not available");
        return [];
      }

      const conditions = includeCompleted
        ? [eq(financialGoals.userId, userId)]
        : [eq(financialGoals.userId, userId), eq(financialGoals.status, "active")];

      const result = await db
        .select()
        .from(financialGoals)
        .where(and(...conditions))
        .orderBy(desc(financialGoals.priority), desc(financialGoals.createdAt));

      return result;
    } catch (error: any) {
      lastError = error;
      console.error(`[Database] getUserGoals attempt ${attempt} failed:`, error.message);
      
      if (attempt < maxRetries && (error.code === 'ECONNRESET' || error.code === 'PROTOCOL_CONNECTION_LOST')) {
        const delay = Math.pow(2, attempt) * 100;
        console.log(`[Database] Retrying getUserGoals in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        _db = null; // Force reconnection
        continue;
      }
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Get a single goal by ID
 */
export async function getGoalById(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get goal: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(financialGoals)
    .where(eq(financialGoals.id, goalId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Update a financial goal
 */
export async function updateFinancialGoal(goalId: number, updates: Partial<InsertFinancialGoal>) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update goal: database not available");
    return false;
  }

  await db
    .update(financialGoals)
    .set(updates)
    .where(eq(financialGoals.id, goalId));

  return true;
}

/**
 * Delete a financial goal
 */
export async function deleteFinancialGoal(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot delete goal: database not available");
    return false;
  }

  // Delete associated milestones and progress history
  await db.delete(goalMilestones).where(eq(goalMilestones.goalId, goalId));
  await db.delete(goalProgressHistory).where(eq(goalProgressHistory.goalId, goalId));
  
  // Delete the goal
  await db.delete(financialGoals).where(eq(financialGoals.id, goalId));

  return true;
}

/**
 * Record progress update for a goal
 */
export async function recordGoalProgress(
  goalId: number,
  amount: number,
  note?: string,
  source: "manual" | "auto_budget" | "auto_debt" = "manual"
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot record progress: database not available");
    return null;
  }

  // Get current goal
  const goal = await getGoalById(goalId);
  if (!goal) {
    throw new Error("Goal not found");
  }

  const newTotal = goal.currentAmount + amount;

  // Update goal current amount
  await updateFinancialGoal(goalId, { currentAmount: newTotal });

  // Record progress history
  await db.insert(goalProgressHistory).values({
    goalId,
    amount,
    newTotal,
    note,
    source,
    progressDate: new Date(),
  });

  // Check for milestone achievements
  const progressPercentage = Math.floor((newTotal / goal.targetAmount) * 100);
  const milestones = [25, 50, 75, 100];

  for (const milestone of milestones) {
    if (progressPercentage >= milestone) {
      // Check if milestone already exists
      const existing = await db
        .select()
        .from(goalMilestones)
        .where(
          and(
            eq(goalMilestones.goalId, goalId),
            eq(goalMilestones.milestonePercentage, milestone)
          )
        )
        .limit(1);

      if (existing.length === 0) {
        // Create new milestone
        await db.insert(goalMilestones).values({
          goalId,
          milestonePercentage: milestone,
          achievedDate: new Date(),
          celebrationShown: 0,
          message: getMilestoneMessage(milestone, goal.name),
        });
      }
    }
  }

  // Mark goal as completed if target reached
  if (newTotal >= goal.targetAmount && goal.status !== "completed") {
    await updateFinancialGoal(goalId, {
      status: "completed",
      completedAt: new Date(),
    });
  }

  return newTotal;
}

/**
 * Get progress history for a goal
 */
export async function getGoalProgressHistory(goalId: number, limit = 50) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get progress history: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(goalProgressHistory)
    .where(eq(goalProgressHistory.goalId, goalId))
    .orderBy(desc(goalProgressHistory.progressDate))
    .limit(limit);

  return result;
}

/**
 * Get milestones for a goal
 */
export async function getGoalMilestones(goalId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get milestones: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(goalMilestones)
    .where(eq(goalMilestones.goalId, goalId))
    .orderBy(goalMilestones.milestonePercentage);

  return result;
}

/**
 * Mark milestone celebration as shown
 */
export async function markMilestoneCelebrationShown(milestoneId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot mark celebration: database not available");
    return false;
  }

  await db
    .update(goalMilestones)
    .set({ celebrationShown: 1 })
    .where(eq(goalMilestones.id, milestoneId));

  return true;
}

/**
 * Get unshown milestone celebrations for a user
 */
export async function getUnshownCelebrations(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get celebrations: database not available");
    return [];
  }

  const result = await db
    .select({
      milestone: goalMilestones,
      goal: financialGoals,
    })
    .from(goalMilestones)
    .innerJoin(financialGoals, eq(goalMilestones.goalId, financialGoals.id))
    .where(
      and(
        eq(financialGoals.userId, userId),
        eq(goalMilestones.celebrationShown, 0)
      )
    )
    .orderBy(desc(goalMilestones.achievedDate));

  return result;
}

/**
 * Helper function to generate milestone messages
 */
function getMilestoneMessage(percentage: number, goalName: string): string {
  const messages: Record<number, string> = {
    25: `🎉 You're 25% of the way to "${goalName}"! Keep up the great work!`,
    50: `🌟 Halfway there! You've reached 50% of "${goalName}"!`,
    75: `🚀 Amazing! You're 75% complete on "${goalName}"! The finish line is in sight!`,
    100: `🎊 Congratulations! You've achieved "${goalName}"! 🎊`,
  };

  return messages[percentage] || `You've reached ${percentage}% of "${goalName}"!`;
}

// ============================================================================
// Math Tutor Database Helpers
// ============================================================================

/**
 * Get math problems by topic and difficulty
 */
export async function getMathProblems(topic?: string, difficulty?: string, limit: number = 10) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get math problems: database not available");
    return [];
  }

  let query = db.select().from(mathProblems);
  
  const conditions = [];
  if (topic) {
    conditions.push(eq(mathProblems.topic, topic));
  }
  if (difficulty) {
    conditions.push(eq(mathProblems.difficulty, difficulty as any));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const result = await query.limit(limit);
  return result;
}

/**
 * Get a single math problem by ID
 */
export async function getMathProblem(problemId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get math problem: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(mathProblems)
    .where(eq(mathProblems.id, problemId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

/**
 * Save a math problem to the library
 */
export async function saveMathProblem(problem: InsertMathProblem) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save math problem: database not available");
    return null;
  }

  const result = await db.insert(mathProblems).values(problem);
  return (result as any).insertId;
}

/**
 * Save a user's solution attempt
 */
export async function saveMathSolution(solution: InsertMathSolution) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot save solution: database not available");
    return null;
  }

  const result = await db.insert(mathSolutions).values(solution);
  return (result as any).insertId;
}

/**
 * Get user's solution history
 */
export async function getUserMathSolutions(userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get solutions: database not available");
    return [];
  }

  const result = await db
    .select()
    .from(mathSolutions)
    .where(eq(mathSolutions.userId, userId))
    .orderBy(desc(mathSolutions.createdAt))
    .limit(limit);

  return result;
}

/**
 * Get or create user's math progress
 */
export async function getMathProgress(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get math progress: database not available");
    return null;
  }

  const result = await db
    .select()
    .from(mathProgress)
    .where(eq(mathProgress.userId, userId))
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  // Create new progress record
  await db.insert(mathProgress).values({
    userId,
    totalProblemsAttempted: 0,
    totalProblemsSolved: 0,
    topicsExplored: JSON.stringify([]),
    currentStreak: 0,
    longestStreak: 0,
  });

  const newResult = await db
    .select()
    .from(mathProgress)
    .where(eq(mathProgress.userId, userId))
    .limit(1);

  return newResult.length > 0 ? newResult[0] : null;
}

/**
 * Update user's math progress
 */
export async function updateMathProgress(
  userId: number,
  updates: {
    totalProblemsAttempted?: number;
    totalProblemsSolved?: number;
    topicsExplored?: string[];
    currentStreak?: number;
    longestStreak?: number;
    lastPracticeDate?: Date;
  }
) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot update math progress: database not available");
    return false;
  }

  const updateData: any = {};
  
  if (updates.totalProblemsAttempted !== undefined) {
    updateData.totalProblemsAttempted = updates.totalProblemsAttempted;
  }
  if (updates.totalProblemsSolved !== undefined) {
    updateData.totalProblemsSolved = updates.totalProblemsSolved;
  }
  if (updates.topicsExplored !== undefined) {
    updateData.topicsExplored = JSON.stringify(updates.topicsExplored);
  }
  if (updates.currentStreak !== undefined) {
    updateData.currentStreak = updates.currentStreak;
  }
  if (updates.longestStreak !== undefined) {
    updateData.longestStreak = updates.longestStreak;
  }
  if (updates.lastPracticeDate !== undefined) {
    updateData.lastPracticeDate = updates.lastPracticeDate;
  }

  await db
    .update(mathProgress)
    .set(updateData)
    .where(eq(mathProgress.userId, userId));

  return true;
}


// ============================================
// Science Lab Functions
// ============================================

export async function getExperiments(filters?: {
  category?: "physics" | "chemistry" | "biology";
  difficulty?: "beginner" | "intermediate" | "advanced";
  limit?: number;
}) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(experiments);

  if (filters?.category) {
    query = query.where(eq(experiments.category, filters.category)) as any;
  }
  if (filters?.difficulty) {
    query = query.where(eq(experiments.difficulty, filters.difficulty)) as any;
  }

  const results = await query.limit(filters?.limit || 50);
  return results;
}

export async function getExperimentById(experimentId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(experiments)
    .where(eq(experiments.id, experimentId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function getExperimentSteps(experimentId: number) {
  const db = await getDb();
  if (!db) return [];

  const steps = await db
    .select()
    .from(experimentSteps)
    .where(eq(experimentSteps.experimentId, experimentId))
    .orderBy(experimentSteps.stepNumber);

  return steps;
}

export async function saveLabResult(result: InsertUserLabResult) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertResult = await db.insert(userLabResults).values(result);
  return (insertResult as any).insertId as number;
}

export async function getUserLabResults(userId: number, experimentId?: number) {
  const db = await getDb();
  if (!db) return [];

  const conditions = [eq(userLabResults.userId, userId)];
  if (experimentId) {
    conditions.push(eq(userLabResults.experimentId, experimentId));
  }

  const results = await db
    .select()
    .from(userLabResults)
    .where(and(...conditions))
    .orderBy(desc(userLabResults.completedAt))
    .limit(20);

  return results;
}

export async function getScienceProgress(userId: number) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(scienceProgress)
    .where(eq(scienceProgress.userId, userId))
    .limit(1);

  return result.length > 0 ? result[0] : null;
}

export async function initializeScienceProgress(userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(scienceProgress).values({ userId });
  return true;
}

export async function updateScienceProgress(
  userId: number,
  updates: Partial<InsertScienceProgress>
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const updateData: any = {};

  if (updates.totalExperimentsCompleted !== undefined) {
    updateData.totalExperimentsCompleted = updates.totalExperimentsCompleted;
  }
  if (updates.physicsExperiments !== undefined) {
    updateData.physicsExperiments = updates.physicsExperiments;
  }
  if (updates.chemistryExperiments !== undefined) {
    updateData.chemistryExperiments = updates.chemistryExperiments;
  }
  if (updates.biologyExperiments !== undefined) {
    updateData.biologyExperiments = updates.biologyExperiments;
  }
  if (updates.averageGrade !== undefined) {
    updateData.averageGrade = updates.averageGrade;
  }
  if (updates.totalLabTime !== undefined) {
    updateData.totalLabTime = updates.totalLabTime;
  }
  if (updates.safetyScore !== undefined) {
    updateData.safetyScore = updates.safetyScore;
  }
  if (updates.lastExperimentDate !== undefined) {
    updateData.lastExperimentDate = updates.lastExperimentDate;
  }

  await db
    .update(scienceProgress)
    .set(updateData)
    .where(eq(scienceProgress.userId, userId));

  return true;
}

// ============================================================================
// Lab Quiz Functions
// ============================================================================

export async function getLabQuizQuestions(experimentId: number) {
  const db = await getDb();
  if (!db) return [];

  const questions = await db
    .select()
    .from(labQuizQuestions)
    .where(eq(labQuizQuestions.experimentId, experimentId));

  return questions;
}

export async function saveLabQuizQuestions(questions: InsertLabQuizQuestion[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.insert(labQuizQuestions).values(questions);
  return true;
}

export async function saveLabQuizAttempt(attempt: InsertLabQuizAttempt) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(labQuizAttempts).values(attempt);
  return result;
}

export async function getLabQuizAttempts(userId: number, experimentId?: number) {
  const db = await getDb();
  if (!db) return [];

  if (experimentId) {
    const attempts = await db
      .select()
      .from(labQuizAttempts)
      .where(
        and(
          eq(labQuizAttempts.userId, userId),
          eq(labQuizAttempts.experimentId, experimentId)
        )
      )
      .orderBy(desc(labQuizAttempts.attemptedAt));
    return attempts;
  }

  const attempts = await db
    .select()
    .from(labQuizAttempts)
    .where(eq(labQuizAttempts.userId, userId))
    .orderBy(desc(labQuizAttempts.attemptedAt));
  return attempts;
}

export async function hasPassedLabQuiz(userId: number, experimentId: number): Promise<boolean> {
  const db = await getDb();
  if (!db) return false;

  const passed = await db
    .select()
    .from(labQuizAttempts)
    .where(
      and(
        eq(labQuizAttempts.userId, userId),
        eq(labQuizAttempts.experimentId, experimentId),
        eq(labQuizAttempts.passed, 1)
      )
    )
    .limit(1);

  return passed.length > 0;
}


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


// ============================================================================
// Fact Access Tracking & Notification Functions
// ============================================================================

/**
 * Log when a user accesses a verified fact
 */
export async function logFactAccess(userId: number, verifiedFactId: number, fact: VerifiedFact, source: 'voice_assistant' | 'learning_hub') {
  const db = await getDb();
  if (!db) return;
  
  // Create a snapshot of the fact for version tracking
  const factVersion = JSON.stringify({
    answer: fact.answer,
    confidenceScore: fact.confidenceScore,
    sources: fact.sources,
    verifiedAt: fact.verifiedAt
  });
  
  await db.insert(factAccessLog).values({
    userId,
    verifiedFactId,
    factVersion,
    accessSource: source,
  });
}

/**
 * Create notifications for users who accessed an old version of a fact
 */
export async function createFactUpdateNotifications(oldFact: VerifiedFact, newFact: VerifiedFact) {
  const db = await getDb();
  if (!db) return;
  
  // Find all users who accessed the old version
  const accessLogs = await db
    .select()
    .from(factAccessLog)
    .where(eq(factAccessLog.verifiedFactId, oldFact.id));
  
  // Get unique user IDs
  const userIds = Array.from(new Set(accessLogs.map(log => log.userId)));
  
  const oldVersion = JSON.stringify({
    answer: oldFact.answer,
    confidenceScore: oldFact.confidenceScore,
    sources: oldFact.sources,
    verifiedAt: oldFact.verifiedAt
  });
  
  const newVersion = JSON.stringify({
    answer: newFact.answer,
    confidenceScore: newFact.confidenceScore,
    sources: newFact.sources,
    verifiedAt: newFact.verifiedAt
  });
  
  // Create notifications for each user
  const notifications: InsertFactUpdateNotification[] = userIds.map(userId => ({
    userId,
    verifiedFactId: oldFact.id,
    oldVersion,
    newVersion,
    title: 'Fact Update Available',
    message: `The answer to "${oldFact.question}" has been updated with new information.`,
  }));
  
  if (notifications.length > 0) {
    await db.insert(factUpdateNotifications).values(notifications);
  }
  
  return notifications.length;
}

/**
 * Get unread notifications for a user
 */
export async function getUserNotifications(userId: number, includeRead: boolean = false) {
  const db = await getDb();
  if (!db) return [];
  
  const conditions = [
    eq(factUpdateNotifications.userId, userId),
    eq(factUpdateNotifications.isDismissed, 0)
  ];
  
  if (!includeRead) {
    conditions.push(eq(factUpdateNotifications.isRead, 0));
  }
  
  const notifications = await db
    .select()
    .from(factUpdateNotifications)
    .where(and(...conditions))
    .orderBy(desc(factUpdateNotifications.createdAt))
    .limit(50);
  
  return notifications;
}

/**
 * Mark notification as read
 */
export async function markNotificationAsRead(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(factUpdateNotifications)
    .set({
      isRead: 1,
      readAt: new Date()
    })
    .where(
      and(
        eq(factUpdateNotifications.id, notificationId),
        eq(factUpdateNotifications.userId, userId)
      )
    );
  
  return true;
}

/**
 * Dismiss notification
 */
export async function dismissNotification(notificationId: number, userId: number) {
  const db = await getDb();
  if (!db) return false;
  
  await db
    .update(factUpdateNotifications)
    .set({
      isDismissed: 1,
      dismissedAt: new Date()
    })
    .where(
      and(
        eq(factUpdateNotifications.id, notificationId),
        eq(factUpdateNotifications.userId, userId)
      )
    );
  
  return true;
}

/**
 * Get unread notification count for a user
 */
export async function getUnreadNotificationCount(userId: number): Promise<number> {
  const db = await getDb();
  if (!db) return 0;
  
  const notifications = await db
    .select()
    .from(factUpdateNotifications)
    .where(
      and(
        eq(factUpdateNotifications.userId, userId),
        eq(factUpdateNotifications.isRead, 0),
        eq(factUpdateNotifications.isDismissed, 0)
      )
    );
  
  return notifications.length;
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


// ============================================
// Topic Progress Functions (Learn-Practice-Quiz System)
// ============================================

/**
 * Get or create topic progress for a user
 */
export async function getTopicProgress(userId: number, topicName: string, category: string) {
  const db = await getDb();
  if (!db) return null;

  const result = await db
    .select()
    .from(topicProgress)
    .where(
      and(
        eq(topicProgress.userId, userId),
        eq(topicProgress.topicName, topicName),
        eq(topicProgress.category, category)
      )
    )
    .limit(1);

  if (result.length > 0) {
    return result[0];
  }

  // Create initial progress record
  await db.insert(topicProgress).values({
    userId,
    topicName,
    category,
    status: "not_started",
    lessonCompleted: 0,
    practiceCount: 0,
    quizzesTaken: 0,
    bestQuizScore: 0,
    masteryLevel: 0,
  });

  const newResult = await db
    .select()
    .from(topicProgress)
    .where(
      and(
        eq(topicProgress.userId, userId),
        eq(topicProgress.topicName, topicName),
        eq(topicProgress.category, category)
      )
    )
    .limit(1);

  return newResult[0] || null;
}

/**
 * Update topic progress
 */
export async function updateTopicProgress(
  userId: number,
  topicName: string,
  category: string,
  updates: {
    status?: "not_started" | "learning" | "practicing" | "mastered";
    lessonCompleted?: number;
    practiceCount?: number;
    quizzesTaken?: number;
    bestQuizScore?: number;
    masteryLevel?: number;
  }
) {
  const db = await getDb();
  if (!db) return false;

  const updateData: any = {};

  if (updates.status !== undefined) updateData.status = updates.status;
  if (updates.lessonCompleted !== undefined) updateData.lessonCompleted = updates.lessonCompleted;
  if (updates.practiceCount !== undefined) updateData.practiceCount = updates.practiceCount;
  if (updates.quizzesTaken !== undefined) updateData.quizzesTaken = updates.quizzesTaken;
  if (updates.bestQuizScore !== undefined) updateData.bestQuizScore = updates.bestQuizScore;
  if (updates.masteryLevel !== undefined) updateData.masteryLevel = updates.masteryLevel;

  updateData.lastStudied = new Date();

  await db
    .update(topicProgress)
    .set(updateData)
    .where(
      and(
        eq(topicProgress.userId, userId),
        eq(topicProgress.topicName, topicName),
        eq(topicProgress.category, category)
      )
    );

  return true;
}

/**
 * Get all topic progress for a category
 */
export async function getCategoryProgress(userId: number, category: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(topicProgress)
    .where(
      and(
        eq(topicProgress.userId, userId),
        eq(topicProgress.category, category)
      )
    );

  return results;
}

/**
 * Save quiz result
 */
export async function saveQuizResult(result: {
  userId: number;
  topicName: string;
  category: string;
  quizType: "quick_check" | "topic_quiz" | "mixed_review";
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  timeSpent?: number;
  weakAreas?: string[];
  answers?: any[];
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertData: any = {
    userId: result.userId,
    topicName: result.topicName,
    category: result.category,
    quizType: result.quizType,
    score: result.score,
    totalQuestions: result.totalQuestions,
    correctAnswers: result.correctAnswers,
    timeSpent: result.timeSpent || null,
    weakAreas: result.weakAreas ? JSON.stringify(result.weakAreas) : null,
    answers: result.answers ? JSON.stringify(result.answers) : null,
  };

  const insertResult = await db.insert(topicQuizResults).values(insertData);
  return (insertResult as any).insertId as number;
}

/**
 * Get quiz results for a topic
 */
export async function getQuizResults(userId: number, topicName: string, category: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(topicQuizResults)
    .where(
      and(
        eq(topicQuizResults.userId, userId),
        eq(topicQuizResults.topicName, topicName),
        eq(topicQuizResults.category, category)
      )
    )
    .orderBy(desc(topicQuizResults.createdAt))
    .limit(10);

  return results;
}

/**
 * Save practice session
 */
export async function savePracticeSession(session: {
  userId: number;
  topicName: string;
  category: string;
  problemsSolved: number;
  problemsCorrect: number;
  accuracy: number;
  hintsUsed: number;
  duration?: number;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertResult = await db.insert(practiceSessions).values({
    userId: session.userId,
    topicName: session.topicName,
    category: session.category,
    problemsSolved: session.problemsSolved,
    problemsCorrect: session.problemsCorrect,
    accuracy: session.accuracy,
    hintsUsed: session.hintsUsed,
    duration: session.duration || null,
  });

  return (insertResult as any).insertId as number;
}

/**
 * Get practice sessions for a topic
 */
export async function getPracticeSessions(userId: number, topicName: string, category: string) {
  const db = await getDb();
  if (!db) return [];

  const results = await db
    .select()
    .from(practiceSessions)
    .where(
      and(
        eq(practiceSessions.userId, userId),
        eq(practiceSessions.topicName, topicName),
        eq(practiceSessions.category, category)
      )
    )
    .orderBy(desc(practiceSessions.completedAt))
    .limit(10);

  return results;
}

// ========================================
// Translate Conversation Functions
// ========================================

import {
  translateConversations,
  translateConversationParticipants,
  translateMessages,
  translateMessageTranslations,
  type InsertTranslateConversation,
  type InsertTranslateConversationParticipant,
  type InsertTranslateMessage,
  type InsertTranslateMessageTranslation,
} from "../drizzle/schema";

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

/**
 * Create a new translate conversation
 */
export async function createTranslateConversation(creatorId: number, title?: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const shareableCode = generateShareableCode();
  
  const insertResult = await db.insert(translateConversations).values({
    shareableCode,
    creatorId,
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
  userId: number,
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
    conversationId: conversationId as number,
    userId: userId as number,
    preferredLanguage: preferredLanguage as string,
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
export async function isUserParticipant(conversationId: number, userId: number) {
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
  senderId: number,
  originalText: string,
  originalLanguage: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const insertResult = await db.insert(translateMessages).values({
    conversationId,
    senderId,
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
  userId: number,
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
export async function getMessageTranslation(messageId: number, userId: number) {
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
export async function getUserTranslateConversations(userId: number) {
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
export async function removeConversationParticipant(conversationId: number, userId: number) {
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

// ==================== Learning Badge Functions ====================

import { learningBadges, userLearningBadges, InsertUserLearningBadge } from "../drizzle/schema";

/**
 * Get all available learning badges
 */
export async function getAllLearningBadges() {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get badges: database not available");
    return [];
  }

  const badges = await db.select().from(learningBadges);
  return badges;
}

/**
 * Get user's earned badges
 */
export async function getUserBadges(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user badges: database not available");
    return [];
  }

  const earnedBadges = await db
    .select({
      badge: learningBadges,
      earnedAt: userLearningBadges.earnedAt,
    })
    .from(userLearningBadges)
    .innerJoin(learningBadges, eq(userLearningBadges.badgeId, learningBadges.id))
    .where(eq(userLearningBadges.userId, userId))
    .orderBy(desc(userLearningBadges.earnedAt));

  return earnedBadges;
}

/**
 * Award a badge to a user
 */
export async function awardBadge(userId: number, badgeId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot award badge: database not available");
    return null;
  }

  try {
    // Check if user already has this badge
    const existing = await db
      .select()
      .from(userLearningBadges)
      .where(and(eq(userLearningBadges.userId, userId), eq(userLearningBadges.badgeId, badgeId)))
      .limit(1);

    if (existing.length > 0) {
      return null; // Already has this badge
    }

    // Award the badge
    await db.insert(userLearningBadges).values({
      userId,
      badgeId,
    });

    // Return the badge details
    const badge = await db
      .select()
      .from(learningBadges)
      .where(eq(learningBadges.id, badgeId))
      .limit(1);

    return badge[0];
  } catch (error) {
    console.error("[Database] Failed to award badge:", error);
    return null;
  }
}

/**
 * Check and award badges based on user's progress
 * This function should be called after quiz/assessment submissions
 */
export async function checkAndAwardBadges(userId: number) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check badges: database not available");
    return [];
  }

  const newlyAwardedBadges: any[] = [];

  try {
    // Get all badge definitions
    const allBadges = await getAllLearningBadges();
    
    // Get user's already earned badges
    const earnedBadges = await getUserBadges(userId);
    const earnedBadgeIds = earnedBadges.map(eb => eb.badge.id);

    // Check each badge criteria
    for (const badge of allBadges) {
      // Skip if already earned
      if (earnedBadgeIds.includes(badge.id)) {
        continue;
      }

      const criteria = typeof badge.criteria === 'string' ? JSON.parse(badge.criteria) : badge.criteria;
      let shouldAward = false;

      // Check badge criteria (this will be expanded based on actual criteria types)
      // For now, we'll implement basic checks
      
      // Note: Full implementation would require querying Supabase for article/quiz/assessment data
      // This is a placeholder structure that should be expanded

      if (shouldAward) {
        const awardedBadge = await awardBadge(userId, badge.id);
        if (awardedBadge) {
          newlyAwardedBadges.push(awardedBadge);
        }
      }
    }

    return newlyAwardedBadges;
  } catch (error) {
    console.error("[Database] Failed to check and award badges:", error);
    return [];
  }
}


// ============================================================================
// Hub Trial Management Functions
// ============================================================================

/**
 * Start a 5-day free trial for a specialized hub
 * Free tier users can trial each hub once
 */
export async function startHubTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<HubTrial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot start hub trial: database not available");
    return null;
  }

  try {
    // Check if user already has a trial for this hub
    const existingTrial = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    if (existingTrial.length > 0) {
      console.warn(`[Database] User ${userId} already has a trial for ${hubId}`);
      return null;
    }

    // Calculate expiration date (5 days from now)
    const startedAt = new Date();
    const expiresAt = new Date(startedAt);
    expiresAt.setDate(expiresAt.getDate() + 5);

    // Create trial record
    const trialData: InsertHubTrial = {
      userId,
      hubId,
      status: "active",
      startedAt,
      expiresAt,
    };

    await db.insert(hubTrials).values(trialData);

    // Fetch and return the created trial
    const createdTrial = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    console.log(`[Database] Started 5-day trial for user ${userId} on ${hubId}`);
    return createdTrial[0] || null;
  } catch (error) {
    console.error("[Database] Failed to start hub trial:", error);
    return null;
  }
}

/**
 * Get active trial for a specific hub
 * Returns null if no active trial exists
 */
export async function getActiveTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<HubTrial | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get active trial: database not available");
    return null;
  }

  try {
    const trials = await db
      .select()
      .from(hubTrials)
      .where(
        and(
          eq(hubTrials.userId, userId),
          eq(hubTrials.hubId, hubId),
          eq(hubTrials.status, "active")
        )
      )
      .limit(1);

    if (trials.length === 0) {
      return null;
    }

    const trial = trials[0];
    const now = new Date();

    // Check if trial has expired
    if (trial.expiresAt < now) {
      // Mark as expired
      await db
        .update(hubTrials)
        .set({ status: "expired", updatedAt: new Date() })
        .where(eq(hubTrials.id, trial.id));

      return null;
    }

    return trial;
  } catch (error) {
    console.error("[Database] Failed to get active trial:", error);
    return null;
  }
}

/**
 * Get all trials for a user (active and expired)
 */
export async function getUserTrials(userId: number): Promise<HubTrial[]> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user trials: database not available");
    return [];
  }

  try {
    const trials = await db
      .select()
      .from(hubTrials)
      .where(eq(hubTrials.userId, userId));

    return trials;
  } catch (error) {
    console.error("[Database] Failed to get user trials:", error);
    return [];
  }
}

/**
 * Check if user can start a trial for a hub
 * Returns false if they've already used their trial
 */
export async function canStartTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot check trial eligibility: database not available");
    return false;
  }

  try {
    const existingTrials = await db
      .select()
      .from(hubTrials)
      .where(and(eq(hubTrials.userId, userId), eq(hubTrials.hubId, hubId)))
      .limit(1);

    // Can start trial if no previous trial exists
    return existingTrials.length === 0;
  } catch (error) {
    console.error("[Database] Failed to check trial eligibility:", error);
    return false;
  }
}

/**
 * Mark trial as converted (user upgraded to paid tier)
 */
export async function convertTrial(
  userId: number,
  hubId: "money" | "wellness" | "translation_hub" | "learning"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot convert trial: database not available");
    return false;
  }

  try {
    await db
      .update(hubTrials)
      .set({ status: "converted", updatedAt: new Date() })
      .where(
        and(
          eq(hubTrials.userId, userId),
          eq(hubTrials.hubId, hubId)
        )
      );

    console.log(`[Database] Converted trial for user ${userId} on ${hubId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to convert trial:", error);
    return false;
  }
}


/**
 * Get or create today's usage record for a user
 */
export async function getTodayUsage(userId: number): Promise<DailyUsage | null> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get today's usage: database not available");
    return null;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const existing = await db
      .select()
      .from(dailyUsage)
      .where(
        and(
          eq(dailyUsage.userId, userId),
          gte(dailyUsage.date, today)
        )
      )
      .limit(1);

    if (existing.length > 0) {
      return existing[0];
    }

    // Create new record for today
    const [newRecord] = await db
      .insert(dailyUsage)
      .values({
        userId,
        date: today,
        voiceAssistantCount: 0,
        verifiedLearningCount: 0,
        mathTutorCount: 0,
        translateCount: 0,
        imageOcrCount: 0,
      });

    const created = await db
      .select()
      .from(dailyUsage)
      .where(eq(dailyUsage.id, newRecord.insertId))
      .limit(1);

    return created[0] || null;
  } catch (error) {
    console.error("[Database] Failed to get today's usage:", error);
    return null;
  }
}

/**
 * Increment usage count for a specific feature
 */
export async function incrementUsage(
  userId: number,
  featureType: "voice_chat" | "translation" | "image_translation" | "learning_session"
): Promise<boolean> {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot increment usage: database not available");
    return false;
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Get or create today's record
    let usage = await getTodayUsage(userId);
    if (!usage) {
      return false;
    }

    // Increment the appropriate counter based on feature type
    if (featureType === "voice_chat") {
      await db
        .update(dailyUsage)
        .set({
          voiceAssistantCount: sql`${dailyUsage.voiceAssistantCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "translation") {
      await db
        .update(dailyUsage)
        .set({
          translateCount: sql`${dailyUsage.translateCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "image_translation") {
      await db
        .update(dailyUsage)
        .set({
          imageOcrCount: sql`${dailyUsage.imageOcrCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    } else if (featureType === "learning_session") {
      await db
        .update(dailyUsage)
        .set({
          verifiedLearningCount: sql`${dailyUsage.verifiedLearningCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(dailyUsage.id, usage.id));
    }

    console.log(`[Database] Incremented ${featureType} usage for user ${userId}`);
    return true;
  } catch (error) {
    console.error("[Database] Failed to increment usage:", error);
    return false;
  }
}
