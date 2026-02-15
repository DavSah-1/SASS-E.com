import { eq, and, desc } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";
import type { LearnFinanceAdapter } from "./LearnFinanceAdapter";

export class MySQLLearnFinanceAdapter implements LearnFinanceAdapter {
  constructor(private db: MySql2Database<typeof schema>) {}

  async getFinanceArticles(category?: string, difficulty?: string): Promise<any[]> {
    const conditions = [];
    if (category) conditions.push(eq(schema.financeArticles.category, category));
    if (difficulty) conditions.push(eq(schema.financeArticles.difficulty, difficulty));
    return conditions.length > 0
      ? this.db.select().from(schema.financeArticles).where(and(...conditions))
      : this.db.select().from(schema.financeArticles);
  }

  async getFinanceArticleBySlug(slug: string): Promise<any | null> {
    const [result] = await this.db.select().from(schema.financeArticles).where(eq(schema.financeArticles.slug, slug));
    return result || null;
  }

  async createFinanceArticle(article: any): Promise<any> {
    const [result] = await this.db.insert(schema.financeArticles).values(article);
    return result;
  }

  async getUserLearningProgress(userId: number, articleId?: number): Promise<any[]> {
    const conditions = [eq(schema.userLearningProgress.userId, userId)];
    if (articleId) conditions.push(eq(schema.userLearningProgress.articleId, articleId));
    return this.db.select().from(schema.userLearningProgress).where(and(...conditions));
  }

  async updateLearningProgress(userId: number, articleId: number, progress: number, completed: boolean): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(schema.userLearningProgress)
      .where(and(eq(schema.userLearningProgress.userId, userId), eq(schema.userLearningProgress.articleId, articleId)));

    if (existing) {
      await this.db
        .update(schema.userLearningProgress)
        .set({
          progress,
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(and(eq(schema.userLearningProgress.userId, userId), eq(schema.userLearningProgress.articleId, articleId)));
    } else {
      await this.db.insert(schema.userLearningProgress).values({
        userId,
        articleId,
        progress,
        completed,
        completedAt: completed ? new Date() : null,
      });
    }
  }

  async getFinancialGlossary(term?: string): Promise<any[]> {
    if (term) {
      return this.db.select().from(schema.financialGlossary).where(eq(schema.financialGlossary.term, term));
    }
    return this.db.select().from(schema.financialGlossary);
  }

  async getGlossaryTerm(term: string): Promise<any | null> {
    const [result] = await this.db.select().from(schema.financialGlossary).where(eq(schema.financialGlossary.term, term));
    return result || null;
  }

  async createGlossaryTerm(term: string, definition: string, example?: string, relatedTerms?: string): Promise<any> {
    const [result] = await this.db.insert(schema.financialGlossary).values({
      term,
      definition,
      example: example || null,
      relatedTerms: relatedTerms || null,
    });
    return result;
  }

  async getLearningBadges(): Promise<any[]> {
    return this.db.select().from(schema.learningBadges);
  }

  async getUserLearningBadges(userId: number): Promise<any[]> {
    return this.db.select().from(schema.userLearningBadges).where(eq(schema.userLearningBadges.userId, userId)).orderBy(desc(schema.userLearningBadges.earnedAt));
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    await this.db.insert(schema.userLearningBadges).values({
      userId,
      badgeId,
    });
  }

  async getTierAssessments(tier?: string): Promise<any[]> {
    if (tier) {
      return this.db.select().from(schema.tierAssessments).where(eq(schema.tierAssessments.tier, tier));
    }
    return this.db.select().from(schema.tierAssessments);
  }

  async getUserTierAssessmentAttempts(userId: number, assessmentId?: number): Promise<any[]> {
    const conditions = [eq(schema.userTierAssessmentAttempts.userId, userId)];
    if (assessmentId) conditions.push(eq(schema.userTierAssessmentAttempts.assessmentId, assessmentId));
    return this.db.select().from(schema.userTierAssessmentAttempts).where(and(...conditions)).orderBy(desc(schema.userTierAssessmentAttempts.attemptedAt));
  }

  async submitTierAssessment(userId: number, assessmentId: number, score: number, passed: boolean, answers: string): Promise<void> {
    await this.db.insert(schema.userTierAssessmentAttempts).values({
      userId,
      assessmentId,
      score,
      passed,
      answers,
    });
  }

  async getArticleQuizzes(userId: number, articleId?: number): Promise<any[]> {
    const conditions = [eq(schema.articleQuizzes.userId, userId)];
    if (articleId) conditions.push(eq(schema.articleQuizzes.articleId, articleId));
    return this.db.select().from(schema.articleQuizzes).where(and(...conditions)).orderBy(desc(schema.articleQuizzes.createdAt));
  }

  async submitArticleQuiz(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void> {
    await this.db.insert(schema.articleQuizzes).values({
      userId,
      articleId,
      score,
      totalQuestions,
      answers,
    });
  }
}

export function createMySQLLearnFinanceAdapter(db: MySql2Database<typeof schema>): LearnFinanceAdapter {
  return new MySQLLearnFinanceAdapter(db);
}
