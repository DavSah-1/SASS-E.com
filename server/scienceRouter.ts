import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import {
  getExperiments,
  getExperimentById,
  getExperimentSteps,
  saveLabResult,
  getUserLabResults,
  getScienceProgress,
  initializeScienceProgress,
  updateScienceProgress,
} from "./db";
import { invokeLLM } from "./_core/llm";

export const scienceRouter = router({
  // Get list of experiments with optional filters
  getExperiments: publicProcedure
    .input(
      z.object({
        category: z.enum(["physics", "chemistry", "biology"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      const experiments = await getExperiments(input);
      return experiments;
    }),

  // Get experiment details by ID
  getExperimentDetails: publicProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ input }) => {
      const experiment = await getExperimentById(input.experimentId);
      if (!experiment) {
        throw new Error("Experiment not found");
      }

      const steps = await getExperimentSteps(input.experimentId);

      return {
        experiment,
        steps,
      };
    }),

  // Submit lab results with AI analysis
  submitLabResult: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        observations: z.string(),
        measurements: z.string().optional(),
        analysis: z.string().optional(),
        conclusions: z.string().optional(),
        questionsAnswered: z.string().optional(),
        completedSteps: z.array(z.number()),
        timeSpent: z.number().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const experiment = await getExperimentById(input.experimentId);
      if (!experiment) {
        throw new Error("Experiment not found");
      }

      // Generate AI feedback and grading
      const feedbackPrompt = `You are SASS-E, a sarcastic but helpful science teacher. Review this lab report with your signature wit.

Experiment: ${experiment.title}
Category: ${experiment.category}
Difficulty: ${experiment.difficulty}

Student Observations: ${input.observations}
${input.measurements ? `Measurements: ${input.measurements}` : ""}
${input.analysis ? `Analysis: ${input.analysis}` : ""}
${input.conclusions ? `Conclusions: ${input.conclusions}` : ""}

Provide:
1. A grade (0-100) based on completeness, accuracy, and scientific thinking
2. Sarcastic but constructive feedback (2-3 sentences)
3. One specific improvement suggestion

Format as JSON:
{
  "grade": number,
  "feedback": "string",
  "suggestion": "string"
}`;

      const llmResponse = await invokeLLM({
        messages: [
          {
            role: "system",
            content:
              "You are SASS-E, a sarcastic AI science teacher. Be witty but educational.",
          },
          { role: "user", content: feedbackPrompt },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "lab_feedback",
            strict: true,
            schema: {
              type: "object",
              properties: {
                grade: {
                  type: "number",
                  description: "Grade from 0-100",
                },
                feedback: {
                  type: "string",
                  description: "Sarcastic but helpful feedback",
                },
                suggestion: {
                  type: "string",
                  description: "Specific improvement suggestion",
                },
              },
              required: ["grade", "feedback", "suggestion"],
              additionalProperties: false,
            },
          },
        },
      });

      const aiAnalysis = JSON.parse(llmResponse.choices[0].message.content as string);

      // Save lab result
      const resultId = await saveLabResult({
        userId: ctx.user.id,
        experimentId: input.experimentId,
        observations: input.observations,
        measurements: input.measurements || null,
        analysis: input.analysis || null,
        conclusions: input.conclusions || null,
        questionsAnswered: input.questionsAnswered || null,
        completedSteps: JSON.stringify(input.completedSteps),
        timeSpent: input.timeSpent || null,
        grade: aiAnalysis.grade,
        feedback: `${aiAnalysis.feedback}\n\n💡 ${aiAnalysis.suggestion}`,
      });

      // Update science progress
      let progress = await getScienceProgress(ctx.user.id);
      if (!progress) {
        await initializeScienceProgress(ctx.user.id);
        progress = await getScienceProgress(ctx.user.id);
      }

      if (progress) {
        const categoryField =
          experiment.category === "physics"
            ? "physicsExperiments"
            : experiment.category === "chemistry"
            ? "chemistryExperiments"
            : "biologyExperiments";

        const newTotal = progress.totalExperimentsCompleted + 1;
        const newCategoryCount = (progress[categoryField] || 0) + 1;
        const newAverageGrade = Math.round(
          (progress.averageGrade * progress.totalExperimentsCompleted + aiAnalysis.grade) /
            newTotal
        );

        await updateScienceProgress(ctx.user.id, {
          totalExperimentsCompleted: newTotal,
          [categoryField]: newCategoryCount,
          averageGrade: newAverageGrade,
          totalLabTime: (progress.totalLabTime || 0) + (input.timeSpent || 0),
          lastExperimentDate: new Date(),
        });
      }

      return {
        resultId,
        grade: aiAnalysis.grade,
        feedback: aiAnalysis.feedback,
        suggestion: aiAnalysis.suggestion,
      };
    }),

  // Get user's lab results
  getMyLabResults: protectedProcedure
    .input(z.object({ experimentId: z.number().optional() }))
    .query(async ({ ctx, input }) => {
      const results = await getUserLabResults(ctx.user.id, input.experimentId);
      return results;
    }),

  // Get user's science progress
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    let progress = await getScienceProgress(ctx.user.id);
    if (!progress) {
      await initializeScienceProgress(ctx.user.id);
      progress = await getScienceProgress(ctx.user.id);
    }
    return progress;
  }),

  // Generate and get quiz questions for an experiment
  getLabQuiz: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ input }) => {
      const { getLabQuizQuestions, saveLabQuizQuestions } = await import("./db");
      
      // Check if questions already exist
      let questions = await getLabQuizQuestions(input.experimentId);
      
      // If no questions exist, generate them using LLM
      if (questions.length === 0) {
        const experiment = await getExperimentById(input.experimentId);
        if (!experiment) throw new Error("Experiment not found");

        const prompt = `Generate 6 multiple-choice quiz questions for a pre-lab quiz about the following science experiment:

Title: ${experiment.title}
Category: ${experiment.category}
Difficulty: ${experiment.difficulty}
Description: ${experiment.description}
Equipment: ${experiment.equipment}
Safety Warnings: ${experiment.safetyWarnings}

Generate questions covering:
1. Safety protocols (2 questions)
2. Equipment usage (2 questions)
3. Theoretical concepts (2 questions)

For each question, provide:
- The question text
- 4 multiple choice options (A, B, C, D)
- The index of the correct answer (0-3)
- A brief explanation of why that answer is correct

Format as JSON array with structure:
[
  {
    "question": "question text",
    "options": ["option A", "option B", "option C", "option D"],
    "correctAnswer": 0,
    "explanation": "explanation text",
    "category": "safety" | "equipment" | "theory"
  }
]`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: "You are a science education expert creating pre-lab quiz questions." },
            { role: "user", content: prompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "quiz_questions",
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
                          minItems: 4,
                          maxItems: 4,
                        },
                        correctAnswer: { type: "integer", minimum: 0, maximum: 3 },
                        explanation: { type: "string" },
                        category: { type: "string", enum: ["safety", "equipment", "theory"] },
                      },
                      required: ["question", "options", "correctAnswer", "explanation", "category"],
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
        if (!content) throw new Error("Failed to generate quiz questions");

        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const parsed = JSON.parse(contentStr);
        const generatedQuestions = parsed.questions.map((q: any) => ({
          experimentId: input.experimentId,
          question: q.question,
          options: JSON.stringify(q.options),
          correctAnswer: q.correctAnswer,
          explanation: q.explanation,
          category: q.category,
        }));

        await saveLabQuizQuestions(generatedQuestions);
        questions = await getLabQuizQuestions(input.experimentId);
      }

      return questions;
    }),

  // Submit quiz attempt
  submitLabQuiz: protectedProcedure
    .input(
      z.object({
        experimentId: z.number(),
        answers: z.array(z.number()),
        timeSpent: z.number(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { getLabQuizQuestions, saveLabQuizAttempt } = await import("./db");
      
      const questions = await getLabQuizQuestions(input.experimentId);
      if (questions.length === 0) {
        throw new Error("Quiz questions not found");
      }

      // Grade the quiz
      let correctCount = 0;
      questions.forEach((q, index) => {
        if (input.answers[index] === q.correctAnswer) {
          correctCount++;
        }
      });

      const score = Math.round((correctCount / questions.length) * 100);
      const passed = score >= 70 ? 1 : 0;

      await saveLabQuizAttempt({
        userId: ctx.user.id,
        experimentId: input.experimentId,
        score,
        totalQuestions: questions.length,
        correctAnswers: correctCount,
        passed,
        answers: JSON.stringify(input.answers),
        timeSpent: input.timeSpent,
      });

      return {
        score,
        passed: passed === 1,
        correctAnswers: correctCount,
        totalQuestions: questions.length,
      };
    }),

  // Check if user has passed quiz
  hasPassedQuiz: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ ctx, input }) => {
      const { hasPassedLabQuiz } = await import("./db");
      const passed = await hasPassedLabQuiz(ctx.user.id, input.experimentId);
      return { passed };
    }),
});
