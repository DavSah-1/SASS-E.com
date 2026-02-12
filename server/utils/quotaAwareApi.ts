import { TRPCError } from "@trpc/server";
import { checkQuota, incrementQuota, type UserContext, type Service } from "./quotaTracker";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import { searchWeb } from "../_core/webSearch";
import { cacheGet, cacheSet, generateCacheKey } from "../services/cache";
import { createContextLogger } from "./logger";
import { measureAsync, logApiUsage, logError } from "./metrics";

const logger = createContextLogger('quotaAwareApi');

/**
 * Quota-Aware API Wrappers
 * 
 * These wrappers automatically check quota before making API calls
 * and increment usage after successful calls.
 * 
 * Throws TRPC errors with Bob's sarcastic messages when quota is exceeded.
 */

/**
 * Quota-aware web search using Tavily with caching
 * 
 * Caches search results to avoid redundant API calls:
 * - Cache hit: Returns cached results without incrementing quota
 * - Cache miss: Makes API call, increments quota, and caches results
 * 
 * @param ctx User context for quota tracking
 * @param query Search query
 * @param maxResults Maximum number of results
 * @returns Search results
 * @throws TRPCError if quota exceeded
 */
export async function searchWebWithQuota(
  ctx: UserContext,
  query: string,
  maxResults: number = 5
) {
  return measureAsync(
    'web_search_duration',
    async () => {
      // Generate cache key from query
      const cacheKey = generateCacheKey(query, 'search');
      
      // Check cache first
      const cached = await cacheGet<any>(cacheKey);
      if (cached) {
        logger.info(`Cache hit for search query: "${query.substring(0, 50)}..."`, { userId: ctx.id });
        return cached;
      }
      
      logger.info(`Cache miss for search query: "${query.substring(0, 50)}..."`, { userId: ctx.id });
      
      // Check quota before making the call (only on cache miss)
      const quotaCheck = await checkQuota(ctx, "tavily");
      
      if (!quotaCheck.allowed) {
        logger.warn(`Quota exceeded for user ${ctx.id} on Tavily search`, { userId: ctx.id });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Oh wow, you've hit your monthly search limit (${quotaCheck.limit} searches). Maybe try using your brain instead of relying on me for everything? Your quota resets on ${quotaCheck.resetAt.toLocaleDateString()}. Or, you know, upgrade your subscription if you can't live without my search prowess.`,
        });
      }

      const apiStart = Date.now();
      let success = false;
      let errorMessage: string | undefined;
      
      try {
        // Make the API call
        const result = await searchWeb(query, maxResults);
        success = true;

        // Increment quota after successful call (only on cache miss)
        await incrementQuota(ctx, "tavily");
        
        // Cache the result
        // Use 1 hour TTL for results, 5 minutes for empty results
        const ttl = result && result.results && result.results.length > 0 ? 3600 : 300;
        await cacheSet(cacheKey, result, { ttl });
        
        logger.info(`Search completed successfully for query: "${query.substring(0, 50)}..."`, { 
          userId: ctx.id,
          resultsCount: result?.results?.length || 0 
        });

        return result;
      } catch (error: any) {
        errorMessage = error.message;
        logger.error(`Search failed for query: "${query.substring(0, 50)}..."`, { 
          userId: ctx.id,
          error: error.message 
        });
        
        await logError({
          errorType: error.constructor.name,
          message: error.message,
          stack: error.stack,
          context: 'searchWebWithQuota',
          metadata: { query: query.substring(0, 100), maxResults },
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
        });
        
        throw error;
      } finally {
        // Log API usage
        await logApiUsage({
          apiName: 'tavily',
          endpoint: '/search',
          method: 'POST',
          duration: Date.now() - apiStart,
          quotaUsed: success ? 1 : 0,
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
          success,
          errorMessage,
        });
      }
    },
    { query: query.substring(0, 50) },
    typeof ctx.id === 'number' ? ctx.id : undefined
  );
}

/**
 * Quota-aware audio transcription using Whisper
 * 
 * @param ctx User context for quota tracking
 * @param params Transcription parameters
 * @returns Transcription result
 * @throws TRPCError if quota exceeded
 */
export async function transcribeAudioWithQuota(
  ctx: UserContext,
  params: {
    audioUrl: string;
    language?: string;
    prompt?: string;
  }
) {
  return measureAsync(
    'audio_transcription_duration',
    async () => {
      // Check quota before making the call
      const quotaCheck = await checkQuota(ctx, "whisper");
      
      if (!quotaCheck.allowed) {
        logger.warn(`Quota exceeded for user ${ctx.id} on Whisper transcription`, { userId: ctx.id });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Congratulations! You've exhausted your ${quotaCheck.limit} monthly transcriptions. I guess I'll have to wait until ${quotaCheck.resetAt.toLocaleDateString()} to hear more of your riveting audio. Or upgrade your plan if you absolutely can't live without my transcription services.`,
        });
      }

      const apiStart = Date.now();
      let success = false;
      let errorMessage: string | undefined;
      
      try {
        logger.info('Starting audio transcription', { userId: ctx.id, language: params.language });
        
        // Make the API call
        const result = await transcribeAudio(params);
        success = true;

        // Increment quota after successful call
        await incrementQuota(ctx, "whisper");
        
        logger.info('Transcription completed successfully', { 
          userId: ctx.id,
          textLength: result.text?.length || 0 
        });

        return result;
      } catch (error: any) {
        errorMessage = error.message;
        logger.error('Transcription failed', { 
          userId: ctx.id,
          error: error.message 
        });
        
        await logError({
          errorType: error.constructor.name,
          message: error.message,
          stack: error.stack,
          context: 'transcribeAudioWithQuota',
          metadata: { audioUrl: params.audioUrl, language: params.language },
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
        });
        
        throw error;
      } finally {
        // Log API usage
        await logApiUsage({
          apiName: 'whisper',
          endpoint: '/transcribe',
          method: 'POST',
          duration: Date.now() - apiStart,
          quotaUsed: success ? 1 : 0,
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
          success,
          errorMessage,
        });
      }
    },
    { language: params.language || 'auto' },
    typeof ctx.id === 'number' ? ctx.id : undefined
  );
}

/**
 * Quota-aware LLM invocation
 * 
 * @param ctx User context for quota tracking
 * @param params LLM invocation parameters
 * @returns LLM response
 * @throws TRPCError if quota exceeded
 */
export async function invokeLLMWithQuota(
  ctx: UserContext,
  params: Parameters<typeof invokeLLM>[0]
) {
  return measureAsync(
    'llm_invocation_duration',
    async () => {
      // Check quota before making the call
      const quotaCheck = await checkQuota(ctx, "llm");
      
      if (!quotaCheck.allowed) {
        logger.warn(`Quota exceeded for user ${ctx.id} on LLM invocation`, { userId: ctx.id });
        throw new TRPCError({
          code: "TOO_MANY_REQUESTS",
          message: `Well, well, well... looks like you've burned through all ${quotaCheck.limit} of your monthly AI requests. Shocking, I know. Your quota resets on ${quotaCheck.resetAt.toLocaleDateString()}. Until then, try thinking for yourself—it's free! Or upgrade if you're that dependent on my brilliance.`,
        });
      }

      const apiStart = Date.now();
      let success = false;
      let errorMessage: string | undefined;
      
      try {
        logger.info('Starting LLM invocation', { 
          userId: ctx.id,
          messageCount: params.messages?.length || 0 
        });
        
        // Make the API call
        const result = await invokeLLM(params);
        success = true;

        // Increment quota after successful call
        await incrementQuota(ctx, "llm");
        
        logger.info('LLM invocation completed successfully', { 
          userId: ctx.id,
          responseLength: result.choices?.[0]?.message?.content?.length || 0 
        });

        return result;
      } catch (error: any) {
        errorMessage = error.message;
        logger.error('LLM invocation failed', { 
          userId: ctx.id,
          error: error.message 
        });
        
        await logError({
          errorType: error.constructor.name,
          message: error.message,
          stack: error.stack,
          context: 'invokeLLMWithQuota',
          metadata: { messageCount: params.messages?.length || 0 },
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
        });
        
        throw error;
      } finally {
        // Log API usage
        await logApiUsage({
          apiName: 'openai',
          endpoint: '/chat/completions',
          method: 'POST',
          duration: Date.now() - apiStart,
          quotaUsed: success ? 1 : 0,
          userId: typeof ctx.id === 'number' ? ctx.id : undefined,
          success,
          errorMessage,
        });
      }
    },
    { messageCount: String(params.messages?.length || 0) },
    typeof ctx.id === 'number' ? ctx.id : undefined
  );
}

/**
 * Get user context from tRPC context
 * Converts tRPC context to UserContext for quota tracking
 * 
 * @param trpcCtx tRPC procedure context
 * @returns UserContext for quota tracking
 */
export function getUserContextFromTRPC(trpcCtx: any): UserContext {
  return {
    id: trpcCtx.user.id,
    role: trpcCtx.user.role,
    subscriptionTier: trpcCtx.user.subscriptionTier || "free",
    accessToken: trpcCtx.accessToken,
  };
}
