/**
 * Custom Error Classes for SASS-E Application
 * 
 * This module defines a hierarchy of error classes for structured error handling
 * across the application. Each error type includes HTTP status codes and error codes
 * for consistent API responses.
 */

/**
 * Base application error class
 * All custom errors should extend this class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * API-related errors (external service failures)
 * Used when third-party APIs fail or return unexpected responses
 */
export class APIError extends AppError {
  constructor(message: string, public provider: string) {
    super(message, 503, 'API_ERROR');
  }
}

/**
 * Voice transcription errors
 * Used when Whisper API fails or audio processing encounters issues
 */
export class TranscriptionError extends AppError {
  constructor(message: string) {
    super(message, 500, 'TRANSCRIPTION_ERROR');
  }
}

/**
 * Web search errors
 * Used when Tavily API fails or search operations encounter issues
 */
export class SearchError extends AppError {
  constructor(message: string) {
    super(message, 500, 'SEARCH_ERROR');
  }
}

/**
 * Quota exceeded errors
 * Used when API rate limits or monthly quotas are exceeded
 */
export class QuotaExceededError extends AppError {
  constructor(public service: string) {
    super(`Quota exceeded for ${service}`, 429, 'QUOTA_EXCEEDED');
  }
}

/**
 * Database operation errors
 * Used when database queries or connections fail
 */
export class DatabaseError extends AppError {
  constructor(message: string, public operation: string) {
    super(message, 500, 'DATABASE_ERROR');
  }
}

/**
 * Translation errors
 * Used when translation operations fail
 */
export class TranslationError extends AppError {
  constructor(message: string) {
    super(message, 500, 'TRANSLATION_ERROR');
  }
}

/**
 * IoT device control errors
 * Used when IoT device operations fail
 */
export class IoTError extends AppError {
  constructor(message: string, public deviceId?: string) {
    super(message, 500, 'IOT_ERROR');
  }
}

/**
 * Learning/Education feature errors
 * Used when learning operations (quiz, study guide, etc.) fail
 */
export class LearningError extends AppError {
  constructor(message: string) {
    super(message, 500, 'LEARNING_ERROR');
  }
}

/**
 * Validation errors
 * Used when input validation fails
 */
export class ValidationError extends AppError {
  constructor(message: string, public field?: string) {
    super(message, 400, 'VALIDATION_ERROR');
  }
}

/**
 * Authentication/Authorization errors
 * Used when user authentication or authorization fails
 */
export class AuthError extends AppError {
  constructor(message: string) {
    super(message, 401, 'AUTH_ERROR');
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError;
}

/**
 * Get a user-friendly error message from an error object
 * Falls back to generic message if error is not an AppError
 */
export function getUserFriendlyMessage(error: unknown): string {
  if (isAppError(error)) {
    return error.message;
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Log error with context information
 * Includes timestamp, error type, and stack trace
 */
export function logError(error: unknown, context?: string): void {
  const timestamp = new Date().toISOString();
  const prefix = context ? `[${context}]` : '';
  
  if (isAppError(error)) {
    console.error(
      `${timestamp} ${prefix} ${error.name} [${error.code}]:`,
      error.message,
      error.stack
    );
  } else if (error instanceof Error) {
    console.error(
      `${timestamp} ${prefix} ${error.name}:`,
      error.message,
      error.stack
    );
  } else {
    console.error(`${timestamp} ${prefix} Unknown error:`, error);
  }
}
