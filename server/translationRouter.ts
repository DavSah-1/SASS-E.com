import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { translateText, translateBatch } from "./_core/translation";
import { getDb } from "./db";
import { users } from "../drizzle/schema";
import { eq } from "drizzle-orm";

export const translationRouter = router({
  /**
   * Translate a single text
   */
  translate: publicProcedure
    .input(
      z.object({
        text: z.string(),
        targetLanguage: z.string(),
      })
    )
    .query(async ({ input }) => {
      const translated = await translateText(input.text, input.targetLanguage);
      return { translated };
    }),

  /**
   * Translate multiple texts in batch
   */
  translateBatch: publicProcedure
    .input(
      z.object({
        texts: z.array(z.string()),
        targetLanguage: z.string(),
      })
    )
    .query(async ({ input }) => {
      const translations = await translateBatch(input.texts, input.targetLanguage);
      return { translations };
    }),

  /**
   * Update user's preferred language
   */
  setPreferredLanguage: protectedProcedure
    .input(
      z.object({
        language: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      if (!db) throw new Error("Database not available");

      await db
        .update(users)
        .set({ preferredLanguage: input.language })
        .where(eq(users.id, ctx.user.numericId));

      return { success: true };
    }),

  /**
   * Get user's preferred language
   */
  getPreferredLanguage: protectedProcedure.query(async ({ ctx }) => {
    return { language: ctx.user.preferredLanguage || "en" };
  }),
});
