/**
 * Text-to-Speech utility for language learning pronunciation
 * Uses browser's built-in speech synthesis API with language-specific voices
 */

// Language code to speech synthesis locale mapping
const LANGUAGE_LOCALE_MAP: Record<string, string[]> = {
  es: ['es-ES', 'es-MX', 'es-US'], // Spanish
  fr: ['fr-FR', 'fr-CA'], // French
  de: ['de-DE'], // German
  it: ['it-IT'], // Italian
  pt: ['pt-PT', 'pt-BR'], // Portuguese
  ja: ['ja-JP'], // Japanese
  zh: ['zh-CN', 'zh-TW'], // Chinese
  ko: ['ko-KR'], // Korean
  ru: ['ru-RU'], // Russian
  ar: ['ar-SA', 'ar-EG'], // Arabic
  en: ['en-US', 'en-GB'], // English
};

// Language code to display name
export const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Spanish',
  fr: 'French',
  de: 'German',
  it: 'Italian',
  pt: 'Portuguese',
  ja: 'Japanese',
  zh: 'Chinese',
  ko: 'Korean',
  ru: 'Russian',
  ar: 'Arabic',
  en: 'English',
};

/**
 * Get available voices for a specific language
 */
export function getVoicesForLanguage(languageCode: string): SpeechSynthesisVoice[] {
  const voices = window.speechSynthesis.getVoices();
  const locales = LANGUAGE_LOCALE_MAP[languageCode] || [];
  
  // Find voices that match any of the language's locales
  const matchingVoices = voices.filter(voice => 
    locales.some(locale => voice.lang.startsWith(locale) || locale.startsWith(voice.lang))
  );
  
  return matchingVoices;
}

/**
 * Get the best voice for a language (prefers native voices)
 */
export function getBestVoiceForLanguage(languageCode: string): SpeechSynthesisVoice | null {
  const voices = getVoicesForLanguage(languageCode);
  
  if (voices.length === 0) {
    return null;
  }
  
  // Prefer local/native voices over network voices
  const localVoice = voices.find(voice => voice.localService);
  if (localVoice) {
    return localVoice;
  }
  
  // Return the first available voice
  return voices[0];
}

/**
 * Speak text in a specific language
 */
export function speakInLanguage(
  text: string,
  languageCode: string,
  options?: {
    rate?: number;
    pitch?: number;
    volume?: number;
    onEnd?: () => void;
    onError?: (error: Error) => void;
  }
): void {
  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  const voice = getBestVoiceForLanguage(languageCode);
  
  if (!voice) {
    console.warn(`No voice available for language: ${languageCode}`);
    options?.onError?.(new Error(`No voice available for ${LANGUAGE_NAMES[languageCode] || languageCode}`));
    return;
  }
  
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.voice = voice;
  utterance.lang = voice.lang;
  utterance.rate = options?.rate ?? 0.9; // Slightly slower for learning
  utterance.pitch = options?.pitch ?? 1.0;
  utterance.volume = options?.volume ?? 1.0;
  
  utterance.onend = () => {
    options?.onEnd?.();
  };
  
  utterance.onerror = (event) => {
    console.error('Speech synthesis error:', event);
    options?.onError?.(new Error('Speech synthesis failed'));
  };
  
  window.speechSynthesis.speak(utterance);
}

/**
 * Check if TTS is available for a language
 */
export function isTTSAvailableForLanguage(languageCode: string): boolean {
  const voices = getVoicesForLanguage(languageCode);
  return voices.length > 0;
}

/**
 * Initialize speech synthesis (load voices)
 * Call this on component mount to ensure voices are loaded
 */
export function initializeSpeechSynthesis(callback?: () => void): void {
  // Voices are loaded asynchronously in some browsers
  const checkVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      console.log(`[TTS] Loaded ${voices.length} voices`);
      callback?.();
      return true;
    }
    return false;
  };

  // Try immediately
  if (checkVoices()) {
    return;
  }

  // Listen for voices changed event
  window.speechSynthesis.onvoiceschanged = () => {
    checkVoices();
  };

  // Also retry after a delay (some browsers need this)
  setTimeout(() => {
    if (!checkVoices()) {
      console.warn('[TTS] No voices loaded after 1 second');
    }
  }, 1000);
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  window.speechSynthesis.cancel();
}
