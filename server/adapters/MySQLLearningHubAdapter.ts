import { eq, and, desc } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";
import type { LearningHubAdapter } from "./LearningHubAdapter";

export class MySQLLearningHubAdapter implements LearningHubAdapter {
  constructor(private db: MySql2Database<typeof schema>) {}

  async getTopicProgress(userId: number, category?: string): Promise<any[]> {
    const conditions = [eq(schema.topicProgress.userId, userId)];
    if (category) conditions.push(eq(schema.topicProgress.category, category));
    return this.db.select().from(schema.topicProgress).where(and(...conditions)).orderBy(desc(schema.topicProgress.lastAccessed));
  }

  async getTopicProgressByName(userId: number, topicName: string): Promise<any | null> {
    const [result] = await this.db
      .select()
      .from(schema.topicProgress)
      .where(and(eq(schema.topicProgress.userId, userId), eq(schema.topicProgress.topicName, topicName)));
    return result || null;
  }

  async createTopicProgress(userId: number, topicName: string, category: string): Promise<any> {
    const [result] = await this.db.insert(schema.topicProgress).values({
      userId,
      topicName,
      category,
      status: "not_started",
      lessonCompleted: 0,
      practiceCount: 0,
      quizzesTaken: 0,
      bestQuizScore: 0,
      masteryLevel: 0,
    });
    return result;
  }

  async updateTopicProgress(userId: number, topicName: string, updates: any): Promise<void> {
    await this.db
      .update(schema.topicProgress)
      .set({ ...updates, updatedAt: new Date() })
      .where(and(eq(schema.topicProgress.userId, userId), eq(schema.topicProgress.topicName, topicName)));
  }

  async getTopicQuizResults(userId: number, topicId?: string): Promise<any[]> {
    const conditions = [eq(schema.topicQuizResults.userId, userId)];
    if (topicId) conditions.push(eq(schema.topicQuizResults.topicId, topicId));
    return this.db.select().from(schema.topicQuizResults).where(and(...conditions)).orderBy(desc(schema.topicQuizResults.createdAt));
  }

  async submitTopicQuiz(userId: number, topicId: string, score: number, totalQuestions: number, answers: string): Promise<void> {
    const percentage = (score / totalQuestions) * 100;
    await this.db.insert(schema.topicQuizResults).values({
      userId,
      topicId,
      score,
      totalQuestions,
      percentage: percentage.toString(),
      answers,
    });
  }

  async getPracticeSessions(userId: number, topicId?: string): Promise<any[]> {
    const conditions = [eq(schema.practiceSessions.userId, userId)];
    if (topicId) conditions.push(eq(schema.practiceSessions.topicId, topicId));
    return this.db.select().from(schema.practiceSessions).where(and(...conditions)).orderBy(desc(schema.practiceSessions.createdAt));
  }

  async createPracticeSession(userId: number, topicId: string, problemsSolved: number, correctAnswers: number, duration?: number): Promise<void> {
    await this.db.insert(schema.practiceSessions).values({
      userId,
      topicId,
      problemsSolved,
      correctAnswers,
      duration: duration || null,
    });
  }
}

export function createMySQLLearningHubAdapter(db: MySql2Database<typeof schema>): LearningHubAdapter {
  return new MySQLLearningHubAdapter(db);
}
