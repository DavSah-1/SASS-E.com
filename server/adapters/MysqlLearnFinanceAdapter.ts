/**
 * MysqlLearnFinanceAdapter
 * 
 * MySQL implementation of LearnFinanceAdapter - delegates to learnFinanceDb functions
 */

import type { LearnFinanceAdapter } from './LearnFinanceAdapter';
import * as learnFinanceDb from '../learnFinanceDb';

export class MysqlLearnFinanceAdapter implements LearnFinanceAdapter {
  async getFinanceArticles(tier?: string): Promise<any[]> {
    return learnFinanceDb.getFinanceArticles(tier);
  }

  async getFinanceArticleBySlug(slug: string): Promise<any | undefined> {
    return learnFinanceDb.getFinanceArticleBySlug(slug);
  }

  async getUserLearningProgress(userId: number): Promise<any[]> {
    return learnFinanceDb.getUserLearningProgress(userId);
  }

  async updateUserLearningProgress(userId: number, articleId: number, updates: any): Promise<void> {
    return learnFinanceDb.updateUserLearningProgress(userId, articleId, updates);
  }

  async getFinancialGlossaryTerms(tier?: string): Promise<any[]> {
    return learnFinanceDb.getFinancialGlossaryTerms(tier);
  }

  async getArticleQuiz(articleId: number): Promise<any | undefined> {
    return learnFinanceDb.getArticleQuiz(articleId);
  }

  async submitQuizAttempt(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void> {
    return learnFinanceDb.submitQuizAttempt(userId, articleId, score, totalQuestions, answers);
  }

  async getUserQuizAttempts(userId: number, articleId?: number): Promise<any[]> {
    return learnFinanceDb.getUserQuizAttempts(userId, articleId);
  }

  async getTierAssessment(tier: string): Promise<any | undefined> {
    return learnFinanceDb.getTierAssessment(tier);
  }

  async submitTierAssessmentAttempt(userId: number, tier: string, score: number, totalQuestions: number, answers: string): Promise<void> {
    return learnFinanceDb.submitTierAssessmentAttempt(userId, tier, score, totalQuestions, answers);
  }

  async getUserTierAssessmentAttempts(userId: number, tier?: string): Promise<any[]> {
    return learnFinanceDb.getUserTierAssessmentAttempts(userId, tier);
  }

  async hasUserPassedTierAssessment(userId: number, tier: string): Promise<boolean> {
    return learnFinanceDb.hasUserPassedTierAssessment(userId, tier);
  }

  async hasUserPassedAllTierQuizzes(userId: number, tier: string): Promise<boolean> {
    return learnFinanceDb.hasUserPassedAllTierQuizzes(userId, tier);
  }

  async getUserTierProgressionStatus(userId: number): Promise<any> {
    return learnFinanceDb.getUserTierProgressionStatus(userId);
  }

  async getUserLearnFinanceStats(userId: number): Promise<any> {
    return learnFinanceDb.getUserLearnFinanceStats(userId);
  }

  async getAllBadges(): Promise<any[]> {
    return learnFinanceDb.getAllBadges();
  }

  async getUserBadges(userId: number): Promise<any[]> {
    return learnFinanceDb.getUserBadges(userId);
  }

  async checkAndAwardBadges(userId: number): Promise<any[]> {
    return learnFinanceDb.checkAndAwardBadges(userId);
  }
}
