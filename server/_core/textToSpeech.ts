/**
 * Server-side Text-to-Speech service
 * Uses OpenAI-compatible TTS API for high-quality voice synthesis
 */

import { ENV } from "./env";

export type TTSVoice = 
  | "alloy"    // Neutral, balanced
  | "echo"     // Male, warm
  | "fable"    // British, expressive
  | "onyx"     // Male, deep
  | "nova"     // Female, warm and friendly
  | "shimmer"; // Female, clear and bright

export type TTSModel = "tts-1" | "tts-1-hd";

export interface TTSOptions {
  text: string;
  voice?: TTSVoice;
  model?: TTSModel;
  speed?: number; // 0.25 to 4.0, default 1.0
}

export interface TTSResult {
  audioBuffer: Buffer;
  contentType: string;
}

// Language to preferred voice mapping (female voices preferred)
const LANGUAGE_VOICE_MAP: Record<string, TTSVoice> = {
  en: "nova",     // Female, warm - best for English
  es: "nova",     // Works well for Spanish
  fr: "shimmer",  // Clear and bright for French
  de: "nova",     // Warm for German
  it: "shimmer",  // Expressive for Italian
  pt: "nova",     // Warm for Portuguese
  ja: "nova",     // Works for Japanese
  zh: "nova",     // Works for Chinese
  ko: "nova",     // Works for Korean
  ru: "nova",     // Works for Russian
  ar: "nova",     // Works for Arabic
};

/**
 * Get the best voice for a language
 */
export function getVoiceForLanguage(languageCode: string): TTSVoice {
  return LANGUAGE_VOICE_MAP[languageCode] || "nova";
}

/**
 * Generate speech audio from text using server-side TTS
 */
export async function generateSpeech(options: TTSOptions): Promise<TTSResult> {
  const { text, voice = "nova", model = "tts-1-hd", speed = 0.9 } = options;

  if (!ENV.forgeApiKey) {
    throw new Error("TTS API key not configured");
  }

  // Use the Forge API URL for TTS
  const baseUrl = ENV.forgeApiUrl?.replace(/\/$/, "") || "https://forge.manus.im";
  const ttsUrl = `${baseUrl}/v1/audio/speech`;

  console.log(`[TTS] Generating speech for: "${text.substring(0, 50)}..." with voice: ${voice}`);

  const response = await fetch(ttsUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${ENV.forgeApiKey}`,
    },
    body: JSON.stringify({
      model,
      input: text,
      voice,
      speed,
      response_format: "mp3",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("[TTS] API error:", {
      status: response.status,
      statusText: response.statusText,
      error: errorText,
    });
    throw new Error(`TTS API failed: ${response.status} ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  const audioBuffer = Buffer.from(arrayBuffer);

  console.log(`[TTS] Generated ${audioBuffer.length} bytes of audio`);

  return {
    audioBuffer,
    contentType: "audio/mpeg",
  };
}

/**
 * Generate pronunciation audio for a word in a specific language
 */
export async function generatePronunciation(
  word: string,
  languageCode: string,
  speed: number = 0.85
): Promise<TTSResult> {
  const voice = getVoiceForLanguage(languageCode);
  
  return generateSpeech({
    text: word,
    voice,
    model: "tts-1-hd", // Use HD model for better pronunciation quality
    speed,
  });
}
