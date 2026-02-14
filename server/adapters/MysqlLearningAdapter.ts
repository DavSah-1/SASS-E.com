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

  async getVocabularyItems(language: string, difficulty?: string, limit?: number): Promise<any[]> {
    return db.getVocabularyItems(language, difficulty, limit);
  }

  async getLanguageExercises(language: string, exerciseType?: string, difficulty?: string, limit?: number): Promise<any[]> {
    return db.getLanguageExercises(language, exerciseType, difficulty, limit);
  }

  async saveExerciseAttempt(attempt: any): Promise<number> {
    const result = await db.saveExerciseAttempt(attempt);
    return typeof result === 'number' ? result : 0;
  }

  async getUserAchievements(userId: number, language?: string): Promise<any[]> {
    return db.getUserAchievements(userId, language || '');
  }

  async updateTopicProgress(userId: number, topicName: string, category: string, updates: any): Promise<void> {
    await db.updateTopicProgress(userId, topicName, category, updates);
  }

  async savePracticeSession(session: any): Promise<void> {
    await db.savePracticeSession(session);
  }

  async saveQuizResult(result: any): Promise<void> {
    await db.saveQuizResult(result);
  }

  async getQuizResults(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    return db.getQuizResults(userId, topicName, category);
  }

  async getPracticeSessions(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    return db.getPracticeSessions(userId, topicName, category);
  }

  async getMathProblems(topic?: string, difficulty?: string, limit?: number): Promise<any[]> {
    return db.getMathProblems(topic, difficulty, limit);
  }

  async getMathProblem(problemId: number): Promise<any | undefined> {
    return db.getMathProblem(problemId);
  }

  async saveMathProblem(problem: any): Promise<number> {
    const result = await db.saveMathProblem(problem);
    return typeof result === 'number' ? result : 0;
  }

  async saveMathSolution(solution: any): Promise<number> {
    const result = await db.saveMathSolution(solution);
    return typeof result === 'number' ? result : 0;
  }

  async getUserMathSolutions(userId: number, limit?: number): Promise<any[]> {
    return db.getUserMathSolutions(userId, limit);
  }

  async getExperiments(filters: any): Promise<any[]> {
    return db.getExperiments(filters);
  }

  async getExperimentById(experimentId: number): Promise<any | undefined> {
    return db.getExperimentById(experimentId);
  }

  async getExperimentSteps(experimentId: number): Promise<any[]> {
    return db.getExperimentSteps(experimentId);
  }

  async saveLabResult(result: any): Promise<number> {
    const resultId = await db.saveLabResult(result);
    return typeof resultId === 'number' ? resultId : 0;
  }

  async getUserLabResults(userId: number, experimentId?: number): Promise<any[]> {
    return db.getUserLabResults(userId, experimentId);
  }
}
