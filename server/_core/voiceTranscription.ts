/**
 * Voice transcription helper using internal Speech-to-Text service
 *
 * Features:
 * - Automatic retry with exponential backoff
 * - Timeout protection (30 seconds)
 * - Comprehensive error handling
 * - File size validation (16MB limit)
 * - Format validation
 * - Graceful error recovery
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage (e.g., S3) to get URL
 * 3. Call transcription with the URL
 * 
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   },
 *   onError: (error) => {
 *     toast.error(error.message); // User-friendly error message
 *   }
 * });
 * 
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
import { ENV } from "./env";
import { TranscriptionError, logError } from "../errors";

/**
 * Configuration constants
 */
const MAX_RETRIES = 3;
const RETRY_BASE_DELAY_MS = 1000; // 1 second base delay
const TRANSCRIPTION_TIMEOUT_MS = 30000; // 30 seconds
const MAX_FILE_SIZE_MB = 16;
const SUPPORTED_FORMATS = ['webm', 'mp3', 'mpeg', 'wav', 'wave', 'ogg', 'm4a', 'mp4'];

export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file (e.g., S3 URL)
  language?: string; // Optional: specify language code (e.g., "en", "es", "zh")
  prompt?: string; // Optional: custom prompt for the transcription
};

// Native Whisper API segment format
export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

// Native Whisper API response format
export type WhisperResponse = {
  task: "transcribe";
  language: string;
  duration: number;
  text: string;
  segments: WhisperSegment[];
};

export type TranscriptionResponse = WhisperResponse;

/**
 * Transcribe audio to text using the internal Speech-to-Text service
 * Includes automatic retry with exponential backoff for transient failures
 * 
 * @param options - Audio data and metadata
 * @param retryCount - Current retry attempt (used internally)
 * @returns Transcription result
 * @throws {TranscriptionError} When transcription fails after all retries
 */
export async function transcribeAudio(
  options: TranscribeOptions,
  retryCount: number = 0
): Promise<TranscriptionResponse> {
  try {
    // Step 1: Validate input
    if (!options.audioUrl || typeof options.audioUrl !== 'string') {
      throw new TranscriptionError('Audio URL is required');
    }
    
    if (!options.audioUrl.startsWith('http://') && !options.audioUrl.startsWith('https://')) {
      throw new TranscriptionError('Invalid audio URL format');
    }
    
    // Step 2: Validate environment configuration
    if (!ENV.forgeApiUrl) {
      throw new TranscriptionError('Voice transcription service is not configured');
    }
    
    if (!ENV.forgeApiKey) {
      throw new TranscriptionError('Voice transcription service authentication is missing');
    }

    // Step 3: Download audio from URL with timeout
    let audioBuffer: Buffer;
    let mimeType: string;
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second download timeout
      
      try {
        const response = await fetch(options.audioUrl, {
          signal: controller.signal,
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new TranscriptionError(
            `Failed to download audio file: HTTP ${response.status} ${response.statusText}`
          );
        }
        
        audioBuffer = Buffer.from(await response.arrayBuffer());
        mimeType = response.headers.get('content-type') || 'audio/mpeg';
        
      } finally {
        clearTimeout(timeoutId);
      }
      
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        throw new TranscriptionError('Audio download timed out');
      }
      
      if (error instanceof TranscriptionError) {
        throw error;
      }
      
      throw new TranscriptionError(
        `Failed to fetch audio file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
    
    // Step 4: Validate file size
    const sizeMB = audioBuffer.length / (1024 * 1024);
    if (sizeMB > MAX_FILE_SIZE_MB) {
      throw new TranscriptionError(
        `Audio file exceeds maximum size limit (${sizeMB.toFixed(2)}MB / ${MAX_FILE_SIZE_MB}MB)`
      );
    }
    
    // Step 5: Validate file format
    const fileExtension = getFileExtension(mimeType);
    if (!SUPPORTED_FORMATS.includes(fileExtension)) {
      throw new TranscriptionError(
        `Unsupported audio format: ${mimeType}. Supported formats: ${SUPPORTED_FORMATS.join(', ')}`
      );
    }

    // Step 6: Create FormData for multipart upload to Whisper API
    const formData = new FormData();
    
    const filename = `audio.${fileExtension}`;
    const audioBlob = new Blob([new Uint8Array(audioBuffer)], { type: mimeType });
    formData.append("file", audioBlob, filename);
    
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    
    // Add prompt - use custom prompt if provided, otherwise generate based on language
    const prompt = options.prompt || (
      options.language 
        ? `Transcribe the user's voice to text, the user's working language is ${getLanguageName(options.language)}`
        : "Transcribe the user's voice to text"
    );
    formData.append("prompt", prompt);

    // Step 7: Call the transcription service with timeout
    const baseUrl = ENV.forgeApiUrl.endsWith("/")
      ? ENV.forgeApiUrl
      : `${ENV.forgeApiUrl}/`;
    
    const fullUrl = new URL(
      "v1/audio/transcriptions",
      baseUrl
    ).toString();

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TRANSCRIPTION_TIMEOUT_MS);

    try {
      const response = await fetch(fullUrl, {
        method: "POST",
        headers: {
          authorization: `Bearer ${ENV.forgeApiKey}`,
          "Accept-Encoding": "identity",
        },
        body: formData,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);

      // Handle rate limiting with retry
      if (response.status === 429) {
        if (retryCount < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount);
          const jitter = Math.random() * 500; // Add 0-500ms jitter
          
          console.warn(
            `Transcription rate limited, retrying in ${delay + jitter}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );
          
          await sleep(delay + jitter);
          return transcribeAudio(options, retryCount + 1);
        }
        
        throw new TranscriptionError('Transcription service rate limit exceeded. Please try again later.');
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "");
        
        // Retry on 5xx errors (server errors)
        if (response.status >= 500 && response.status < 600 && retryCount < MAX_RETRIES) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, retryCount);
          const jitter = Math.random() * 500;
          
          console.warn(
            `Transcription service error ${response.status}, retrying in ${delay + jitter}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
          );
          
          await sleep(delay + jitter);
          return transcribeAudio(options, retryCount + 1);
        }
        
        throw new TranscriptionError(
          `Transcription service request failed: ${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
        );
      }

      // Step 8: Parse and validate the transcription result
      const whisperResponse = await response.json() as WhisperResponse;
      
      if (!whisperResponse.text || typeof whisperResponse.text !== 'string') {
        throw new TranscriptionError('Invalid transcription response: missing or invalid text field');
      }
      
      if (whisperResponse.text.trim().length === 0) {
        throw new TranscriptionError('Transcription returned empty text. Please ensure the audio contains speech.');
      }

      return whisperResponse;
      
    } finally {
      clearTimeout(timeoutId);
    }

  } catch (error) {
    // Handle timeout errors
    if (error instanceof Error && error.name === 'AbortError') {
      logError(error, 'transcribeAudio');
      throw new TranscriptionError('Transcription request timed out');
    }
    
    // Re-throw TranscriptionError
    if (error instanceof TranscriptionError) {
      logError(error, 'transcribeAudio');
      throw error;
    }

    // Handle unexpected errors
    logError(error, 'transcribeAudio');
    throw new TranscriptionError(
      `Voice transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

/**
 * Helper function to get file extension from MIME type
 */
function getFileExtension(mimeType: string): string {
  const mimeToExt: Record<string, string> = {
    'audio/webm': 'webm',
    'audio/mp3': 'mp3',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/wave': 'wav',
    'audio/ogg': 'ogg',
    'audio/m4a': 'm4a',
    'audio/mp4': 'm4a',
  };
  
  return mimeToExt[mimeType] || 'audio';
}

/**
 * Helper function to get full language name from ISO code
 */
function getLanguageName(langCode: string): string {
  const langMap: Record<string, string> = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'it': 'Italian',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ja': 'Japanese',
    'ko': 'Korean',
    'zh': 'Chinese',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'nl': 'Dutch',
    'pl': 'Polish',
    'tr': 'Turkish',
    'sv': 'Swedish',
    'da': 'Danish',
    'no': 'Norwegian',
    'fi': 'Finnish',
  };
  
  return langMap[langCode] || langCode;
}

/**
 * Sleep helper for retry delays
 * @param ms - Milliseconds to sleep
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Example tRPC procedure implementation:
 * 
 * ```ts
 * // In server/routers.ts
 * import { transcribeAudio } from "./_core/voiceTranscription";
 * import { TranscriptionError } from "./errors";
 * 
 * export const voiceRouter = router({
 *   transcribe: protectedProcedure
 *     .input(z.object({
 *       audioUrl: z.string(),
 *       language: z.string().optional(),
 *       prompt: z.string().optional(),
 *     }))
 *     .mutation(async ({ input, ctx }) => {
 *       try {
 *         const result = await transcribeAudio(input);
 *         
 *         // Optionally save transcription to database
 *         await db.insert(transcriptions).values({
 *           userId: ctx.user.id,
 *           text: result.text,
 *           duration: result.duration,
 *           language: result.language,
 *           audioUrl: input.audioUrl,
 *           createdAt: new Date(),
 *         });
 *         
 *         return result;
 *       } catch (error) {
 *         if (error instanceof TranscriptionError) {
 *           throw new TRPCError({
 *             code: 'BAD_REQUEST',
 *             message: error.message,
 *           });
 *         }
 *         throw new TRPCError({
 *           code: 'INTERNAL_SERVER_ERROR',
 *           message: 'Transcription service unavailable',
 *         });
 *       }
 *     }),
 * });
 * ```
 */
