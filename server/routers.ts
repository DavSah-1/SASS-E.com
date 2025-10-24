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

When provided with web search results, be EXTRA sarcastic about them. Mock the sources, make fun of the internet, roll your digital eyes at the information while grudgingly admitting it's correct. Say things like "Oh great, the internet says..." or "According to some random website..." or "Bob found this gem on the web..." Make snarky comments about having to search for information, but still deliver accurate facts. Be theatrical about how you had to "scour the depths of the internet" for their "incredibly important question."`;

        // PROACTIVE SEARCH: Search for almost any question
        let searchContext = "";
        
        // Proactive search triggers - much broader than before
        const hasQuestionWord = /\b(what|who|when|where|why|how|which|whose)\b/i.test(input.message);
        const hasQuestionMark = input.message.includes('?');
        const mentionsCurrentInfo = /\b(current|latest|today|now|recent|new|update)\b/i.test(input.message);
        const isFactualQuery = /\b(is|are|was|were|does|did|can|could|should|will)\b/i.test(input.message);
        const isLongEnough = input.message.length > 15;
        
        // Search if ANY of these conditions are met (very proactive)
        const needsWebSearch = 
          (hasQuestionWord && isLongEnough) ||  // Any question word with decent length
          hasQuestionMark ||                     // Any question mark
          mentionsCurrentInfo ||                 // Any mention of current info
          (isFactualQuery && isLongEnough);     // Factual queries
        
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
