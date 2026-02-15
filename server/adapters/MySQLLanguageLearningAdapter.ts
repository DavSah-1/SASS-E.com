import { eq, and, desc } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../../drizzle/schema";
import type { LanguageLearningAdapter } from "./LanguageLearningAdapter";

export class MySQLLanguageLearningAdapter implements LanguageLearningAdapter {
  private async getDatabase() {
    const db = await getDb();
    if (!db) throw new Error("Database not available");
    return db;
  }

  async getVocabularyItems(language: string, difficulty?: string): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.vocabularyItems.language, language)];
    if (difficulty) conditions.push(eq(schema.vocabularyItems.difficulty, difficulty));
    return db.select().from(schema.vocabularyItems).where(and(...conditions));
  }

  async getUserVocabulary(userId: number): Promise<any[]> {
    const db = await this.getDatabase();
    return db.select().from(schema.userVocabulary).where(eq(schema.userVocabulary.userId, userId));
  }

  async addVocabularyItem(userId: number, vocabularyId: number): Promise<any> {
    const db = await this.getDatabase();
    const [result] = await db.insert(schema.userVocabulary).values({
      userId,
      vocabularyId,
      timesReviewed: 0,
      correctCount: 0,
      lastReviewed: new Date(),
    });
    return result;
  }

  async updateVocabularyProgress(userId: number, vocabularyId: number, isCorrect: boolean): Promise<void> {
    const db = await this.getDatabase();
    const [existing] = await db
      .select()
      .from(schema.userVocabulary)
      .where(and(eq(schema.userVocabulary.userId, userId), eq(schema.userVocabulary.vocabularyId, vocabularyId)));

    if (existing) {
      await db
        .update(schema.userVocabulary)
        .set({
          timesReviewed: existing.timesReviewed + 1,
          correctCount: isCorrect ? existing.correctCount + 1 : existing.correctCount,
          lastReviewed: new Date(),
        })
        .where(and(eq(schema.userVocabulary.userId, userId), eq(schema.userVocabulary.vocabularyId, vocabularyId)));
    }
  }

  async getGrammarLessons(language: string, difficulty?: string): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.grammarLessons.language, language)];
    if (difficulty) conditions.push(eq(schema.grammarLessons.difficulty, difficulty));
    return db.select().from(schema.grammarLessons).where(and(...conditions));
  }

  async getUserGrammarProgress(userId: number): Promise<any[]> {
    const db = await this.getDatabase();
    return db.select().from(schema.userGrammarProgress).where(eq(schema.userGrammarProgress.userId, userId));
  }

  async markGrammarLessonComplete(userId: number, lessonId: number, score: number): Promise<void> {
    const db = await this.getDatabase();
    await db.insert(schema.userGrammarProgress).values({
      userId,
      lessonId,
      completed: true,
      score,
      completedAt: new Date(),
    });
  }

  async getLanguageExercises(language: string, type?: string, difficulty?: string): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.languageExercises.language, language)];
    if (type) conditions.push(eq(schema.languageExercises.exerciseType, type));
    if (difficulty) conditions.push(eq(schema.languageExercises.difficulty, difficulty));
    return db.select().from(schema.languageExercises).where(and(...conditions));
  }

  async submitExerciseAttempt(userId: number, exerciseId: number, userAnswer: string, isCorrect: boolean): Promise<void> {
    const db = await this.getDatabase();
    await db.insert(schema.exerciseAttempts).values({
      userId,
      exerciseId,
      userAnswer,
      isCorrect,
      attemptedAt: new Date(),
    });
  }

  async getExerciseAttempts(userId: number, exerciseId?: number): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.exerciseAttempts.userId, userId)];
    if (exerciseId) conditions.push(eq(schema.exerciseAttempts.exerciseId, exerciseId));
    return db.select().from(schema.exerciseAttempts).where(and(...conditions)).orderBy(desc(schema.exerciseAttempts.attemptedAt));
  }

  async getUserLanguageProgress(userId: number, language?: string): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.userLanguageProgress.userId, userId)];
    if (language) conditions.push(eq(schema.userLanguageProgress.language, language));
    return db.select().from(schema.userLanguageProgress).where(and(...conditions));
  }

  async updateLanguageProgress(userId: number, language: string, updates: any): Promise<void> {
    const db = await this.getDatabase();
    const [existing] = await db
      .select()
      .from(schema.userLanguageProgress)
      .where(and(eq(schema.userLanguageProgress.userId, userId), eq(schema.userLanguageProgress.language, language)));

    if (existing) {
      await db
        .update(schema.userLanguageProgress)
        .set({ ...updates, updatedAt: new Date() })
        .where(and(eq(schema.userLanguageProgress.userId, userId), eq(schema.userLanguageProgress.language, language)));
    } else {
      await db.insert(schema.userLanguageProgress).values({
        userId,
        language,
        ...updates,
      });
    }
  }

  async getDailyLesson(userId: number, language: string, date: Date): Promise<any | null> {
    const db = await this.getDatabase();
    const [result] = await db
      .select()
      .from(schema.dailyLessons)
      .where(
        and(
          eq(schema.dailyLessons.userId, userId),
          eq(schema.dailyLessons.language, language),
          eq(schema.dailyLessons.lessonDate, date)
        )
      );
    return result || null;
  }

  async markDailyLessonComplete(userId: number, lessonId: number): Promise<void> {
    const db = await this.getDatabase();
    await db
      .update(schema.dailyLessons)
      .set({ completed: true, completedAt: new Date() })
      .where(and(eq(schema.dailyLessons.userId, userId), eq(schema.dailyLessons.id, lessonId)));
  }

  async getLanguageAchievements(userId: number, language?: string): Promise<any[]> {
    const db = await this.getDatabase();
    const conditions = [eq(schema.languageAchievements.userId, userId)];
    if (language) conditions.push(eq(schema.languageAchievements.language, language));
    return db.select().from(schema.languageAchievements).where(and(...conditions)).orderBy(desc(schema.languageAchievements.earnedAt));
  }

  async awardAchievement(userId: number, language: string, achievementType: string, achievementName: string): Promise<void> {
    const db = await this.getDatabase();
    await db.insert(schema.languageAchievements).values({
      userId,
      language,
      achievementType,
      achievementName,
      earnedAt: new Date(),
    });
  }
}

export function createMySQLLanguageLearningAdapter(): LanguageLearningAdapter {
  return new MySQLLanguageLearningAdapter();
}
