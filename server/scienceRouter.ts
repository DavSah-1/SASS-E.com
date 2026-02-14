import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
// import * as dbRoleAware from "./dbRoleAware"; // Replaced by adapter pattern
import { invokeLLM } from "./_core/llm";

export const scienceRouter = router({
  // Get list of experiments with optional filters
  getExperiments: protectedProcedure
    .input(
      z.object({
        category: z.enum(["physics", "chemistry", "biology"]).optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const experiments = await ctx.learningDb.getExperiments(input);
      return experiments;
    }),

  // Get experiment details by ID
  getExperimentDetails: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const experiment = await ctx.learningDb.getExperimentById(input.experimentId);
      if (!experiment) {
        throw new Error("Experiment not found");
      }

      const steps = await ctx.learningDb.getExperimentSteps(input.experimentId);

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
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const experiment = await ctx.learningDb.getExperimentById(input.experimentId);
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
      const resultId = await ctx.learningDb.saveLabResult({
        userId: ctx.user.numericId,
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
      let progress = await ctx.learningDb.getScienceProgress(ctx.user.numericId);
      if (!progress) {
        await ctx.learningDb.initializeScienceProgress(ctx.user.numericId);
        progress = await ctx.learningDb.getScienceProgress(ctx.user.numericId);
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

        await ctx.learningDb.updateScienceProgress(ctx.user.numericId, {
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
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const results = await ctx.learningDb.getUserLabResults(ctx.user.numericId, input.experimentId);
      return results;
    }),

  // Get user's science progress
  getMyProgress: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.learningDb) throw new Error("Learning adapter not available");
    let progress = await ctx.learningDb.getScienceProgress(ctx.user.numericId);
    if (!progress) {
      await ctx.learningDb.initializeScienceProgress(ctx.user.numericId);
      progress = await ctx.learningDb.getScienceProgress(ctx.user.numericId);
    }
    return progress;
  }),

  // Generate and get quiz questions for an experiment
  getLabQuiz: protectedProcedure
    .input(z.object({ experimentId: z.number() }))
    .query(async ({ input }) => {
      try {
        const { getLabQuizQuestions, saveLabQuizQuestions } = await import("./db");
        
        // Check if questions already exist
        let questions = await getLabQuizQuestions(input.experimentId);
        
        // If no questions exist, use fallback questions (LLM generation has compatibility issues)
        if (questions.length === 0) {
          // Use generic pre-lab quiz questions as fallback
          const fallbackQuestions = [
            {
              experimentId: input.experimentId,
              question: "What is the most important safety rule before starting any lab experiment?",
              options: JSON.stringify(["Work quickly", "Read all instructions and safety warnings", "Use the most expensive equipment", "Work alone"]),
              correctAnswer: 1,
              explanation: "Reading instructions and safety warnings prevents accidents and ensures proper procedure.",
              category: "safety"
            },
            {
              experimentId: input.experimentId,
              question: "What should you do if you spill a chemical or break equipment?",
              options: JSON.stringify(["Clean it up quickly yourself", "Leave it for someone else", "Immediately notify the instructor", "Continue with the experiment"]),
              correctAnswer: 2,
              explanation: "Notifying the instructor ensures proper cleanup and prevents injuries.",
              category: "safety"
            },
            {
              experimentId: input.experimentId,
              question: "Why is it important to familiarize yourself with lab equipment before use?",
              options: JSON.stringify(["To impress others", "To prevent damage and ensure accurate results", "It's not important", "To work faster"]),
              correctAnswer: 1,
              explanation: "Proper equipment use prevents damage, ensures safety, and produces reliable data.",
              category: "equipment"
            },
            {
              experimentId: input.experimentId,
              question: "What is the purpose of recording observations during an experiment?",
              options: JSON.stringify(["To fill time", "To document data for analysis and conclusions", "To make the lab report longer", "It's optional"]),
              correctAnswer: 1,
              explanation: "Accurate observations are essential for data analysis and drawing valid conclusions.",
              category: "equipment"
            },
            {
              experimentId: input.experimentId,
              question: "What is a hypothesis in scientific experiments?",
              options: JSON.stringify(["A proven fact", "A testable prediction based on observations", "A random guess", "The final conclusion"]),
              correctAnswer: 1,
              explanation: "A hypothesis is a testable prediction that guides experimental design and analysis.",
              category: "theory"
            },
            {
              experimentId: input.experimentId,
              question: "Why is it important to control variables in an experiment?",
              options: JSON.stringify(["To make it more complicated", "To isolate the effect of the independent variable", "To use more equipment", "It's not important"]),
              correctAnswer: 1,
              explanation: "Controlling variables ensures that observed effects are due to the independent variable, not confounding factors.",
              category: "theory"
            }
          ];
          
          await saveLabQuizQuestions(fallbackQuestions);
          questions = await getLabQuizQuestions(input.experimentId);
        }
        /* LLM generation disabled due to json_schema compatibility issues
        if (questions.length === 0) {
        const experiment = await ctx.learningDb.getExperimentById(input.experimentId);
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
            { role: "system", content: "You are a science education expert creating pre-lab quiz questions. Always respond with valid JSON only." },
            { role: "user", content: prompt + "\n\nRespond with ONLY the JSON array, no additional text." },
          ],
          response_format: {
            type: "json_object",
          },
        });

        console.log("[getLabQuiz] LLM response:", JSON.stringify(response, null, 2));
        
        if (!response || !response.choices || response.choices.length === 0) {
          throw new Error("LLM returned empty response");
        }
        
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
      */

      return questions;
      } catch (error) {
        console.error("[getLabQuiz] Error generating quiz:", error);
        throw new Error(`Failed to generate quiz: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
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
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
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
        userId: ctx.user.numericId,
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
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const { hasPassedLabQuiz } = await import("./db");
      const passed = await hasPassedLabQuiz(ctx.user.numericId, input.experimentId);
      return { passed };
    }),
});
