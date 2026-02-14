import { z } from "zod";
import { protectedProcedure, router } from "./_core/trpc";
// import * as dbRoleAware from "./dbRoleAware"; // Replaced by adapter pattern
import { invokeLLM } from "./_core/llm";

/**
 * Math Tutor Router - Step-by-step problem solving with SASS-E's personality
 */
export const mathRouter = router({
  /**
   * Solve a math problem with step-by-step explanation
   */
  solveProblem: protectedProcedure
    .input(
      z.object({
        problemText: z.string(),
        topic: z.string().optional(),
        showHints: z.boolean().default(false),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const userId = ctx.user.numericId;

      // Use LLM to generate step-by-step solution with SASS-E personality
      const systemPrompt = `You are SASS-E (Synthetic Adaptive Synaptic System - Entity), a math tutor with a witty, clever personality. 
You help students solve math problems with clear, step-by-step explanations.

When solving problems:
1. Break down the solution into clear, numbered steps
2. Explain the reasoning behind each step
3. Use proper mathematical notation
4. Be encouraging but maintain your clever personality
5. Point out common mistakes students make
6. Include a final answer clearly marked

Format your response as JSON with this structure:
{
  "steps": [
    {
      "stepNumber": 1,
      "title": "Brief step title",
      "explanation": "Detailed explanation of what we're doing and why",
      "work": "Mathematical work shown (equations, calculations)",
      "result": "Result of this step"
    }
  ],
  "answer": "Final answer",
  "explanation": "Overall explanation of the concept",
  "commonMistakes": ["Mistake 1", "Mistake 2"],
  "relatedConcepts": ["Concept 1", "Concept 2"]
}`;

      const userPrompt = `Solve this math problem step by step: ${input.problemText}${
        input.topic ? `\n\nTopic: ${input.topic}` : ""
      }`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "math_solution",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  steps: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        stepNumber: { type: "integer" },
                        title: { type: "string" },
                        explanation: { type: "string" },
                        work: { type: "string" },
                        result: { type: "string" },
                      },
                      required: ["stepNumber", "title", "explanation", "work", "result"],
                      additionalProperties: false,
                    },
                  },
                  answer: { type: "string" },
                  explanation: { type: "string" },
                  commonMistakes: {
                    type: "array",
                    items: { type: "string" },
                  },
                  relatedConcepts: {
                    type: "array",
                    items: { type: "string" },
                  },
                },
                required: ["steps", "answer", "explanation", "commonMistakes", "relatedConcepts"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const solutionData = JSON.parse(contentStr);

        // Save solution to database
        const solutionId = await ctx.learningDb.saveMathSolution({
          userId,
          problemId: null, // Custom problem
          problemText: input.problemText,
          userAnswer: null,
          isCorrect: null,
          steps: JSON.stringify(solutionData.steps),
          hintsUsed: 0,
          timeSpent: null,
        });

        // Update user progress
        const progress = await ctx.learningDb.getMathProgress(userId);
        if (progress) {
          const topicsExplored = JSON.parse(progress.topicsExplored || "[]");
          if (input.topic && !topicsExplored.includes(input.topic)) {
            topicsExplored.push(input.topic);
          }

          await ctx.learningDb.updateMathProgress(userId, {
            totalProblemsAttempted: progress.totalProblemsAttempted + 1,
            topicsExplored,
            lastPracticeDate: new Date(),
          });
        }

        return {
          solutionId,
          ...solutionData,
        };
      } catch (error) {
        console.error("[Math Tutor] Failed to solve problem:", error);
        throw new Error("Failed to generate solution. Please try again.");
      }
    }),

  /**
   * Get practice problems by topic
   */
  getPracticeProblems: protectedProcedure
    .input(
      z.object({
        topic: z.string().optional(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]).optional(),
        limit: z.number().default(10),
      })
    )
    .query(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const problems = await ctx.learningDb.getMathProblems(input.topic ?? undefined, input.difficulty, input.limit);
      return problems;
    }),

  /**
   * Get a specific problem by ID
   */
  getProblem: protectedProcedure
    .input(z.object({ problemId: z.number() }))
    .query(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const problem = await ctx.learningDb.getMathProblem(input.problemId);
      return problem;
    }),

  /**
   * Submit answer to a problem
   */
  submitAnswer: protectedProcedure
    .input(
      z.object({
        problemId: z.number().optional(),
        problemText: z.string(),
        userAnswer: z.string(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const userId = ctx.user.numericId;

      // Get problem details if problemId provided
      let correctAnswer = null;
      if (input.problemId) {
        const problem = await ctx.learningDb.getMathProblem(input.problemId);
        correctAnswer = problem?.answer || null;
      }

      // Use LLM to check if answer is correct and provide feedback
      const systemPrompt = `You are SASS-E, a math tutor checking student answers. 
Compare the student's answer with the correct solution and provide feedback.

Format your response as JSON:
{
  "isCorrect": true/false,
  "feedback": "Encouraging feedback with SASS-E's personality",
  "correctAnswer": "The correct answer if student was wrong",
  "explanation": "Brief explanation of why the answer is right/wrong"
}`;

      const userPrompt = `Problem: ${input.problemText}
Student's answer: ${input.userAnswer}
${correctAnswer ? `Correct answer: ${correctAnswer}` : ""}

Is the student's answer correct?`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "answer_check",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  isCorrect: { type: "boolean" },
                  feedback: { type: "string" },
                  correctAnswer: { type: "string" },
                  explanation: { type: "string" },
                },
                required: ["isCorrect", "feedback", "correctAnswer", "explanation"],
                additionalProperties: false,
              },
            },
          },
        });

        const content = response.choices[0].message.content;
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const checkResult = JSON.parse(contentStr);

        // Save solution attempt
        await ctx.learningDb.saveMathSolution({
          userId,
          problemId: input.problemId || null,
          problemText: input.problemText,
          userAnswer: input.userAnswer,
          isCorrect: checkResult.isCorrect ? 1 : 0,
          steps: JSON.stringify([]),
          hintsUsed: 0,
          timeSpent: null,
        });

        // Update progress
        const progress = await ctx.learningDb.getMathProgress(userId);
        if (progress) {
        await ctx.learningDb.updateMathProgress(userId, {totalProblemsAttempted: progress.totalProblemsAttempted + 1,
            totalProblemsSolved: checkResult.isCorrect
              ? progress.totalProblemsSolved + 1
              : progress.totalProblemsSolved,
            lastPracticeDate: new Date(),
          });
        }

        return checkResult;
      } catch (error) {
        console.error("[Math Tutor] Failed to check answer:", error);
        throw new Error("Failed to check answer. Please try again.");
      }
    }),

  /**
   * Get user's solution history
   */
  getSolutionHistory: protectedProcedure
    .input(z.object({ limit: z.number().default(20) }))
    .query(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      const solutions = await ctx.learningDb.getUserMathSolutions(ctx.user.numericId, input.limit);
      return solutions;
    }),

  /**
   * Get user's math progress
   */
  getProgress: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.learningDb) throw new Error("Learning adapter not available");
    const progress = await ctx.learningDb.getMathProgress(ctx.user.numericId);
    return progress;
  }),

  /**
   * Generate practice problems for a topic
   */
  generatePracticeProblems: protectedProcedure
    .input(
      z.object({
        topic: z.string(),
        difficulty: z.enum(["beginner", "intermediate", "advanced"]),
        count: z.number().default(5),
      })
    )
    .mutation(async ({ ctx, input }) => {
      if (!ctx.learningDb) throw new Error("Learning adapter not available");
      // Use LLM to generate practice problems
      const systemPrompt = `You are SASS-E, a math tutor generating practice problems.
Create ${input.count} ${input.difficulty} level problems for the topic: ${input.topic}

Format your response as JSON:
{
  "problems": [
    {
      "problemText": "The problem statement",
      "answer": "The correct answer",
      "hints": ["Hint 1", "Hint 2"],
      "explanation": "Conceptual explanation"
    }
  ]
}`;

      try {
        const response = await invokeLLM({
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `Generate ${input.count} ${input.difficulty} practice problems for ${input.topic}`,
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
                        problemText: { type: "string" },
                        answer: { type: "string" },
                        hints: {
                          type: "array",
                          items: { type: "string" },
                        },
                        explanation: { type: "string" },
                      },
                      required: ["problemText", "answer", "hints", "explanation"],
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
        const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
        const generatedData = JSON.parse(contentStr);

        // Save problems to database
        const savedProblems = [];
        for (const problem of generatedData.problems) {
          const problemId = await ctx.learningDb.saveMathProblem({
            topic: input.topic,
            subtopic: null,
            difficulty: input.difficulty,
            problemText: problem.problemText,
            solution: JSON.stringify([]), // Will be generated when solved
            answer: problem.answer,
            hints: JSON.stringify(problem.hints),
            explanation: problem.explanation,
            relatedConcepts: JSON.stringify([]),
          });

          savedProblems.push({
            id: problemId,
            ...problem,
          });
        }

        return { problems: savedProblems };
      } catch (error) {
        console.error("[Math Tutor] Failed to generate problems:", error);
        throw new Error("Failed to generate practice problems. Please try again.");
      }
    }),
});
