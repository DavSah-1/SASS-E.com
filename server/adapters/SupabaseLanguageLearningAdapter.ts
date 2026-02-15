import { eq, and, desc } from "drizzle-orm";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";
import * as supabaseSchema from "../../drizzle/supabaseSchema";
import type { LanguageLearningAdapter } from "./LanguageLearningAdapter";

export class SupabaseLanguageLearningAdapter implements LanguageLearningAdapter {
  constructor(private db: PostgresJsDatabase<typeof supabaseSchema>) {}

  async getVocabularyItems(language: string, difficulty?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.vocabularyItems.language, language)];
    if (difficulty) conditions.push(eq(supabaseSchema.vocabularyItems.difficulty, difficulty));
    return this.db.select().from(supabaseSchema.vocabularyItems).where(and(...conditions));
  }

  async getUserVocabulary(userId: number): Promise<any[]> {
    return this.db.select().from(supabaseSchema.userVocabulary).where(eq(supabaseSchema.userVocabulary.userId, userId));
  }

  async addVocabularyItem(userId: number, vocabularyId: number): Promise<any> {
    const [result] = await this.db.insert(supabaseSchema.userVocabulary).values({
      userId,
      vocabularyId,
      timesReviewed: 0,
      correctCount: 0,
      lastReviewed: new Date(),
    }).returning();
    return result;
  }

  async updateVocabularyProgress(userId: number, vocabularyId: number, isCorrect: boolean): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(supabaseSchema.userVocabulary)
      .where(and(eq(supabaseSchema.userVocabulary.userId, userId), eq(supabaseSchema.userVocabulary.vocabularyId, vocabularyId)));

    if (existing) {
      await this.db
        .update(supabaseSchema.userVocabulary)
        .set({
          timesReviewed: existing.timesReviewed + 1,
          correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
          lastReviewed: new Date(),
        })
        .where(and(eq(supabaseSchema.userVocabulary.userId, userId), eq(supabaseSchema.userVocabulary.vocabularyId, vocabularyId)));
    }
  }

  async getGrammarLessons(language: string, difficulty?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.grammarLessons.language, language)];
    if (difficulty) conditions.push(eq(supabaseSchema.grammarLessons.difficulty, difficulty));
    return this.db.select().from(supabaseSchema.grammarLessons).where(and(...conditions));
  }

  async getUserGrammarProgress(userId: number): Promise<any[]> {
    return this.db.select().from(supabaseSchema.userGrammarProgress).where(eq(supabaseSchema.userGrammarProgress.userId, userId));
  }

  async markGrammarLessonComplete(userId: number, lessonId: number, score: number): Promise<void> {
    await this.db.insert(supabaseSchema.userGrammarProgress).values({
      userId,
      lessonId,
      completed: true,
      score,
      completedAt: new Date(),
    });
  }

  async getLanguageExercises(language: string, type?: string, difficulty?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.languageExercises.language, language)];
    if (type) conditions.push(eq(supabaseSchema.languageExercises.exerciseType, type));
    if (difficulty) conditions.push(eq(supabaseSchema.languageExercises.difficulty, difficulty));
    return this.db.select().from(supabaseSchema.languageExercises).where(and(...conditions));
  }

  async submitExerciseAttempt(userId: number, exerciseId: number, userAnswer: string, isCorrect: boolean): Promise<void> {
    await this.db.insert(supabaseSchema.exerciseAttempts).values({
      userId,
      exerciseId,
      userAnswer,
      isCorrect,
      attemptedAt: new Date(),
    });
  }

  async getExerciseAttempts(userId: number, exerciseId?: number): Promise<any[]> {
    const conditions = [eq(supabaseSchema.exerciseAttempts.userId, userId)];
    if (exerciseId) conditions.push(eq(supabaseSchema.exerciseAttempts.exerciseId, exerciseId));
    return this.db.select().from(supabaseSchema.exerciseAttempts).where(and(...conditions)).orderBy(desc(supabaseSchema.exerciseAttempts.attemptedAt));
  }

  async getUserLanguageProgress(userId: number, language?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.userLanguageProgress.userId, userId)];
    if (language) conditions.push(eq(supabaseSchema.userLanguageProgress.language, language));
    return this.db.select().from(supabaseSchema.userLanguageProgress).where(and(...conditions));
  }

  async updateLanguageProgress(userId: number, language: string, updates: any): Promise<void> {
    const [existing] = await this.db
      .select()
      .from(supabaseSchema.userLanguageProgress)
      .where(and(eq(supabaseSchema.userLanguageProgress.userId, userId), eq(supabaseSchema.userLanguageProgress.language, language)));

    if (existing) {
      await this.db
        .update(supabaseSchema.userLanguageProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(supabaseSchema.userLanguageProgress.userId, userId), eq(supabaseSchema.userLanguageProgress.language, language)));
    } else {
      await this.db.insert(supabaseSchema.userLanguageProgress).values({
        userId,
        language,
        ...updates,
      });
    }
  }

  async getDailyLesson(userId: number, language: string, date: Date): Promise<any | null> {
    const [result] = await this.db
      .select()
      .from(supabaseSchema.dailyLessons)
      .where(
        and(
          eq(supabaseSchema.dailyLessons.userId, userId),
          eq(supabaseSchema.dailyLessons.language, language),
          eq(supabaseSchema.dailyLessons.lessonDate, date.toISOString().split('T')[0])
        )
      );
    return result || null;
  }

  async markDailyLessonComplete(userId: number, lessonId: number): Promise<void> {
    await this.db
      .update(supabaseSchema.dailyLessons)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(supabaseSchema.dailyLessons.userId, userId), eq(supabaseSchema.dailyLessons.id, lessonId)));
  }

  async getLanguageAchievements(userId: number, language?: string): Promise<any[]> {
    const conditions = [eq(supabaseSchema.languageAchievements.userId, userId)];
    if (language) conditions.push(eq(supabaseSchema.languageAchievements.language, language));
    return this.db.select().from(supabaseSchema.languageAchievements).where(and(...conditions)).orderBy(desc(supabaseSchema.languageAchievements.earnedAt));
  }

  async awardAchievement(userId: number, language: string, achievementType: string, achievementName: string): Promise<void> {
    await this.db.insert(supabaseSchema.languageAchievements).values({
      userId,
      language,
      achievementType,
      achievementName,
      earnedAt: new Date(),
    });
  }
}

export function createSupabaseLanguageLearningAdapter(db: PostgresJsDatabase<typeof supabaseSchema>): LanguageLearningAdapter {
  return new SupabaseLanguageLearningAdapter(db);
}
