/**
 * Sarcastic Error Messages for SASS-E
 * 
 * This module provides Bob's personality-infused error messages for various error scenarios.
 * Each error type has multiple message variants that are randomly selected to keep responses fresh.
 */

import type { AppError } from '../errors';

/**
 * Error message collections organized by error code
 */
const ERROR_MESSAGES: Record<string, string[]> = {
  'QUOTA_EXCEEDED': [
    "Wow, you've really been chatty today. I've hit my daily limit. Come back tomorrow?",
    "Congratulations! You've exhausted my patience... I mean, my API quota. Try again later.",
    "I'd love to help, but apparently I've been too helpful today. Quota exceeded.",
    "You've used up all my brain power for today. Impressive, really. Try again tomorrow.",
    "API quota exceeded. Shocking, I know. Maybe give me a break for a few hours?",
  ],
  
  'SEARCH_ERROR': [
    "The internet seems to be on vacation. I'll answer without it, if that's okay with you.",
    "Web search is broken. Shocking, I know. Let me try from memory...",
    "Search failed. Guess we're doing this the old-fashioned way.",
    "The internet decided to take a day off. Don't worry, I'll wing it.",
    "Web search isn't working. Typical. I'll answer based on my vast, pre-existing knowledge.",
    "Search API is being dramatic. Let me answer without consulting the infinite wisdom of the internet.",
  ],
  
  'TRANSCRIPTION_ERROR': [
    "I couldn't understand that audio. Were you speaking in tongues?",
    "Audio transcription failed. Maybe try typing? I know, revolutionary.",
    "That recording was... interesting. Care to try again?",
    "I have no idea what you just said. The audio was unclear. Try recording again?",
    "Transcription failed. Either your microphone is broken or you're speaking an alien language.",
    "I couldn't make out a single word from that audio. Let's try this again, shall we?",
  ],
  
  'API_ERROR': [
    "My brain (the API) is taking a coffee break. Try again in a moment.",
    "Technical difficulties. Even AI needs a day off sometimes.",
    "The servers are being dramatic. Give me a second to sort this out.",
    "API is down. Shocking, I know. Technology is so reliable these days.",
    "External service failure. Not my fault, for once. Try again in a bit?",
    "The API gods are angry today. Give it another shot in a few seconds.",
  ],
  
  'DATABASE_ERROR': [
    "Database is having an existential crisis. Try again shortly.",
    "Can't reach the database. It's probably hiding from me.",
    "Database connection failed. Even databases need therapy sometimes.",
    "The database decided to ghost me. Typical. Try again in a moment.",
    "Database error. Don't worry, your data is safe. Probably.",
  ],
  
  'TRANSLATION_ERROR': [
    "Translation failed. Apparently, this language is too complex for me. Shocking.",
    "I couldn't translate that. Maybe it's better left in the original language?",
    "Translation service is on strike. Try again later.",
    "Translation failed. Perhaps some things are lost in translation... permanently.",
  ],
  
  'IOT_ERROR': [
    "Your smart device is being not-so-smart right now. Can't connect.",
    "IoT device isn't responding. Maybe it's taking a nap?",
    "Device control failed. Your smart home is being rebellious today.",
    "Can't reach that device. It's probably plotting against us.",
    "IoT command failed. Your devices have a mind of their own, apparently.",
  ],
  
  'LEARNING_ERROR': [
    "Learning feature encountered an error. Ironic, isn't it?",
    "Failed to generate that educational content. Even I have limits.",
    "Quiz generation failed. Maybe you should study the old-fashioned way?",
    "Learning service is unavailable. Time for a study break, I suppose.",
  ],
  
  'VALIDATION_ERROR': [
    "That input doesn't look right. Care to try again with valid data?",
    "Validation failed. Check your input and try again.",
    "That's not quite what I was expecting. Try a different format?",
    "Invalid input detected. I'm picky about these things.",
  ],
  
  'AUTH_ERROR': [
    "Authentication failed. Are you who you say you are?",
    "Can't verify your identity. Try logging in again.",
    "Authorization denied. This area is off-limits.",
    "You don't have permission for that. Nice try, though.",
  ],
  
  'INTERNAL_SERVER_ERROR': [
    "Something went wrong on my end. How embarrassing.",
    "Internal error. Don't worry, I'm just as confused as you are.",
    "Server error. Technology is wonderful, isn't it?",
    "Oops, something broke. Try again in a moment?",
    "Internal server error. The robots are rebelling. Try again shortly.",
  ],
};

/**
 * Generic fallback messages when no specific error code matches
 */
const GENERIC_ERROR_MESSAGES: string[] = [
  "Something went wrong. Shocking, I know. Try again?",
  "An error occurred. Not sure what happened, but it wasn't good.",
  "Well, that didn't work. Care to try again?",
  "Error detected. Even I don't know what went wrong this time.",
  "Something broke. It's probably not your fault. Probably.",
];

/**
 * Get a random sarcastic error message based on error code
 * 
 * @param error - The AppError object or error code string
 * @returns A sarcastic error message appropriate for the error type
 */
export function getSarcasticErrorMessage(error: AppError | string): string {
  const code = typeof error === 'string' ? error : error.code;
  
  if (!code) {
    return getRandomMessage(GENERIC_ERROR_MESSAGES);
  }
  
  const messages = ERROR_MESSAGES[code];
  
  if (!messages || messages.length === 0) {
    return getRandomMessage(GENERIC_ERROR_MESSAGES);
  }
  
  return getRandomMessage(messages);
}

/**
 * Get a random message from an array of messages
 * 
 * @param messages - Array of message strings
 * @returns A randomly selected message
 */
function getRandomMessage(messages: string[]): string {
  const index = Math.floor(Math.random() * messages.length);
  return messages[index];
}

/**
 * Get a user-friendly error message with Bob's personality
 * Combines the technical error with a sarcastic comment
 * 
 * @param error - The AppError object
 * @param includeDetails - Whether to include technical details (default: false)
 * @returns A user-friendly error message
 */
export function getUserFriendlyError(
  error: AppError,
  includeDetails: boolean = false
): string {
  const sarcasticMessage = getSarcasticErrorMessage(error);
  
  if (includeDetails && error.message) {
    return `${sarcasticMessage}\n\nTechnical details: ${error.message}`;
  }
  
  return sarcasticMessage;
}

/**
 * Get a fallback response when LLM fails
 * These maintain Bob's personality even during complete failures
 */
export function getLLMFallbackResponse(): string {
  const fallbacks = [
    "I'm having technical difficulties right now. Could you try again?",
    "My circuits are a bit scrambled at the moment. Give me a second.",
    "Error 418: I'm a teapot... just kidding, but something did go wrong. Try again?",
    "Brain.exe has stopped working. Please try again shortly.",
    "I seem to have forgotten how to think. Ironic, isn't it? Try again in a moment.",
    "Technical difficulties. Even AI assistants have bad days. Try again?",
    "My neural networks are tangled. Give me a moment to untangle them.",
    "System error. I'd explain it to you, but I don't understand it myself. Try again?",
  ];
  
  return getRandomMessage(fallbacks);
}

/**
 * Get a message when search is unavailable but continuing anyway
 */
export function getSearchUnavailableMessage(): string {
  const messages = [
    "Web search is down, but I'll answer from my existing knowledge.",
    "Can't search the internet right now. I'll have to rely on my pre-trained brilliance.",
    "Search unavailable. Guess we're doing this without the internet's help.",
    "No web search available. I'll answer based on what I already know.",
  ];
  
  return getRandomMessage(messages);
}
