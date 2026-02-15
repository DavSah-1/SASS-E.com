/**
 * LearningAdapter Interface
 * 
 * Unified interface for learning operations across MySQL (admin) and Supabase (user) databases.
 */

export interface LearningAdapter {
  // Learning Sessions
  saveLearningSession(session: any): Promise<any>;
  getUserLearningSessions(userId: number, limit?: number): Promise<any[]>;
  saveLearningSource(source: any): Promise<any>;
  
  // Fact Checking
  saveFactCheckResult(result: any): Promise<any>;
  getFactCheckResultsBySession(sessionId: number): Promise<any[]>;
  
  // Study Guides
  saveStudyGuide(guide: any): Promise<any>;
  getUserStudyGuides(userId: number): Promise<any[]>;
  
  // Quizzes
  saveQuiz(quiz: any): Promise<any>;
  getUserQuizzes(userId: number): Promise<any[]>;
  saveQuizAttempt(attempt: any): Promise<any>;
  getUserQuizAttempts(userId: number, quizId?: number): Promise<any[]>;

  // Vocabulary Progress
  getUserVocabularyProgress(userId: number, language: string): Promise<any[]>;
  saveUserVocabularyProgress(progress: any): Promise<void>;

  // Grammar Lessons
  getGrammarLessons(language: string, difficulty?: string): Promise<any[]>;
  getUserGrammarProgress(userId: number, language: string): Promise<any[]>;
  saveUserGrammarProgress(progress: any): Promise<void>;

  // Language Progress
  getUserLanguageProgress(userId: number, language: string): Promise<any | undefined>;
  upsertUserLanguageProgress(progress: any): Promise<void>;

  // Daily Lessons
  getDailyLesson(userId: number, language: string, lessonDate: Date): Promise<any | undefined>;
  saveDailyLesson(lesson: any): Promise<void>;

  // Math Progress
  getMathProgress(userId: number): Promise<any | undefined>;
  updateMathProgress(userId: number, updates: any): Promise<void>;

  // Science Progress
  getScienceProgress(userId: number): Promise<any | undefined>;
  initializeScienceProgress(userId: number): Promise<void>;
  updateScienceProgress(userId: number, updates: any): Promise<void>;

  // Goal Progress
  recordGoalProgress(progress: any): Promise<void>;
  getGoalProgressHistory(goalId: number, limit?: number): Promise<any[]>;

  // Topic Progress
  getTopicProgress(userId: number, topicName: string, category: string): Promise<any | undefined>;
  getCategoryProgress(userId: number, category: string): Promise<any[]>;
  
  // Vocabulary & Exercises
  getVocabularyItems(language: string, difficulty?: string, limit?: number): Promise<any[]>;
  getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit?: number): Promise<any[]>;
  saveExerciseAttempt(attempt: any): Promise<number>;
  
  // Achievements
  getUserAchievements(userId: number, language?: string): Promise<any[]>;
  
  // Topic Progress Updates
  updateTopicProgress(userId: number, topicName: string, category: string, updates: any): Promise<void>;
  savePracticeSession(session: any): Promise<void>;
  saveQuizResult(result: any): Promise<void>;
  getQuizResults(userId: number, topicName: string, category: string, limit?: number): Promise<any[]>;
  getPracticeSessions(userId: number, topicName: string, category: string, limit?: number): Promise<any[]>;
  
  // Math Operations
  getMathProblems(topic?: string, difficulty?: string, limit?: number): Promise<any[]>;
  getMathProblem(problemId: number): Promise<any | undefined>;
  saveMathProblem(problem: any): Promise<number>;
  saveMathSolution(solution: any): Promise<number>;
  getUserMathSolutions(userId: number, limit?: number): Promise<any[]>;
  
  // Science Operations
  getExperiments(filters: any): Promise<any[]>;
  getExperimentById(experimentId: number): Promise<any | undefined>;
  getExperimentSteps(experimentId: number): Promise<any[]>;
  saveLabResult(result: any): Promise<number>;
  getUserLabResults(userId: number, experimentId?: number): Promise<any[]>;
}
