/**
 * TRPC Error Handler
 * 
 * Converts custom AppError instances to TRPC errors with appropriate codes
 * and user-friendly messages that maintain Bob's sarcastic personality.
 */

import { TRPCError } from "@trpc/server";
import { 
  AppError, 
  APIError, 
  TranscriptionError, 
  SearchError, 
  QuotaExceededError, 
  DatabaseError,
  TranslationError,
  IoTError,
  LearningError,
  ValidationError,
  AuthError,
  logError,
  getUserFriendlyMessage
} from "../errors";
import { getSarcasticErrorMessage } from "./errorMessages";

/**
 * Map HTTP status codes to TRPC error codes
 */
function statusCodeToTRPCCode(statusCode: number): TRPCError['code'] {
  switch (statusCode) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 429:
      return 'TOO_MANY_REQUESTS';
    case 500:
      return 'INTERNAL_SERVER_ERROR';
    case 503:
      return 'SERVICE_UNAVAILABLE';
    default:
      return 'INTERNAL_SERVER_ERROR';
  }
}

/**
 * Convert any error to a TRPC error with sarcastic messaging
 * 
 * @param error - The error to convert
 * @param context - Optional context for logging (e.g., "Assistant Router")
 * @returns TRPCError with appropriate code and message
 */
export function handleError(error: unknown, context?: string): never {
  // Log the error with context
  logError(error, context);

  // Handle AppError instances
  if (error instanceof AppError) {
    const trpcCode = statusCodeToTRPCCode(error.statusCode);
    const sarcasticMessage = getSarcasticErrorMessage(error);
    
    throw new TRPCError({
      code: trpcCode,
      message: sarcasticMessage,
      cause: error,
    });
  }

  // Handle standard Error instances
  if (error instanceof Error) {
    // Use generic error message for standard errors
    const sarcasticMessage = getSarcasticErrorMessage('GENERIC_ERROR');
    
    throw new TRPCError({
      code: 'INTERNAL_SERVER_ERROR',
      message: `${sarcasticMessage} (${error.message})`,
      cause: error,
    });
  }

  // Handle unknown errors
  const fallbackMessage = "Well, this is embarrassing. Something went wrong and I have no idea what. How delightfully mysterious.";
  
  throw new TRPCError({
    code: 'INTERNAL_SERVER_ERROR',
    message: fallbackMessage,
  });
}

/**
 * Async error handler wrapper for TRPC procedures
 * 
 * Usage:
 * ```ts
 * myProcedure: protectedProcedure
 *   .input(z.object({ ... }))
 *   .mutation(withErrorHandling(async ({ ctx, input }) => {
 *     // Your procedure logic here
 *     return result;
 *   }, 'My Procedure'))
 * ```
 */
export function withErrorHandling<T>(
  fn: (...args: any[]) => Promise<T>,
  context?: string
): (...args: any[]) => Promise<T> {
  return async (...args: any[]): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      handleError(error, context);
    }
  };
}
