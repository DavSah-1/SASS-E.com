import { eq, and, desc } from "drizzle-orm";
import type { MySql2Database } from "drizzle-orm/mysql2";
import * as schema from "../../drizzle/schema";
import type { MathScienceAdapter } from "./MathScienceAdapter";

export class MySQLMathScienceAdapter implements MathScienceAdapter {
  constructor(private db: MySql2Database<typeof schema>) {}

  async getMathProblems(topic: string, difficulty?: string): Promise<any[]> {
    const conditions = [eq(schema.mathProblems.topic, topic)];
    if (difficulty) conditions.push(eq(schema.mathProblems.difficulty, difficulty));
    return this.db.select().from(schema.mathProblems).where(and(...conditions));
  }

  async submitMathSolution(userId: number, problemId: number, userSolution: string, isCorrect: boolean, feedback?: string): Promise<void> {
    await this.db.insert(schema.mathSolutions).values({
      userId,
      problemId,
      userSolution,
      isCorrect,
      feedback: feedback || null,
    });
  }

  async getMathProgress(userId: number, topic?: string): Promise<any[]> {
    const conditions = [eq(schema.mathProgress.userId, userId)];
    if (topic) conditions.push(eq(schema.mathProgress.topic, topic));
    return this.db.select().from(schema.mathProgress).where(and(...conditions));
  }

  async updateMathProgress(userId: number, topic: string, updates: any): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(schema.mathProgress)
      .where(and(eq(schema.mathProgress.userId, userId), eq(schema.mathProgress.topic, topic)));

    if (existing) {
      await this.db
        .update(schema.mathProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(schema.mathProgress.userId, userId), eq(schema.mathProgress.topic, topic)));
    } else {
      await this.db.insert(schema.mathProgress).values({
        userId,
        topic,
        ...updates,
      });
    }
  }

  async getExperiments(subject?: string, difficulty?: string): Promise<any[]> {
    const conditions = [];
    if (subject) conditions.push(eq(schema.experiments.subject, subject));
    if (difficulty) conditions.push(eq(schema.experiments.difficulty, difficulty));
    return conditions.length > 0
      ? this.db.select().from(schema.experiments).where(and(...conditions))
      : this.db.select().from(schema.experiments);
  }

  async getExperimentSteps(experimentId: number): Promise<any[]> {
    return this.db
      .select()
      .from(schema.experimentSteps)
      .where(eq(schema.experimentSteps.experimentId, experimentId))
      .orderBy(schema.experimentSteps.stepNumber);
  }

  async submitLabResult(userId: number, experimentId: number, observations: string, conclusion?: string, photos?: string): Promise<void> {
    await this.db.insert(schema.userLabResults).values({
      userId,
      experimentId,
      observations,
      conclusion: conclusion || null,
      photos: photos || null,
    });
  }

  async getUserLabResults(userId: number, experimentId?: number): Promise<any[]> {
    const conditions = [eq(schema.userLabResults.userId, userId)];
    if (experimentId) conditions.push(eq(schema.userLabResults.experimentId, experimentId));
    return this.db.select().from(schema.userLabResults).where(and(...conditions)).orderBy(desc(schema.userLabResults.completedAt));
  }

  async getScienceProgress(userId: number, subject?: string): Promise<any[]> {
    const conditions = [eq(schema.scienceProgress.userId, userId)];
    if (subject) conditions.push(eq(schema.scienceProgress.subject, subject));
    return this.db.select().from(schema.scienceProgress).where(and(...conditions));
  }

  async updateScienceProgress(userId: number, subject: string, updates: any): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(schema.scienceProgress)
      .where(and(eq(schema.scienceProgress.userId, userId), eq(schema.scienceProgress.subject, subject)));

    if (existing) {
      await this.db
        .update(schema.scienceProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(schema.scienceProgress.userId, userId), eq(schema.scienceProgress.subject, subject)));
    } else {
      await this.db.insert(schema.scienceProgress).values({
        userId,
        subject,
        ...updates,
      });
    }
  }

  async getLabQuizQuestions(experimentId: number): Promise<any[]> {
    return this.db.select().from(schema.labQuizQuestions).where(eq(schema.labQuizQuestions.experimentId, experimentId));
  }

  async submitLabQuizAttempt(userId: number, experimentId: number, answers: string, score: number, totalQuestions: number): Promise<void> {
    await this.db.insert(schema.labQuizAttempts).values({
      userId,
      experimentId,
      answers,
      score,
      totalQuestions,
    });
  }

  async getLabQuizAttempts(userId: number, experimentId?: number): Promise<any[]> {
    const conditions = [eq(schema.labQuizAttempts.userId, userId)];
    if (experimentId) conditions.push(eq(schema.labQuizAttempts.experimentId, experimentId));
    return this.db.select().from(schema.labQuizAttempts).where(and(...conditions)).orderBy(desc(schema.labQuizAttempts.createdAt));
  }
}

export function createMySQLMathScienceAdapter(db: MySql2Database<typeof schema>): MathScienceAdapter {
  return new MySQLMathScienceAdapter(db);
}
