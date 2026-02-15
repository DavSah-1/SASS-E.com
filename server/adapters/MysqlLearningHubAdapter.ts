/**
 * MysqlLearningHubAdapter
 * 
 * MySQL implementation of LearningHubAdapter - delegates to MysqlLearningAdapter
 */

import { MysqlLearningAdapter } from './MysqlLearningAdapter';
import type { LearningHubAdapter } from './LearningHubAdapter';

export class MysqlLearningHubAdapter implements LearningHubAdapter {
  private learningAdapter: MysqlLearningAdapter;

  constructor() {
    this.learningAdapter = new MysqlLearningAdapter();
  }

  async getTopicProgress(userId: number, topicName: string, category: string): Promise<any | undefined> {
    return this.learningAdapter.getTopicProgress(userId, topicName, category);
  }

  async getCategoryProgress(userId: number, category: string): Promise<any[]> {
    return this.learningAdapter.getCategoryProgress(userId, category);
  }

  async updateTopicProgress(userId: number, topicName: string, category: string, updates: any): Promise<void> {
    return this.learningAdapter.updateTopicProgress(userId, topicName, category, updates);
  }

  async savePracticeSession(session: any): Promise<void> {
    return this.learningAdapter.savePracticeSession(session);
  }

  async getPracticeSessions(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    return this.learningAdapter.getPracticeSessions(userId, topicName, category, limit);
  }

  async saveQuizResult(result: any): Promise<void> {
    return this.learningAdapter.saveQuizResult(result);
  }

  async getQuizResults(userId: number, topicName: string, category: string, limit?: number): Promise<any[]> {
    return this.learningAdapter.getQuizResults(userId, topicName, category, limit);
  }
}
