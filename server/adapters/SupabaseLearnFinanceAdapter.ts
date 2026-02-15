/**
 * SupabaseLearnFinanceAdapter
 * 
 * Supabase implementation of LearnFinanceAdapter - delegates to learnFinanceDb functions with RLS
 */

import type { LearnFinanceAdapter } from './LearnFinanceAdapter';
import type { UnifiedUser } from '../_core/dbRouter';
import * as learnFinanceDb from '../learnFinanceDb';

export class SupabaseLearnFinanceAdapter implements LearnFinanceAdapter {
  constructor(private user: UnifiedUser, private accessToken?: string) {}

  async getFinanceArticles(tier?: string): Promise<any[]> {
    return learnFinanceDb.getFinanceArticles();
  }

  async getFinanceArticleBySlug(slug: string): Promise<any | undefined> {
    return learnFinanceDb.getFinanceArticleBySlug(slug);
  }

  async getUserLearningProgress(userId: number): Promise<any[]> {
    return learnFinanceDb.getUserLearningProgress(String(userId));
  }

  async updateUserLearningProgress(userId: number, articleId: number, updates: any): Promise<void> {
    await learnFinanceDb.updateUserLearningProgress(String(userId), articleId, updates.completed || false, updates.score);
  }

  async getFinancialGlossaryTerms(tier?: string): Promise<any[]> {
    return learnFinanceDb.getFinancialGlossaryTerms();
  }

  async getArticleQuiz(articleId: number): Promise<any | undefined> {
    return learnFinanceDb.getArticleQuiz(articleId);
  }

  async submitQuizAttempt(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void> {
    const answersArray = JSON.parse(answers);
    const passed = score >= (totalQuestions * 0.7); // 70% passing score
    await learnFinanceDb.submitQuizAttempt(String(userId), articleId, answersArray, score, passed);
  }

  async getUserQuizAttempts(userId: number, articleId?: number): Promise<any[]> {
    if (!articleId) return [];
    return learnFinanceDb.getUserQuizAttempts(String(userId), articleId);
  }

  async getTierAssessment(tier: string): Promise<any | undefined> {
    // Convert tier string to tierId (beginner=1, intermediate=2, advanced=3)
    const tierMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    const tierId = tierMap[tier.toLowerCase()] || 1;
    return learnFinanceDb.getTierAssessment(tierId);
  }

  async submitTierAssessmentAttempt(userId: number, tier: string, score: number, totalQuestions: number, answers: string): Promise<void> {
    const tierMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    const tierId = tierMap[tier.toLowerCase()] || 1;
    const answersArray = JSON.parse(answers);
    const passed = score >= (totalQuestions * 0.8); // 80% passing score for tier assessment
    await learnFinanceDb.submitTierAssessmentAttempt(String(userId), tierId, answersArray, score, passed);
  }

  async getUserTierAssessmentAttempts(userId: number, tier?: string): Promise<any[]> {
    const tierMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    const tierId = tier ? (tierMap[tier.toLowerCase()] || 1) : 1;
    return learnFinanceDb.getUserTierAssessmentAttempts(String(userId), tierId);
  }

  async hasUserPassedTierAssessment(userId: number, tier: string): Promise<boolean> {
    const tierMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    const tierId = tierMap[tier.toLowerCase()] || 1;
    return learnFinanceDb.hasUserPassedTierAssessment(String(userId), tierId);
  }

  async hasUserPassedAllTierQuizzes(userId: number, tier: string): Promise<boolean> {
    const tierMap: Record<string, number> = { beginner: 1, intermediate: 2, advanced: 3 };
    const tierId = tierMap[tier.toLowerCase()] || 1;
    return learnFinanceDb.hasUserPassedAllTierQuizzes(String(userId), tierId);
  }

  async getUserTierProgressionStatus(userId: number): Promise<any> {
    return learnFinanceDb.getUserTierProgressionStatus(String(userId));
  }

  async getUserLearnFinanceStats(userId: number): Promise<any> {
    return learnFinanceDb.getUserLearnFinanceStats(String(userId));
  }

  async getAllBadges(): Promise<any[]> {
    return learnFinanceDb.getAllBadges();
  }

  async getUserBadges(userId: number): Promise<any[]> {
    return learnFinanceDb.getUserBadges(String(userId));
  }

  async checkAndAwardBadges(userId: number): Promise<any[]> {
    return learnFinanceDb.checkAndAwardBadges(String(userId));
  }
}
