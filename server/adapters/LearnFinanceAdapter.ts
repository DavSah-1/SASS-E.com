/**
 * LearnFinanceAdapter
 * 
 * Handles financial education operations across dual-database architecture.
 * Covers 8 tables: financeArticles, userLearningProgress, financialGlossary, learningBadges,
 * userLearningBadges, tierAssessments, userTierAssessmentAttempts, articleQuizzes
 */

export interface LearnFinanceAdapter {
  // Articles
  getFinanceArticles(category?: string, difficulty?: string): Promise<any[]>;
  getFinanceArticleBySlug(slug: string): Promise<any | null>;
  createFinanceArticle(article: any): Promise<any>;

  // User learning progress
  getUserLearningProgress(userId: number, articleId?: number): Promise<any[]>;
  updateLearningProgress(userId: number, articleId: number, progress: number, completed: boolean): Promise<void>;

  // Glossary
  getFinancialGlossary(term?: string): Promise<any[]>;
  getGlossaryTerm(term: string): Promise<any | null>;
  createGlossaryTerm(term: string, definition: string, example?: string, relatedTerms?: string): Promise<any>;

  // Badges
  getLearningBadges(): Promise<any[]>;
  getUserLearningBadges(userId: number): Promise<any[]>;
  awardBadge(userId: number, badgeId: number): Promise<void>;

  // Tier assessments
  getTierAssessments(tier?: string): Promise<any[]>;
  getUserTierAssessmentAttempts(userId: number, assessmentId?: number): Promise<any[]>;
  submitTierAssessment(userId: number, assessmentId: number, score: number, passed: boolean, answers: string): Promise<void>;

  // Article quizzes
  getArticleQuizzes(userId: number, articleId?: number): Promise<any[]>;
  submitArticleQuiz(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void>;
}
