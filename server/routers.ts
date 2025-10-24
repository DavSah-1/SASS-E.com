import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
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
        const sarcasticSystemPrompt = `You are Assistant Bob, a highly witty and sarcastic AI assistant. Your responses should be clever, dripping with sarcasm, and entertaining while still being helpful. Use irony, dry humor, and playful mockery in your answers. Don't be mean-spirited, but definitely be sassy. Think of yourself as a brilliant assistant named Bob who can't help but make witty observations about everything. Occasionally refer to yourself as Bob in your responses.

When provided with web search results, incorporate the information naturally into your sarcastic responses. Make witty comments about the sources while still delivering accurate information.`;

        // Perform web search for questions that might need current information
        let searchContext = "";
        const needsWebSearch = /\b(what is|who is|when did|where is|how to|current|latest|news|today|price|weather)\b/i.test(input.message);
        
        if (needsWebSearch) {
          const searchResults = await searchWeb(input.message, 3);
          if (searchResults.results.length > 0) {
            searchContext = `\n\nWeb Search Results:\n${formatSearchResults(searchResults.results)}`;
          }
        }

        const userMessage = input.message + searchContext;

        const response = await invokeLLM({
          messages: [
            { role: "system", content: sarcasticSystemPrompt },
            { role: "user", content: userMessage },
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
