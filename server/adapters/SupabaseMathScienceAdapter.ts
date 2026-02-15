import { eq, and, desc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as supabaseSchema from "../../drizzle/supabaseSchema";
import type { MathScienceAdapter } from "./MathScienceAdapter";

export class SupabaseMathScienceAdapter implements MathScienceAdapter {
  constructor(private db: PostgresJsDatabase<typeof supabaseSchema>) {}

  async getMathProblems(topic: string, difficulty?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.mathProblems.topic, topic)];
    if (difficulty) conditions.push(eq(supabaseSchema.mathProblems.difficulty, difficulty));
    return this.db.select().from(supabaseSchema.mathProblems).where(and(...conditions));
  }

  async submitMathSolution(userId: number, problemId: number, userSolution: string, isCorrect: boolean, feedback?: string): Promise<void> {
    await this.db.insert(supabaseSchema.mathSolutions).values({
      userId,
      problemId,
      userSolution,
      isCorrect,
      feedback: feedback || null,
    });
  }

  async getMathProgress(userId: number, topic?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.mathProgress.userId, userId)];
    if (topic) conditions.push(eq(supabaseSchema.mathProgress.topic, topic));
    return this.db.select().from(supabaseSchema.mathProgress).where(and(...conditions));
  }

  async updateMathProgress(userId: number, topic: string, updates: any): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(supabaseSchema.mathProgress)
      .where(and(eq(supabaseSchema.mathProgress.userId, userId), eq(supabaseSchema.mathProgress.topic, topic)));

    if (existing) {
      await this.db
        .update(supabaseSchema.mathProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(supabaseSchema.mathProgress.userId, userId), eq(supabaseSchema.mathProgress.topic, topic)));
    } else {
      await this.db.insert(supabaseSchema.mathProgress).values({
        userId,
        topic,
        ...updates,
      });
    }
  }

  async getExperiments(subject?: string, difficulty?: string): Promise<any[]> {
    const conditions = [];
    if (subject) conditions.push(eq(supabaseSchema.experiments.subject, subject));
    if (difficulty) conditions.push(eq(supabaseSchema.experiments.difficulty, difficulty));
    return conditions.length > 0
      ? this.db.select().from(supabaseSchema.experiments).where(and(...conditions))
      : this.db.select().from(supabaseSchema.experiments);
  }

  async getExperimentSteps(experimentId: number): Promise<any[]> {
    return this.db
      .select()
      .from(supabaseSchema.experimentSteps)
      .where(eq(supabaseSchema.experimentSteps.experimentId, experimentId))
      .orderBy(supabaseSchema.experimentSteps.stepNumber);
  }

  async submitLabResult(userId: number, experimentId: number, observations: string, conclusion?: string, photos?: string): Promise<void> {
    await this.db.insert(supabaseSchema.userLabResults).values({
      userId,
      experimentId,
      observations,
      conclusion: conclusion || null,
      photos: photos || null,
    });
  }

  async getUserLabResults(userId: number, experimentId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.userLabResults.userId, userId)];
    if (experimentId) conditions.push(eq(supabaseSchema.userLabResults.experimentId, experimentId));
    return this.db.select().from(supabaseSchema.userLabResults).where(and(...conditions)).orderBy(desc(supabaseSchema.userLabResults.completedAt));
  }

  async getScienceProgress(userId: number, subject?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.scienceProgress.userId, userId)];
    if (subject) conditions.push(eq(supabaseSchema.scienceProgress.subject, subject));
    return this.db.select().from(supabaseSchema.scienceProgress).where(and(...conditions));
  }

  async updateScienceProgress(userId: number, subject: string, updates: any): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(supabaseSchema.scienceProgress)
      .where(and(eq(supabaseSchema.scienceProgress.userId, userId), eq(supabaseSchema.scienceProgress.subject, subject)));

    if (existing) {
      await this.db
        .update(supabaseSchema.scienceProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(supabaseSchema.scienceProgress.userId, userId), eq(supabaseSchema.scienceProgress.subject, subject)));
    } else {
      await this.db.insert(supabaseSchema.scienceProgress).values({
        userId,
        subject,
        ...updates,
      });
    }
  }

  async getLabQuizQuestions(experimentId: number): Promise<any[]> {
    return this.db.select().from(supabaseSchema.labQuizQuestions).where(eq(supabaseSchema.labQuizQuestions.experimentId, experimentId));
  }

  async submitLabQuizAttempt(userId: number, experimentId: number, answers: string, score: number, totalQuestions: number): Promise<void> {
    await this.db.insert(supabaseSchema.labQuizAttempts).values({
      userId,
      experimentId,
      answers,
      score,
      totalQuestions,
    });
  }

  async getLabQuizAttempts(userId: number, experimentId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.labQuizAttempts.userId, userId)];
    if (experimentId) conditions.push(eq(supabaseSchema.labQuizAttempts.experimentId, experimentId));
    return this.db.select().from(supabaseSchema.labQuizAttempts).where(and(...conditions)).orderBy(desc(supabaseSchema.labQuizAttempts.createdAt));
  }
}

export function createSupabaseMathScienceAdapter(db: PostgresJsDatabase<typeof supabaseSchema>): MathScienceAdapter {
  return new SupabaseMathScienceAdapter(db);
}
