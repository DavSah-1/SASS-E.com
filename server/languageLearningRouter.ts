import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";

/**
 * Language Learning Router
 * Comprehensive foreign language learning system with vocabulary, grammar, exercises, and progress tracking
 */
export const languageLearningRouter = router({
  /**
   * Get user's overall progress for a language
   */
  getProgress: protectedProcedure
    .input(z.object({
      language: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const progress = await ctx.languageLearningDb.getUserLanguageProgress(ctx.user.numericId, input.language);
      
      if (!progress) {
        // Initialize progress for new language
        const newProgress = {
          userId: ctx.user.numericId,
          language: input.language,
          level: "beginner" as const,
          fluencyScore: 0,
          vocabularySize: 0,
          grammarTopicsMastered: 0,
          exercisesCompleted: 0,
          totalStudyTime: 0,
          currentStreak: 0,
          longestStreak: 0,
          lastStudied: new Date(),
          dailyGoal: 15,
        };
        
        await ctx.languageLearningDb.upsertUserLanguageProgress(newProgress);
        return newProgress;
      }
      
      return progress;
    }),

  /**
   * Get vocabulary flashcards for practice
   */
  getVocabularyFlashcards: protectedProcedure
    .input(z.object({
      language: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      limit: z.number().default(20),
    }))
    .query(async ({ ctx, input }) => {
      const items = await ctx.languageLearningDb.getVocabularyItems(input.language, input.difficulty, input.limit);
      const userProgress = await ctx.languageLearningDb.getUserVocabularyProgress(ctx.user.numericId, input.language);
      
      // Merge vocabulary items with user progress
      const flashcards = items.map(item => {
        const progress = userProgress.find(p => p.vocabularyItemId === item.id);
        return {
          ...item,
          masteryLevel: progress?.masteryLevel || 0,
          timesReviewed: progress?.timesReviewed || 0,
          lastReviewed: progress?.lastReviewed,
          nextReview: progress?.nextReview,
        };
      });
      
      return flashcards;
    }),

  /**
   * Submit vocabulary practice result
   */
  submitVocabularyPractice: protectedProcedure
    .input(z.object({
      vocabularyItemId: z.number(),
      language: z.string(),
      isCorrect: z.boolean(),
      timeSpent: z.number(), // seconds
    }))
    .mutation(async ({ ctx, input }) => {
      // Get existing progress
      const existingProgress = await ctx.languageLearningDb.getUserVocabularyProgress(ctx.user.numericId, input.language);
      const itemProgress = existingProgress.find(p => p.vocabularyItemId === input.vocabularyItemId);
      
      // Calculate new mastery level
      const currentMastery = itemProgress?.masteryLevel || 0;
      const timesReviewed = (itemProgress?.timesReviewed || 0) + 1;
      const timesCorrect = (itemProgress?.timesCorrect || 0) + (input.isCorrect ? 1 : 0);
      const timesIncorrect = (itemProgress?.timesIncorrect || 0) + (input.isCorrect ? 0 : 1);
      
      // Simple mastery calculation: (correct / total) * 100
      const newMastery = Math.round((timesCorrect / timesReviewed) * 100);
      
      // Calculate next review date using spaced repetition
      const now = new Date();
      const intervalDays = input.isCorrect ? Math.min(30, Math.pow(2, Math.floor(newMastery / 20))) : 1;
      const nextReview = new Date(now.getTime() + intervalDays * 24 * 60 * 60 * 1000);
      
      await ctx.languageLearningDb.saveUserVocabularyProgress({
        userId: ctx.user.numericId,
        vocabularyItemId: input.vocabularyItemId,
        language: input.language,
        masteryLevel: newMastery,
        timesReviewed,
        timesCorrect,
        timesIncorrect,
        lastReviewed: now,
        nextReview,
      });
      
      // Update overall language progress
      const overallProgress = await ctx.languageLearningDb.getUserLanguageProgress(ctx.user.numericId, input.language);
      if (overallProgress) {
        const allProgress = await ctx.languageLearningDb.getUserVocabularyProgress(ctx.user.numericId, input.language);
        const vocabularySize = allProgress.filter(p => p.masteryLevel >= 70).length;
        
        await ctx.languageLearningDb.upsertUserLanguageProgress({
          ...overallProgress,
          vocabularySize,
          lastStudied: now,
        });
      }
      
      return {
        newMastery,
        nextReview,
        message: input.isCorrect 
          ? "Correct! You're one step closer to fluency. Or at least, one word closer." 
          : "Incorrect. But hey, failure is just success in disguise... a really good disguise.",
      };
    }),

  /**
   * Get grammar lessons
   */
  getGrammarLessons: protectedProcedure
    .input(z.object({
      language: z.string(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
    }))
    .query(async ({ ctx, input }) => {
      const lessons = await ctx.languageLearningDb.getGrammarLessons(input.language, input.difficulty);
      const userProgress = await ctx.languageLearningDb.getUserGrammarProgress(ctx.user.numericId, input.language);
      
      // Merge lessons with user progress
      const lessonsWithProgress = lessons.map(lesson => {
        const progress = userProgress.find(p => p.grammarLessonId === lesson.id);
        return {
          ...lesson,
          completed: progress?.completed === 1,
          masteryLevel: progress?.masteryLevel || 0,
          exercisesCompleted: progress?.exercisesCompleted || 0,
          lastStudied: progress?.lastStudied,
        };
      });
      
      return lessonsWithProgress;
    }),

  /**
   * Generate AI-powered grammar explanation with examples
   */
  generateGrammarExplanation: protectedProcedure
    .input(z.object({
      language: z.string(),
      topic: z.string(),
      userLevel: z.enum(["beginner", "intermediate", "advanced"]),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `You are Agent Bob, a sarcastic but brilliant language teacher. Explain the grammar topic "${input.topic}" in ${input.language} for a ${input.userLevel} learner.

Your explanation should:
1. Be clear and accurate, but delivered with your signature sarcasm
2. Include 3-5 practical examples with translations
3. Point out common mistakes learners make
4. Add a witty cultural note or tip
5. Keep it concise (under 300 words)

Format your response as JSON with this structure:
{
  "explanation": "Main explanation text",
  "examples": [
    {"original": "Example in target language", "translation": "English translation", "note": "Brief note"}
  ],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "culturalNote": "Interesting cultural insight with sarcasm"
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are Agent Bob, a sarcastic language teacher who provides accurate information with witty commentary." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "grammar_explanation",
            strict: true,
            schema: {
              type: "object",
              properties: {
                explanation: { type: "string" },
                examples: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      original: { type: "string" },
                      translation: { type: "string" },
                      note: { type: "string" }
                    },
                    required: ["original", "translation", "note"],
                    additionalProperties: false
                  }
                },
                commonMistakes: {
                  type: "array",
                  items: { type: "string" }
                },
                culturalNote: { type: "string" }
              },
              required: ["explanation", "examples", "commonMistakes", "culturalNote"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const explanation = typeof content === 'string' ? JSON.parse(content) : content;

      return explanation;
    }),

  /**
   * Get exercises for practice
   */
  getExercises: protectedProcedure
    .input(z.object({
      language: z.string(),
      exerciseType: z.enum(["translation", "fill_blank", "multiple_choice", "matching", "listening", "speaking"]).optional(),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
      limit: z.number().default(10),
    }))
    .query(async ({ ctx, input }) => {
      const exercises = await ctx.languageLearningDb.getLanguageExercises(
        input.language,
        input.exerciseType,
        input.difficulty
      );
      
      return exercises;
    }),

  /**
   * Generate AI-powered exercises
   */
  generateExercises: protectedProcedure
    .input(z.object({
      language: z.string(),
      topic: z.string(),
      exerciseType: z.enum(["translation", "fill_blank", "multiple_choice"]),
      difficulty: z.enum(["beginner", "intermediate", "advanced"]),
      count: z.number().min(1).max(10).default(5),
    }))
    .mutation(async ({ ctx, input }) => {
      const prompt = `Generate ${input.count} ${input.exerciseType} exercises in ${input.language} for ${input.difficulty} learners on the topic: ${input.topic}.

For each exercise:
- Make it practical and useful
- Include clear instructions
- Provide the correct answer
- Add a brief explanation

Format as JSON array with this structure:
{
  "exercises": [
    {
      "prompt": "Exercise question or instruction",
      "options": ["Option A", "Option B", "Option C", "Option D"], // for multiple_choice only
      "correctAnswer": "The correct answer",
      "explanation": "Why this is correct (with Bob's sarcasm)"
    }
  ]
}`;

      const response = await invokeLLM({
        messages: [
          { role: "system", content: "You are Agent Bob, creating language learning exercises with your signature wit." },
          { role: "user", content: prompt }
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "language_exercises",
            strict: true,
            schema: {
              type: "object",
              properties: {
                exercises: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      prompt: { type: "string" },
                      options: {
                        type: "array",
                        items: { type: "string" }
                      },
                      correctAnswer: { type: "string" },
                      explanation: { type: "string" }
                    },
                    required: ["prompt", "correctAnswer", "explanation"],
                    additionalProperties: false
                  }
                }
              },
              required: ["exercises"],
              additionalProperties: false
            }
          }
        }
      });

      const content = response.choices[0].message.content;
      const result = typeof content === 'string' ? JSON.parse(content) : content;

      return result.exercises;
    }),

  /**
   * Submit exercise answer
   */
  submitExerciseAnswer: protectedProcedure
    .input(z.object({
      exerciseId: z.number(),
      language: z.string(),
      userAnswer: z.string(),
      timeSpent: z.number(), // seconds
    }))
    .mutation(async ({ ctx, input }) => {
      // Get the exercise to check the answer
      const exercises = await ctx.languageLearningDb.getLanguageExercises(input.language);
      const exercise = exercises.find(e => e.id === input.exerciseId);
      
      if (!exercise) {
        throw new Error("Exercise not found");
      }
      
      // Check if answer is correct (case-insensitive comparison)
      const isCorrect = input.userAnswer.trim().toLowerCase() === exercise.correctAnswer.trim().toLowerCase();
      
      // Save attempt
      await ctx.languageLearningDb.saveExerciseAttempt({
        userId: ctx.user.numericId,
        exerciseId: input.exerciseId,
        language: input.language,
        userAnswer: input.userAnswer,
        isCorrect: isCorrect ? 1 : 0,
        timeSpent: input.timeSpent,
        hintsUsed: 0,
      });
      
      // Update overall progress
      const progress = await ctx.languageLearningDb.getUserLanguageProgress(ctx.user.numericId, input.language);
      if (progress) {
        await ctx.languageLearningDb.upsertUserLanguageProgress({
          ...progress,
          exercisesCompleted: progress.exercisesCompleted + 1,
          lastStudied: new Date(),
        });
      }
      
      return {
        isCorrect,
        correctAnswer: exercise.correctAnswer,
        explanation: exercise.explanation,
        sarcasticFeedback: isCorrect
          ? "Well, well, well. Look who got it right. I'm almost impressed. Almost."
          : "Oops. That's not quite it. But don't worry, even native speakers mess this up... just not this badly.",
      };
    }),

  /**
   * Get daily lesson plan
   */
  getDailyLesson: protectedProcedure
    .input(z.object({
      language: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Check if lesson already exists for today
      const existingLesson = await ctx.languageLearningDb.getDailyLesson(ctx.user.numericId, input.language, today);
      
      if (existingLesson) {
        return {
          ...existingLesson,
          vocabularyItems: JSON.parse(existingLesson.vocabularyItems),
          grammarTopics: existingLesson.grammarTopics ? JSON.parse(existingLesson.grammarTopics) : [],
          exercises: JSON.parse(existingLesson.exercises),
        };
      }
      
      // Generate new daily lesson
      const userProgress = await ctx.languageLearningDb.getUserLanguageProgress(ctx.user.numericId, input.language);
      const difficulty = userProgress?.level || "beginner";
      
      // Get vocabulary items for review (spaced repetition)
      const vocabItems = await ctx.languageLearningDb.getVocabularyItems(input.language, difficulty, 10);
      const vocabIds = vocabItems.map(v => v.id);
      
      // Get exercises
      const exercises = await ctx.languageLearningDb.getLanguageExercises(input.language, undefined, difficulty);
      const exerciseIds = exercises.map(e => e.id);
      
      // Save daily lesson
      await ctx.languageLearningDb.saveDailyLesson({
        userId: ctx.user.numericId,
        language: input.language,
        lessonDate: today,
        vocabularyItems: JSON.stringify(vocabIds),
        grammarTopics: JSON.stringify([]),
        exercises: JSON.stringify(exerciseIds),
        completed: 0,
      });
      
      return {
        vocabularyItems: vocabIds,
        grammarTopics: [],
        exercises: exerciseIds,
        message: "Here's your daily dose of linguistic torture. Enjoy!",
      };
    }),

  /**
   * Get user achievements
   */
  getAchievements: protectedProcedure
    .input(z.object({
      language: z.string(),
    }))
    .query(async ({ ctx, input }) => {
      const achievements = await ctx.languageLearningDb.getUserAchievements(ctx.user.numericId, input.language);
      return achievements;
    }),

  /**
   * Get supported languages
   */
  getSupportedLanguages: protectedProcedure
    .query(async () => {
      // Return list of supported languages
      return [
        { code: "es", name: "Spanish", flag: "🇪🇸", learners: 24000000 },
        { code: "fr", name: "French", flag: "🇫🇷", learners: 15000000 },
        { code: "de", name: "German", flag: "🇩🇪", learners: 12000000 },
        { code: "it", name: "Italian", flag: "🇮🇹", learners: 8000000 },
        { code: "pt", name: "Portuguese", flag: "🇵🇹", learners: 7000000 },
        { code: "ja", name: "Japanese", flag: "🇯🇵", learners: 6000000 },
        { code: "ko", name: "Korean", flag: "🇰🇷", learners: 5000000 },
        { code: "zh", name: "Chinese", flag: "🇨🇳", learners: 4500000 },
        { code: "ru", name: "Russian", flag: "🇷🇺", learners: 3000000 },
        { code: "ar", name: "Arabic", flag: "🇸🇦", learners: 2500000 },
      ];
    }),
});
