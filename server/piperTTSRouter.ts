/**
 * tRPC Router for Piper TTS
 * Provides high-quality text-to-speech for language learning
 */

import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { generateSpeech, getCacheStats, clearCache } from "./piperTTSWrapper";

export const piperTTSRouter = router({
  /**
   * Generate pronunciation audio using Piper TTS
   */
  generatePronunciation: publicProcedure
    .input(
      z.object({
        text: z.string().min(1).max(500),
        language: z.string().min(2).max(10),
        speed: z.number().min(0.5).max(2.0).optional().default(1.0),
      })
    )
    .mutation(async ({ input }) => {
      const { text, language, speed } = input;

      // Generate speech using Piper TTS
      const result = await generateSpeech({ text, language, speed });

      if (!result.success || !result.audio) {
        throw new Error(result.error || "Failed to generate pronunciation");
      }

      // Convert audio buffer to base64 for transmission
      const audioBase64 = result.audio.toString("base64");

      return {
        success: true,
        audio: audioBase64,
        mimeType: "audio/wav",
        size: result.audio.length,
      };
    }),

  /**
   * Get cache statistics
   */
  getCacheStats: publicProcedure.query(async () => {
    return await getCacheStats();
  }),

  /**
   * Clear TTS cache (admin only in production)
   */
  clearCache: publicProcedure.mutation(async () => {
    const count = await clearCache();
    return {
      success: true,
      filesDeleted: count,
    };
  }),
});
