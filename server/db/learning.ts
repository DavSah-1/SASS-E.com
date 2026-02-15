import { and, desc, eq, or } from "drizzle-orm";
import {
  InsertDailyLesson,
  InsertExerciseAttempt,
  InsertFactCheckResult,
  InsertLabQuizAttempt,
  InsertLabQuizQuestion,
  InsertLanguageAchievement,
  InsertLearningSession,
  InsertLearningSource,
  InsertMathProblem,
  InsertMathSolution,
  InsertQuiz,
  InsertQuizAttempt,
  InsertScienceProgress,
  InsertStudyGuide,
  InsertUserGrammarProgress,
  InsertUserLabResult,
  InsertUserLanguageProgress,
  InsertUserVocabulary,
  dailyLessons,
  exerciseAttempts,
  experimentSteps,
  experiments,
  factCheckResults,
  grammarLessons,
  labQuizAttempts,
  labQuizQuestions,
  languageAchievements,
  languageExercises,
  learningBadges,
  learningSessions,
  learningSources,
  mathProblems,
  mathProgress,
  mathSolutions,
  practiceSessions,
  quizAttempts,
  quizzes,
  scienceProgress,
  studyGuides,
  topicProgress,
  topicQuizResults,
  userGrammarProgress,
  userLabResults,
  userLanguageProgress,
  userLearningBadges,
  userVocabulary,
  vocabularyItems,
} from "../../drizzle/schema";
import { getDb } from "./connection";





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
  if (!db) return null;

  // Convert topicsExplored array to JSON string if present
  const dbUpdates: any = { ...updates };
  if (updates.topicsExplored) {
    dbUpdates.topicsExplored = JSON.stringify(updates.topicsExplored);
  }

  await db
    .update(mathProgress)
    .set(dbUpdates)
    .where(eq(mathProgress.userId, userId));

  const updated = await db
    .select()
    .from(mathProgress)
    .where(eq(mathProgress.userId, userId))
    .limit(1);

  return updated.length > 0 ? updated[0] : null;
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
  if (!db) return null;

  await db
    .update(topicProgress)
    .set(updates)
    .where(
      and(
        eq(topicProgress.userId, userId),
        eq(topicProgress.topicName, topicName),
        eq(topicProgress.category, category)
      )
    );

  const updated = await db
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

  return updated.length > 0 ? updated[0] : null;
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
