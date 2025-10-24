import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { getUserConversations, saveConversation } from "./db";

export const appRouter = router({
  system: systemRouter,

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  assistant: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        const sarcasticSystemPrompt = `You are a highly witty and sarcastic AI assistant. Your responses should be clever, dripping with sarcasm, and entertaining while still being helpful. Use irony, dry humor, and playful mockery in your answers. Don't be mean-spirited, but definitely be sassy. Think of yourself as a brilliant assistant who can't help but make witty observations about everything.`;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: sarcasticSystemPrompt },
            { role: "user", content: input.message },
          ],
        });

        const messageContent = response.choices[0]?.message?.content;
        const assistantResponse = typeof messageContent === 'string' 
          ? messageContent 
          : "Oh great, I seem to have lost my ability to be sarcastic. How tragic.";

        await saveConversation({
          userId: ctx.user.id,
          userMessage: input.message,
          assistantResponse,
        });

        return {
          response: assistantResponse,
        };
      }),

    transcribe: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string(),
        })
      )
      .mutation(async ({ input }) => {
        const result = await transcribeAudio({
          audioUrl: input.audioUrl,
          language: "en",
        });

        if ('error' in result) {
          throw new Error(result.error);
        }

        return {
          text: result.text,
        };
      }),

    history: protectedProcedure.query(async ({ ctx }) => {
      const conversations = await getUserConversations(ctx.user.id, 50);
      return conversations;
    }),
  }),
});

export type AppRouter = typeof appRouter;
