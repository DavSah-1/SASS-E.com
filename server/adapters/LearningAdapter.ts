/**
 * LearningAdapter Interface
 * 
 * Unified interface for learning operations across MySQL (admin) and Supabase (user) databases.
 */

export interface LearningAdapter {
  // Learning Sessions
  saveLearningSession(session: any): Promise<void>;
  getUserLearningSessions(userId: number, limit?: number): Promise<any[]>;
  saveLearningSource(source: any): Promise<void>;

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
}
