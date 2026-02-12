import { TRPCError } from "@trpc/server";
import { checkQuota, incrementQuota, type UserContext, type Service } from "./quotaTracker";
import { invokeLLM } from "../_core/llm";
import { transcribeAudio } from "../_core/voiceTranscription";
import { searchWeb } from "../_core/webSearch";

/**
 * Quota-Aware API Wrappers
 * 
 * These wrappers automatically check quota before making API calls
 * and increment usage after successful calls.
 * 
 * Throws TRPC errors with Bob's sarcastic messages when quota is exceeded.
 */

/**
 * Quota-aware web search using Tavily
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
  // Check quota before making the call
  const quotaCheck = await checkQuota(ctx, "tavily");
  
  if (!quotaCheck.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Oh wow, you've hit your monthly search limit (${quotaCheck.limit} searches). Maybe try using your brain instead of relying on me for everything? Your quota resets on ${quotaCheck.resetAt.toLocaleDateString()}. Or, you know, upgrade your subscription if you can't live without my search prowess.`,
    });
  }

  // Make the API call
  const result = await searchWeb(query, maxResults);

  // Increment quota after successful call
  await incrementQuota(ctx, "tavily");

  return result;
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
  // Check quota before making the call
  const quotaCheck = await checkQuota(ctx, "whisper");
  
  if (!quotaCheck.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Congratulations! You've exhausted your ${quotaCheck.limit} monthly transcriptions. I guess I'll have to wait until ${quotaCheck.resetAt.toLocaleDateString()} to hear more of your riveting audio. Or upgrade your plan if you absolutely can't live without my transcription services.`,
    });
  }

  // Make the API call
  const result = await transcribeAudio(params);

  // Increment quota after successful call
  await incrementQuota(ctx, "whisper");

  return result;
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
  // Check quota before making the call
  const quotaCheck = await checkQuota(ctx, "llm");
  
  if (!quotaCheck.allowed) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: `Well, well, well... looks like you've burned through all ${quotaCheck.limit} of your monthly AI requests. Shocking, I know. Your quota resets on ${quotaCheck.resetAt.toLocaleDateString()}. Until then, try thinking for yourself—it's free! Or upgrade if you're that dependent on my brilliance.`,
    });
  }

  // Make the API call
  const result = await invokeLLM(params);

  // Increment quota after successful call
  await incrementQuota(ctx, "llm");

  return result;
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
