/**
 * MysqlLanguageLearningAdapter
 * 
 * MySQL implementation of LanguageLearningAdapter - delegates to MysqlLearningAdapter
 */

import { MysqlLearningAdapter } from './MysqlLearningAdapter';
import type { LanguageLearningAdapter } from './LanguageLearningAdapter';

export class MysqlLanguageLearningAdapter implements LanguageLearningAdapter {
  private learningAdapter: MysqlLearningAdapter;

  constructor() {
    this.learningAdapter = new MysqlLearningAdapter();
  }

  async getUserVocabularyProgress(userId: number, language: string): Promise<any[]> {
    return this.learningAdapter.getUserVocabularyProgress(userId, language);
  }

  async saveUserVocabularyProgress(progress: any): Promise<void> {
    return this.learningAdapter.saveUserVocabularyProgress(progress);
  }

  async getVocabularyItems(language: string, difficulty?: string, limit?: number): Promise<any[]> {
    return this.learningAdapter.getVocabularyItems(language, difficulty, limit);
  }

  async getGrammarLessons(language: string, difficulty?: string): Promise<any[]> {
    return this.learningAdapter.getGrammarLessons(language, difficulty);
  }

  async getUserGrammarProgress(userId: number, language: string): Promise<any[]> {
    return this.learningAdapter.getUserGrammarProgress(userId, language);
  }

  async getUserLanguageProgress(userId: number, language: string): Promise<any | undefined> {
    return this.learningAdapter.getUserLanguageProgress(userId, language);
  }

  async upsertUserLanguageProgress(progress: any): Promise<void> {
    return this.learningAdapter.upsertUserLanguageProgress(progress);
  }

  async getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit?: number): Promise<any[]> {
    return this.learningAdapter.getLanguageExercises(language, exerciseType, difficulty, limit);
  }

  async saveExerciseAttempt(attempt: any): Promise<number> {
    return this.learningAdapter.saveExerciseAttempt(attempt);
  }

  async getDailyLesson(userId: number, language: string, lessonDate: Date): Promise<any | undefined> {
    return this.learningAdapter.getDailyLesson(userId, language, lessonDate);
  }

  async saveDailyLesson(lesson: any): Promise<void> {
    return this.learningAdapter.saveDailyLesson(lesson);
  }

  async getUserAchievements(userId: number, language?: string): Promise<any[]> {
    return this.learningAdapter.getUserAchievements(userId, language);
  }
}
