import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
import * as dbRoleAware from "./dbRoleAware";
import { invokeLLM } from "./_core/llm";

/**
 * Topic Learning Router - Learn, Practice, Quiz system for math topics
 */
export const topicRouter = router({
  /**
   * Get lesson content for a topic (AI-generated)
   */
  getLessonContent: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      // Get or create progress
      const progress = await dbRoleAware.getTopicProgress(ctx, userId, input.topicName, input.category);

      // Generate lesson content using LLM
      const systemPrompt = `You are SASS-E (Synthetic Adaptive Synaptic System - Entity), a witty and clever math tutor for young learners.
Create an engaging, age-appropriate lesson for "${input.topicName}" suitable for Pre-K to Grade 2 students.

Your lesson should include:
1. A simple, clear explanation of the concept
2. 3-4 concrete examples with visual descriptions
3. Real-world applications kids can relate to
4. Fun facts or memory tricks
5. Common mistakes to avoid

Keep the language simple, encouraging, and fun. Use emojis and relatable examples.

Format your response as JSON:
{
  "title": "Lesson title",
  "introduction": "Brief intro paragraph",
  "explanation": "Main concept explanation",
  "examples": [
    {
      "title": "Example title",
      "description": "Example explanation",
      "visual": "Description of visual representation"
    }
  ],
  "realWorldApplications": ["Application 1", "Application 2"],
  "funFacts": ["Fun fact 1", "Fun fact 2"],
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Create a lesson for: ${input.topicName}` },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "lesson_content",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  introduction: { type: "string" },
                  explanation: { type: "string" },
                  examples: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        description: { type: "string" },
                        visual: { type: "string" },
                      },
                      required: ["title", "description", "visual"],
                      additionalProperties: false,
                    },
                  },
                  realWorldApplications: {
                    type: "array",
                    items: { type: "string" },
                  },
                  funFacts: {
                    type: "array",
                    items: { type: "string" },
                  },
                  commonMistakes: {
                    type: "array",
                    items: { type: "string" },
                  },
                  keyTakeaways: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: [
                  "title",
                  "introduction",
                  "explanation",
                  "examples",
                  "realWorldApplications",
                  "funFacts",
                  "commonMistakes",
                  "keyTakeaways",
                ],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        const lessonData = JSON.parse(contentStr);

        // Update progress to "learning" status
        if (progress && progress.status === "not_started") {
          await dbRoleAware.updateTopicProgress(ctx, userId, input.topicName, input.category, {
            status: "learning",
          });
        }

        return {
          ...lessonData,
          progress,
        };
      } catch (error) {
        console.error("[Topic Learning] Failed to generate lesson:", error);
        throw new Error("Failed to generate lesson content. Please try again.");
      }
    }),

  /**
   * Mark lesson as completed
   */
  completeLesson: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      await dbRoleAware.updateTopicProgress(ctx, userId, input.topicName, input.category, {
        lessonCompleted: 1,
        status: "practicing",
      });

      return { success: true };
    }),

  /**
   * Generate practice problems for a topic
   */
  generatePracticeProblems: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
        count: z.number().default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      // Get current progress
      const progress = await dbRoleAware.getTopicProgress(ctx, userId, input.topicName, input.category);

      const systemPrompt = `You are SASS-E, creating practice problems for "${input.topicName}" for Pre-K to Grade 2 students.

Generate ${input.count} age-appropriate practice problems that:
1. Start easy and gradually increase in difficulty
2. Use simple language and relatable scenarios
3. Include visual/concrete examples
4. Are fun and engaging

Format your response as JSON:
{
  "problems": [
    {
      "question": "The problem text",
      "answer": "The correct answer",
      "hint": "A helpful hint",
      "explanation": "Why this is the answer"
    }
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${input.count} practice problems for: ${input.topicName}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "practice_problems",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  problems: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        answer: { type: "string" },
                        hint: { type: "string" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "answer", "hint", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["problems"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        const problemData = JSON.parse(contentStr);

        return {
          problems: problemData.problems,
          progress,
        };
      } catch (error) {
        console.error("[Topic Learning] Failed to generate practice problems:", error);
        throw new Error("Failed to generate practice problems. Please try again.");
      }
    }),

  /**
   * Submit practice problem answer
   */
  submitPracticeAnswer: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
        question: z.string(),
        userAnswer: z.string(),
        correctAnswer: z.string(),
        usedHint: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      // Simple answer checking (can be enhanced with LLM for more flexible matching)
      const isCorrect =
        input.userAnswer.trim().toLowerCase() === input.correctAnswer.trim().toLowerCase();

      // Update practice count
      const progress = await dbRoleAware.getTopicProgress(ctx, userId, input.topicName, input.category);
      if (progress) {
        await dbRoleAware.updateTopicProgress(ctx, userId, input.topicName, input.category, {
          practiceCount: progress.practiceCount + 1,
        });
      }

      return {
        isCorrect,
        correctAnswer: input.correctAnswer,
        feedback: isCorrect
          ? "Great job! You got it right! 🎉"
          : "Not quite, but keep trying! You're learning! 💪",
      };
    }),

  /**
   * Complete practice session
   */
  completePracticeSession: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
        problemsSolved: z.number(),
        problemsCorrect: z.number(),
        hintsUsed: z.number(),
        duration: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      const accuracy = Math.round((input.problemsCorrect / input.problemsSolved) * 100);

      // Save practice session
      await dbRoleAware.savePracticeSession(ctx, {
        userId,
        topicName: input.topicName,
        category: input.category,
        problemsSolved: input.problemsSolved,
        problemsCorrect: input.problemsCorrect,
        accuracy,
        hintsUsed: input.hintsUsed,
        duration: input.duration,
      });

      // Update progress
      const progress = await dbRoleAware.getTopicProgress(ctx, userId, input.topicName, input.category);
      if (progress) {
        // Calculate new mastery level based on practice performance
        const newMastery = Math.min(
          100,
          Math.round((progress.masteryLevel + accuracy) / 2)
        );

        await dbRoleAware.updateTopicProgress(ctx, userId, input.topicName, input.category, {
          masteryLevel: newMastery,
        });
      }

      return {
        accuracy,
        message:
          accuracy >= 80
            ? "Excellent work! You're ready for the quiz! 🌟"
            : "Good practice! Try a few more problems before the quiz. 📚",
      };
    }),

  /**
   * Generate topic quiz
   */
  generateTopicQuiz: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
        questionCount: z.number().default(10),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      const systemPrompt = `You are SASS-E, creating a quiz for "${input.topicName}" for Pre-K to Grade 2 students.

Generate ${input.questionCount} quiz questions that:
1. Test understanding of the core concept
2. Mix easy, medium, and challenging questions
3. Use clear, simple language
4. Include varied question types

Format your response as JSON:
{
  "questions": [
    {
      "question": "The question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctAnswer": "The correct option",
      "explanation": "Why this is correct"
    }
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${input.questionCount} quiz questions for: ${input.topicName}`,
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "topic_quiz",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  questions: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        question: { type: "string" },
                        options: {
                          type: "array",
                          items: { type: "string" },
                        },
                        correctAnswer: { type: "string" },
                        explanation: { type: "string" },
                      },
                      required: ["question", "options", "correctAnswer", "explanation"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["questions"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === "string" ? content : JSON.stringify(content);
        const quizData = JSON.parse(contentStr);

        return {
          questions: quizData.questions,
        };
      } catch (error) {
        console.error("[Topic Learning] Failed to generate quiz:", error);
        throw new Error("Failed to generate quiz. Please try again.");
      }
    }),

  /**
   * Submit quiz answers and get results
   */
  submitQuiz: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
        answers: z.array(
          z.object({
            question: z.string(),
            userAnswer: z.string(),
            correctAnswer: z.string(),
            isCorrect: z.boolean(),
          })
        ),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.numericId;

      const totalQuestions = input.answers.length;
      const correctAnswers = input.answers.filter((a) => a.isCorrect).length;
      const score = Math.round((correctAnswers / totalQuestions) * 100);

      // Identify weak areas
      const weakAreas = input.answers
        .filter((a) => !a.isCorrect)
        .map((a) => a.question.substring(0, 50));

      // Save quiz result
      await dbRoleAware.saveQuizResult(ctx, {
        userId,
        topicName: input.topicName,
        category: input.category,
        quizType: "topic_quiz",
        score,
        totalQuestions,
        correctAnswers,
        timeSpent: input.timeSpent,
        weakAreas,
        answers: input.answers,
      });

      // Update progress
      const progress = await dbRoleAware.getTopicProgress(ctx, userId, input.topicName, input.category);
      if (progress) {
        const newQuizzesTaken = progress.quizzesTaken + 1;
        const newBestScore = Math.max(progress.bestQuizScore, score);
        const newMasteryLevel = Math.min(100, Math.round((progress.masteryLevel + score) / 2));

        await dbRoleAware.updateTopicProgress(ctx, userId, input.topicName, input.category, {
          quizzesTaken: newQuizzesTaken,
          bestQuizScore: newBestScore,
          masteryLevel: newMasteryLevel,
          status: score >= 80 ? "mastered" : "practicing",
        });
      }

      return {
        score,
        totalQuestions,
        correctAnswers,
        passed: score >= 80,
        weakAreas,
        feedback:
          score >= 90
            ? "Outstanding! You've mastered this topic! 🏆"
            : score >= 80
            ? "Great job! You passed the quiz! 🎉"
            : score >= 60
            ? "Good effort! Review the weak areas and try again. 📖"
            : "Keep practicing! You'll get there! 💪",
      };
    }),

  /**
   * Get topic progress
   */
  getProgress: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const progress = await dbRoleAware.getTopicProgress(ctx, ctx.user.numericId, input.topicName, input.category);
      return progress;
    }),

  /**
   * Get all progress for a category
   */
  getCategoryProgress: protectedProcedure
    .input(
      z.object({
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const progressList = await dbRoleAware.getCategoryProgress(ctx, ctx.user.numericId, input.category);
      return progressList;
    }),

  /**
   * Get quiz history for a topic
   */
  getQuizHistory: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const results = await dbRoleAware.getQuizResults(ctx, ctx.user.numericId, input.topicName, input.category);
      return results;
    }),

  /**
   * Get practice history for a topic
   */
  getPracticeHistory: protectedProcedure
    .input(
      z.object({
        topicName: z.string(),
        category: z.string(),
      })
    )
    .query(async ({ ctx, input }) => {
      const sessions = await dbRoleAware.getPracticeSessions(ctx, ctx.user.numericId, input.topicName, input.category);
      return sessions;
    }),
});
