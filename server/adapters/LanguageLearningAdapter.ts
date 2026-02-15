/**
 * LanguageLearningAdapter
 * 
 * Handles language learning operations across dual-database architecture.
 * Covers 10 tables: vocabularyItems, userVocabulary, grammarLessons, userGrammarProgress,
 * languageExercises, exerciseAttempts, userLanguageProgress, dailyLessons, languageAchievements
 */

export interface LanguageLearningAdapter {
  // Vocabulary operations
  getVocabularyItems(language: string, difficulty?: string): Promise<any[]>;
  getUserVocabulary(userId: number): Promise<any[]>;
  addVocabularyItem(userId: number, vocabularyId: number): Promise<any>;
  updateVocabularyProgress(userId: number, vocabularyId: number, isCorrect: boolean): Promise<void>;

  // Grammar operations
  getGrammarLessons(language: string, difficulty?: string): Promise<any[]>;
  getUserGrammarProgress(userId: number): Promise<any[]>;
  markGrammarLessonComplete(userId: number, lessonId: number, score: number): Promise<void>;

  // Exercise operations
  getLanguageExercises(language: string, type?: string, difficulty?: string): Promise<any[]>;
  submitExerciseAttempt(userId: number, exerciseId: number, userAnswer: string, isCorrect: boolean): Promise<void>;
  getExerciseAttempts(userId: number, exerciseId?: number): Promise<any[]>;

  // Progress tracking
  getUserLanguageProgress(userId: number, language?: string): Promise<any[]>;
  updateLanguageProgress(userId: number, language: string, updates: any): Promise<void>;

  // Daily lessons
  getDailyLesson(userId: number, language: string, date: Date): Promise<any | null>;
  markDailyLessonComplete(userId: number, lessonId: number): Promise<void>;

  // Achievements
  getLanguageAchievements(userId: number, language?: string): Promise<any[]>;
  awardAchievement(userId: number, language: string, achievementType: string, achievementName: string): Promise<void>;
}
