import { eq, and, desc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as supabaseSchema from "../../drizzle/supabaseSchema";
import type { LearningHubAdapter } from "./LearningHubAdapter";

export class SupabaseLearningHubAdapter implements LearningHubAdapter {
  constructor(private db: PostgresJsDatabase<typeof supabaseSchema>) {}

  async getTopicProgress(userId: number, category?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.topicProgress.userId, userId)];
    if (category) conditions.push(eq(supabaseSchema.topicProgress.category, category));
    return this.db.select().from(supabaseSchema.topicProgress).where(and(...conditions)).orderBy(desc(supabaseSchema.topicProgress.lastAccessed));
  }

  async getTopicProgressByName(userId: number, topicName: string): Promise<any | null> {
    const [result] = await this.db
      .select()
      .from(supabaseSchema.topicProgress)
      .where(and(eq(supabaseSchema.topicProgress.userId, userId), eq(supabaseSchema.topicProgress.topicName, topicName)));
    return result || null;
  }

  async createTopicProgress(userId: number, topicName: string, category: string): Promise<any> {
    const [result] = await this.db.insert(supabaseSchema.topicProgress).values({
      userId,
      topicName,
      category,
      status: "not_started",
      lessonCompleted: 0,
      practiceCount: 0,
      quizzesTaken: 0,
      bestQuizScore: 0,
      masteryLevel: 0,
    }).returning();
    return result;
  }

  async updateTopicProgress(userId: number, topicName: string, updates: any): Promise<void> {
    await this.db
      .update(supabaseSchema.topicProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(supabaseSchema.topicProgress.userId, userId), eq(supabaseSchema.topicProgress.topicName, topicName)));
  }

  async getTopicQuizResults(userId: number, topicId?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.topicQuizResults.userId, userId)];
    if (topicId) conditions.push(eq(supabaseSchema.topicQuizResults.topicId, topicId));
    return this.db.select().from(supabaseSchema.topicQuizResults).where(and(...conditions)).orderBy(desc(supabaseSchema.topicQuizResults.createdAt));
  }

  async submitTopicQuiz(userId: number, topicId: string, score: number, totalQuestions: number, answers: string): Promise<void> {
    const percentage = (score / totalQuestions) * 100;
    await this.db.insert(supabaseSchema.topicQuizResults).values({
      userId,
      topicId,
      score,
      totalQuestions,
      percentage: percentage.toString(),
      answers,
    });
  }

  async getPracticeSessions(userId: number, topicId?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.practiceSessions.userId, userId)];
    if (topicId) conditions.push(eq(supabaseSchema.practiceSessions.topicId, topicId));
    return this.db.select().from(supabaseSchema.practiceSessions).where(and(...conditions)).orderBy(desc(supabaseSchema.practiceSessions.createdAt));
  }

  async createPracticeSession(userId: number, topicId: string, problemsSolved: number, correctAnswers: number, duration?: number): Promise<void> {
    await this.db.insert(supabaseSchema.practiceSessions).values({
      userId,
      topicId,
      problemsSolved,
      correctAnswers,
      duration: duration || null,
    });
  }
}

export function createSupabaseLearningHubAdapter(db: PostgresJsDatabase<typeof supabaseSchema>): LearningHubAdapter {
  return new SupabaseLearningHubAdapter(db);
}
