/**
 * LearnFinanceAdapter Interface
 * 
 * Specialized adapter for finance learning operations (articles, glossary, badges, assessments).
 * Covers 8 tables: financeArticles, userLearningProgress, financialGlossary, learningBadges,
 * userLearningBadges, tierAssessments, userTierAssessmentAttempts, articleQuizzes
 */

export interface LearnFinanceAdapter {
  // Articles
  getFinanceArticles(tier?: string): Promise<any[]>;
  getFinanceArticleBySlug(slug: string): Promise<any | undefined>;

  // User Progress
  getUserLearningProgress(userId: number): Promise<any[]>;
  updateUserLearningProgress(userId: number, articleId: number, updates: any): Promise<void>;

  // Glossary
  getFinancialGlossaryTerms(tier?: string): Promise<any[]>;

  // Article Quizzes
  getArticleQuiz(articleId: number): Promise<any | undefined>;
  submitQuizAttempt(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void>;
  getUserQuizAttempts(userId: number, articleId?: number): Promise<any[]>;

  // Tier Assessments
  getTierAssessment(tier: string): Promise<any | undefined>;
  submitTierAssessmentAttempt(userId: number, tier: string, score: number, totalQuestions: number, answers: string): Promise<void>;
  getUserTierAssessmentAttempts(userId: number, tier?: string): Promise<any[]>;
  hasUserPassedTierAssessment(userId: number, tier: string): Promise<boolean>;
  hasUserPassedAllTierQuizzes(userId: number, tier: string): Promise<boolean>;
  getUserTierProgressionStatus(userId: number): Promise<any>;

  // Stats
  getUserLearnFinanceStats(userId: number): Promise<any>;

  // Badges
  getAllBadges(): Promise<any[]>;
  getUserBadges(userId: number): Promise<any[]>;
  checkAndAwardBadges(userId: number): Promise<any[]>;
}
