/**
 * LanguageLearningAdapter Interface
 * 
 * Specialized adapter for language learning operations (vocabulary, grammar, exercises, daily lessons).
 * Covers 9 tables: vocabularyItems, userVocabulary, grammarLessons, userGrammarProgress,
 * languageExercises, exerciseAttempts, userLanguageProgress, dailyLessons, languageAchievements
 */

export interface LanguageLearningAdapter {
  // Vocabulary Progress
  getUserVocabularyProgress(userId: number, language: string): Promise<any[]>;
  saveUserVocabularyProgress(progress: any): Promise<void>;
  getVocabularyItems(language: string, difficulty?: string, limit?: number): Promise<any[]>;

  // Grammar Lessons
  getGrammarLessons(language: string, difficulty?: string): Promise<any[]>;
  getUserGrammarProgress(userId: number, language: string): Promise<any[]>;

  // Language Progress
  getUserLanguageProgress(userId: number, language: string): Promise<any | undefined>;
  upsertUserLanguageProgress(progress: any): Promise<void>;

  // Language Exercises
  getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit?: number): Promise<any[]>;
  saveExerciseAttempt(attempt: any): Promise<number>;

  // Daily Lessons
  getDailyLesson(userId: number, language: string, lessonDate: Date): Promise<any | undefined>;
  saveDailyLesson(lesson: any): Promise<void>;

  // Achievements
  getUserAchievements(userId: number, language?: string): Promise<any[]>;
}
