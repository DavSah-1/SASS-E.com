import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getFinanceArticles,
  getFinanceArticleBySlug,
  getUserLearningProgress,
  updateUserLearningProgress,
  getFinancialGlossaryTerms,
  getArticleQuiz,
  submitQuizAttempt,
  getUserQuizAttempts,
  getTierAssessment,
  submitTierAssessmentAttempt,
  getUserTierAssessmentAttempts,
  hasUserPassedTierAssessment,
  hasUserPassedAllTierQuizzes,
  getUserTierProgressionStatus,
  getUserLearnFinanceStats,
  getAllBadges,
  getUserBadges,
  checkAndAwardBadges,
} from "./supabaseDb";

export const learnFinanceRouter = router({
  /**
   * Get all published finance articles
   */
  getArticles: publicProcedure.query(async () => {
    return await getFinanceArticles();
  }),

  /**
   * Get a single article by slug
   */
  getArticle: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await getFinanceArticleBySlug(input.slug);
    }),

  /**
   * Get user's learning progress (requires authentication)
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    return await getUserLearningProgress(String(ctx.user.id));
  }),

  /**
   * Update user's learning progress for an article
   */
  updateProgress: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        progress: z.number().min(0).max(100),
        completed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      await updateUserLearningProgress(
        String(ctx.user.id),
        input.articleId,
        input.progress,
        input.completed
      );
      return { success: true };
    }),

  /**
   * Get financial glossary terms
   */
  getGlossary: publicProcedure
    .input(z.object({ category: z.string().optional() }).optional())
    .query(async ({ input }) => {
      return await getFinancialGlossaryTerms(input?.category);
    }),

  /**
   * Get quiz for an article
   */
  getArticleQuiz: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input }) => {
      return await getArticleQuiz(input.articleId);
    }),

  /**
   * Submit quiz attempt (requires authentication)
   */
  submitQuizAttempt: protectedProcedure
    .input(
      z.object({
        articleId: z.number(),
        answers: z.array(z.number()),
        score: z.number(),
        passed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await submitQuizAttempt(
        String(ctx.user.id),
        input.articleId,
        input.answers,
        input.score,
        input.passed
      );
    }),

  /**
   * Get user's quiz attempts for an article
   */
  getQuizAttempts: protectedProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await getUserQuizAttempts(String(ctx.user.id), input.articleId);
    }),

  /**
   * Get tier assessment by tier ID
   */
  getTierAssessment: publicProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ input }) => {
      return await getTierAssessment(input.tierId);
    }),

  /**
   * Submit tier assessment attempt (requires authentication)
   */
  submitTierAssessmentAttempt: protectedProcedure
    .input(
      z.object({
        tierId: z.number(),
        answers: z.array(z.string()),
        score: z.number(),
        passed: z.boolean(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return await submitTierAssessmentAttempt(
        String(ctx.user.id),
        input.tierId,
        input.answers,
        input.score,
        input.passed
      );
    }),

  /**
   * Get user's tier assessment attempts
   */
  getTierAssessmentAttempts: protectedProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await getUserTierAssessmentAttempts(String(ctx.user.id), input.tierId);
    }),

  /**
   * Check if user has passed a tier assessment
   */
  hasPassedTierAssessment: protectedProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await hasUserPassedTierAssessment(String(ctx.user.id), input.tierId);
    }),

  /**
   * Check if user has passed all quizzes in a tier
   */
  hasPassedAllTierQuizzes: protectedProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await hasUserPassedAllTierQuizzes(String(ctx.user.id), input.tierId);
    }),

  /**
   * Get user's tier progression status
   */
  getTierProgressionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserTierProgressionStatus(String(ctx.user.id));
    }),

  /**
   * Get user's Learn Finance stats (articles, quizzes, tier, streak, progress)
   */
  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserLearnFinanceStats(String(ctx.user.id));
    }),

  /**
   * Get all available badges
   */
  getAllBadges: publicProcedure
    .query(async () => {
      return await getAllBadges();
    }),

  /**
   * Get user's earned badges
   */
  getUserBadges: protectedProcedure
    .query(async ({ ctx }) => {
      return await getUserBadges(String(ctx.user.id));
    }),

  /**
   * Check and award new badges based on user progress
   */
  checkAndAwardBadges: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await checkAndAwardBadges(String(ctx.user.id));
    }),
});
