import { eq, and, desc } from "drizzle-orm";
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
  InsertLabQuizAttempt
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
