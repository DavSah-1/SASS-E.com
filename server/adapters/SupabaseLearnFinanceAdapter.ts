import { eq, and, desc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as supabaseSchema from "../../drizzle/supabaseSchema";
import type { LearnFinanceAdapter } from "./LearnFinanceAdapter";

export class SupabaseLearnFinanceAdapter implements LearnFinanceAdapter {
  constructor(private db: PostgresJsDatabase<typeof supabaseSchema>) {}

  async getFinanceArticles(category?: string, difficulty?: string): Promise<any[]> {
    const conditions = [];
    if (category) conditions.push(eq(supabaseSchema.financeArticles.category, category));
    if (difficulty) conditions.push(eq(supabaseSchema.financeArticles.difficulty, difficulty));
    return conditions.length > 0
      ? this.db.select().from(supabaseSchema.financeArticles).where(and(...conditions))
      : this.db.select().from(supabaseSchema.financeArticles);
  }

  async getFinanceArticleBySlug(slug: string): Promise<any | null> {
    const [result] = await this.db.select().from(supabaseSchema.financeArticles).where(eq(supabaseSchema.financeArticles.slug, slug));
    return result || null;
  }

  async createFinanceArticle(article: any): Promise<any> {
    const [result] = await this.db.insert(supabaseSchema.financeArticles).values(article).returning();
    return result;
  }

  async getUserLearningProgress(userId: number, articleId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.userLearningProgress.userId, userId)];
    if (articleId) conditions.push(eq(supabaseSchema.userLearningProgress.articleId, articleId));
    return this.db.select().from(supabaseSchema.userLearningProgress).where(and(...conditions));
  }

  async updateLearningProgress(userId: number, articleId: number, progress: number, completed: boolean): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(supabaseSchema.userLearningProgress)
      .where(and(eq(supabaseSchema.userLearningProgress.userId, userId), eq(supabaseSchema.userLearningProgress.articleId, articleId)));

    if (existing) {
      await this.db
        .update(supabaseSchema.userLearningProgress)
        .set({
          progress,
          completed,
          completedAt: completed ? new Date() : null,
          updatedAt: new Date(),
        })
        .where(and(eq(supabaseSchema.userLearningProgress.userId, userId), eq(supabaseSchema.userLearningProgress.articleId, articleId)));
    } else {
      await this.db.insert(supabaseSchema.userLearningProgress).values({
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
      return this.db.select().from(supabaseSchema.financialGlossary).where(eq(supabaseSchema.financialGlossary.term, term));
    }
    return this.db.select().from(supabaseSchema.financialGlossary);
  }

  async getGlossaryTerm(term: string): Promise<any | null> {
    const [result] = await this.db.select().from(supabaseSchema.financialGlossary).where(eq(supabaseSchema.financialGlossary.term, term));
    return result || null;
  }

  async createGlossaryTerm(term: string, definition: string, example?: string, relatedTerms?: string): Promise<any> {
    const [result] = await this.db.insert(supabaseSchema.financialGlossary).values({
      term,
      definition,
      example: example || null,
      relatedTerms: relatedTerms || null,
    }).returning();
    return result;
  }

  async getLearningBadges(): Promise<any[]> {
    return this.db.select().from(supabaseSchema.learningBadges);
  }

  async getUserLearningBadges(userId: number): Promise<any[]> {
    return this.db.select().from(supabaseSchema.userLearningBadges).where(eq(supabaseSchema.userLearningBadges.userId, userId)).orderBy(desc(supabaseSchema.userLearningBadges.earnedAt));
  }

  async awardBadge(userId: number, badgeId: number): Promise<void> {
    await this.db.insert(supabaseSchema.userLearningBadges).values({
      userId,
      badgeId,
    });
  }

  async getTierAssessments(tier?: string): Promise<any[]> {
    if (tier) {
      return this.db.select().from(supabaseSchema.tierAssessments).where(eq(supabaseSchema.tierAssessments.tier, tier));
    }
    return this.db.select().from(supabaseSchema.tierAssessments);
  }

  async getUserTierAssessmentAttempts(userId: number, assessmentId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.userTierAssessmentAttempts.userId, userId)];
    if (assessmentId) conditions.push(eq(supabaseSchema.userTierAssessmentAttempts.assessmentId, assessmentId));
    return this.db.select().from(supabaseSchema.userTierAssessmentAttempts).where(and(...conditions)).orderBy(desc(supabaseSchema.userTierAssessmentAttempts.attemptedAt));
  }

  async submitTierAssessment(userId: number, assessmentId: number, score: number, passed: boolean, answers: string): Promise<void> {
    await this.db.insert(supabaseSchema.userTierAssessmentAttempts).values({
      userId,
      assessmentId,
      score,
      passed,
      answers,
    });
  }

  async getArticleQuizzes(userId: number, articleId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.articleQuizzes.userId, userId)];
    if (articleId) conditions.push(eq(supabaseSchema.articleQuizzes.articleId, articleId));
    return this.db.select().from(supabaseSchema.articleQuizzes).where(and(...conditions)).orderBy(desc(supabaseSchema.articleQuizzes.createdAt));
  }

  async submitArticleQuiz(userId: number, articleId: number, score: number, totalQuestions: number, answers: string): Promise<void> {
    await this.db.insert(supabaseSchema.articleQuizzes).values({
      userId,
      articleId,
      score,
      totalQuestions,
      answers,
    });
  }
}

export function createSupabaseLearnFinanceAdapter(db: PostgresJsDatabase<typeof supabaseSchema>): LearnFinanceAdapter {
  return new SupabaseLearnFinanceAdapter(db);
}
