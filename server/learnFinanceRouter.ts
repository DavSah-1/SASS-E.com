import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";

export const learnFinanceRouter = router({
  /**
   * Get all published finance articles
   */
  getArticles: publicProcedure.query(async () => {
    return await ctx.learnFinanceDb.ctx.learnFinanceDb.getFinanceArticles();
  }),

  /**
   * Get a single article by slug
   */
  getArticle: publicProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getFinanceArticleBySlug(input.slug);
    }),

  /**
   * Get user's learning progress (requires authentication)
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserLearningProgress(String(ctx.user.id));
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
      await ctx.learnFinanceDb.ctx.learnFinanceDb.updateUserLearningProgress(
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
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getFinancialGlossaryTerms(input?.category);
    }),

  /**
   * Get quiz for an article
   */
  getArticleQuiz: publicProcedure
    .input(z.object({ articleId: z.number() }))
    .query(async ({ input }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getArticleQuiz(input.articleId);
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
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.submitQuizAttempt(
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
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserQuizAttempts(String(ctx.user.id), input.articleId);
    }),

  /**
   * Get tier assessment by tier ID
   */
  getTierAssessment: publicProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ input }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getTierAssessment(input.tierId);
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
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.submitTierAssessmentAttempt(
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
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserTierAssessmentAttempts(String(ctx.user.id), input.tierId);
    }),

  /**
   * Check if user has passed a tier assessment
   */
  hasPassedTierAssessment: protectedProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.hasUserPassedTierAssessment(String(ctx.user.id), input.tierId);
    }),

  /**
   * Check if user has passed all quizzes in a tier
   */
  hasPassedAllTierQuizzes: protectedProcedure
    .input(z.object({ tierId: z.number() }))
    .query(async ({ ctx, input }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.hasUserPassedAllTierQuizzes(String(ctx.user.id), input.tierId);
    }),

  /**
   * Get user's tier progression status
   */
  getTierProgressionStatus: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserTierProgressionStatus(String(ctx.user.id));
    }),

  /**
   * Get user's Learn Finance stats (articles, quizzes, tier, streak, progress)
   */
  getUserStats: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserLearnFinanceStats(String(ctx.user.id));
    }),

  /**
   * Get all available badges
   */
  getAllBadges: publicProcedure
    .query(async () => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getAllBadges();
    }),

  /**
   * Get user's earned badges
   */
  getUserBadges: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.getUserBadges(String(ctx.user.id));
    }),

  /**
   * Check and award new badges based on user progress
   */
  checkAndAwardBadges: protectedProcedure
    .mutation(async ({ ctx }) => {
      return await ctx.learnFinanceDb.ctx.learnFinanceDb.checkAndAwardBadges(String(ctx.user.id));
    }),
});
