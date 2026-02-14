/**
 * MysqlLearningAdapter
 * 
 * MySQL implementation of LearningAdapter - delegates to db.ts functions
 */

import * as db from '../db';
import type { LearningAdapter } from './LearningAdapter';

export class MysqlLearningAdapter implements LearningAdapter {
  async saveLearningSession(session: any): Promise<void> {
    await db.saveLearningSession(session);
  }

  async getUserLearningSessions(userId: number, limit: number = 50): Promise<any[]> {
    return db.getUserLearningSessions(userId, limit);
  }

  async saveLearningSource(source: any): Promise<void> {
    await db.saveLearningSource(source);
  }

  async getUserVocabularyProgress(userId: number, language: string): Promise<any[]> {
    return db.getUserVocabularyProgress(userId, language);
  }

  async saveUserVocabularyProgress(progress: any): Promise<void> {
    await db.saveUserVocabularyProgress(progress);
  }

  async getGrammarLessons(language: string, difficulty?: string): Promise<any[]> {
    return db.getGrammarLessons(language, difficulty);
  }

  async getUserGrammarProgress(userId: number, language: string): Promise<any[]> {
    return db.getUserGrammarProgress(userId, language);
  }

  async saveUserGrammarProgress(progress: any): Promise<void> {
    await db.saveUserGrammarProgress(progress);
  }

  async getUserLanguageProgress(userId: number, language: string): Promise<any | undefined> {
    return db.getUserLanguageProgress(userId, language);
  }

  async upsertUserLanguageProgress(progress: any): Promise<void> {
    await db.upsertUserLanguageProgress(progress);
  }

  async getDailyLesson(userId: number, language: string, lessonDate: Date): Promise<any | undefined> {
    return db.getDailyLesson(userId, language, lessonDate);
  }

  async saveDailyLesson(lesson: any): Promise<void> {
    await db.saveDailyLesson(lesson);
  }

  async getMathProgress(userId: number): Promise<any | undefined> {
    return db.getMathProgress(userId);
  }

  async updateMathProgress(userId: number, updates: any): Promise<void> {
    await db.updateMathProgress(userId, updates);
  }

  async getScienceProgress(userId: number): Promise<any | undefined> {
    return db.getScienceProgress(userId);
  }

  async initializeScienceProgress(userId: number): Promise<void> {
    await db.initializeScienceProgress(userId);
  }

  async updateScienceProgress(userId: number, updates: any): Promise<void> {
    await db.updateScienceProgress(userId, updates);
  }

  async recordGoalProgress(progress: any): Promise<void> {
    await db.recordGoalProgress(
      progress.goalId,
      progress.amount,
      progress.note,
      progress.source
    );
  }

  async getGoalProgressHistory(goalId: number, limit: number = 50): Promise<any[]> {
    return db.getGoalProgressHistory(goalId, limit);
  }

  async getTopicProgress(userId: number, topicName: string, category: string): Promise<any | undefined> {
    return db.getTopicProgress(userId, topicName, category);
  }

  async getCategoryProgress(userId: number, category: string): Promise<any[]> {
    return db.getCategoryProgress(userId, category);
  }
}
