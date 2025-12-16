/**
 * Text-to-Speech utility for language learning pronunciation
 * Uses browser's built-in speech synthesis API with language-specific voices
 * 
 * Mobile Browser Compatibility Notes:
 * - Chrome/Android: Voices load asynchronously, may need multiple retries
 * - Safari/iOS: Voices available immediately but may be limited
 * - Firefox/Android: May return empty array initially, needs onvoiceschanged
 */

// Language code to speech synthesis locale mapping (expanded for better mobile coverage)
const LANGUAGE_LOCALE_MAP: Record<string, string[]> = {
  es: ['es-ES', 'es-MX', 'es-US', 'es', 'es-AR', 'es-CO'], // Spanish
  fr: ['fr-FR', 'fr-CA', 'fr', 'fr-BE'], // French
  de: ['de-DE', 'de', 'de-AT', 'de-CH'], // German
  it: ['it-IT', 'it'], // Italian
  pt: ['pt-PT', 'pt-BR', 'pt'], // Portuguese
  ja: ['ja-JP', 'ja'], // Japanese
  zh: ['zh-CN', 'zh-TW', 'zh', 'zh-HK', 'cmn-Hans-CN'], // Chinese
  ko: ['ko-KR', 'ko'], // Korean
  ru: ['ru-RU', 'ru'], // Russian
  ar: ['ar-SA', 'ar-EG', 'ar', 'ar-AE'], // Arabic
  en: ['en-US', 'en-GB', 'en', 'en-AU', 'en-IN'], // English
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

// Cache for loaded voices
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;
let voiceLoadCallbacks: (() => void)[] = [];

/**
 * Check if speech synthesis is supported
 */
export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 
         'speechSynthesis' in window && 
         typeof window.speechSynthesis.speak === 'function';
}

/**
 * Get all available voices (with caching)
 */
function getAllVoices(): SpeechSynthesisVoice[] {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }
  
  const voices = window.speechSynthesis.getVoices();
  if (voices.length > 0) {
    cachedVoices = voices;
    voicesLoaded = true;
  }
  
  return cachedVoices.length > 0 ? cachedVoices : voices;
}

/**
 * Get available voices for a specific language
 */
export function getVoicesForLanguage(languageCode: string): SpeechSynthesisVoice[] {
  const voices = getAllVoices();
  const locales = LANGUAGE_LOCALE_MAP[languageCode] || [languageCode];
  
  // Find voices that match any of the language's locales
  const matchingVoices = voices.filter(voice => {
    const voiceLang = voice.lang.toLowerCase();
    return locales.some(locale => {
      const localeLower = locale.toLowerCase();
      return voiceLang === localeLower || 
             voiceLang.startsWith(localeLower + '-') || 
             localeLower.startsWith(voiceLang);
    });
  });
  
  return matchingVoices;
}

/**
 * Score a voice based on quality indicators
 * Higher score = better quality voice
 */
function scoreVoice(voice: SpeechSynthesisVoice): number {
  let score = 0;
  const nameLower = voice.name.toLowerCase();
  
  // High-quality voice indicators (add significant points)
  if (nameLower.includes('natural')) score += 100;
  if (nameLower.includes('neural')) score += 100;
  if (nameLower.includes('wavenet')) score += 90;
  if (nameLower.includes('enhanced')) score += 80;
  if (nameLower.includes('premium')) score += 80;
  if (nameLower.includes('hd')) score += 70;
  if (nameLower.includes('studio')) score += 70;
  
  // Female voice preference (generally clearer and more pleasant)
  // Common female voice name patterns across different platforms
  const femalePatterns = [
    'female', 'woman', 'girl',
    'samantha', 'victoria', 'karen', 'moira', 'tessa', 'fiona', 'veena',
    'paulina', 'monica', 'lucia', 'joana', 'ioana', 'amelie', 'aurelie',
    'anna', 'petra', 'yuna', 'kyoko', 'o-ren', 'mei-jia', 'sin-ji',
    'lekha', 'kanya', 'damayanti', 'ellen', 'nora', 'zosia', 'iveta',
    'laura', 'alva', 'klara', 'yelda', 'milena', 'mariska', 'melina',
    'carmit', 'lihi', 'sara', 'daria', 'katya', 'maged', 'laila',
    'google us english', 'google uk english female',
    'microsoft zira', 'microsoft hazel', 'microsoft susan',
    'microsoft huihui', 'microsoft yaoyao', 'microsoft hanhan',
    'microsoft haruka', 'microsoft ayumi', 'microsoft sayaka',
    'microsoft heami', 'microsoft heera', 'microsoft irina',
    'microsoft paulina', 'microsoft sabina', 'microsoft hortense',
    'microsoft hedda', 'microsoft katja', 'microsoft helena',
    'microsoft elsa', 'microsoft helia', 'microsoft maria',
    'siri female', 'cortana'
  ];
  
  // Male voice patterns (to deprioritize)
  const malePatterns = [
    'male', 'man', 'guy',
    'alex', 'daniel', 'thomas', 'oliver', 'fred', 'ralph', 'albert',
    'bruce', 'junior', 'aaron', 'gordon', 'lee', 'rishi', 'sangeeta',
    'jorge', 'diego', 'juan', 'carlos', 'luca', 'paolo', 'yuri',
    'xander', 'mads', 'magnus', 'oskar', 'filip', 'andrei', 'maxim',
    'microsoft david', 'microsoft mark', 'microsoft james',
    'microsoft george', 'microsoft richard', 'microsoft sean',
    'microsoft claude', 'microsoft guillaume', 'microsoft paul',
    'microsoft stefan', 'microsoft michael', 'microsoft ravi',
    'microsoft hemant', 'microsoft naayf', 'microsoft hamed',
    'google us english male', 'google uk english male'
  ];
  
  // Check for female voice
  if (femalePatterns.some(pattern => nameLower.includes(pattern))) {
    score += 50;
  }
  
  // Penalize male voices
  if (malePatterns.some(pattern => nameLower.includes(pattern))) {
    score -= 30;
  }
  
  // Network/cloud voices are often higher quality than local
  if (!voice.localService) {
    score += 20;
  }
  
  // Penalize robotic-sounding voice indicators
  if (nameLower.includes('compact')) score -= 40;
  if (nameLower.includes('espeak')) score -= 50;
  if (nameLower.includes('festival')) score -= 40;
  if (nameLower.includes('mbrola')) score -= 40;
  if (nameLower.includes('pico')) score -= 30;
  
  // Slight preference for default voices (usually better quality)
  if (voice.default) score += 10;
  
  return score;
}

/**
 * Get the best voice for a language
 * Prioritizes: natural/neural voices > female voices > network voices
 */
export function getBestVoiceForLanguage(languageCode: string): SpeechSynthesisVoice | null {
  const voices = getVoicesForLanguage(languageCode);
  
  if (voices.length === 0) {
    // Fallback: try to find any voice that starts with the language code
    const allVoices = getAllVoices();
    const fallbackVoices = allVoices.filter(v => 
      v.lang.toLowerCase().startsWith(languageCode.toLowerCase())
    );
    
    if (fallbackVoices.length > 0) {
      // Score and sort fallback voices too
      fallbackVoices.sort((a, b) => scoreVoice(b) - scoreVoice(a));
      return fallbackVoices[0];
    }
    return null;
  }
  
  // Score all voices and sort by quality
  const scoredVoices = voices.map(voice => ({
    voice,
    score: scoreVoice(voice)
  }));
  
  // Sort by score (highest first)
  scoredVoices.sort((a, b) => b.score - a.score);
  
  // Log the selected voice for debugging
  const selected = scoredVoices[0];
  console.log(`[TTS] Selected voice for ${languageCode}: "${selected.voice.name}" (score: ${selected.score})`);
  
  return selected.voice;
}

/**
 * Speak text in a specific language with mobile-optimized handling
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
  if (!isSpeechSynthesisSupported()) {
    console.warn('[TTS] Speech synthesis not supported');
    options?.onError?.(new Error('Speech synthesis is not supported in this browser'));
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();
  
  // Mobile fix: Some browsers need a small delay after cancel
  setTimeout(() => {
    const voice = getBestVoiceForLanguage(languageCode);
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      // Fallback: set language directly even without a specific voice
      // Mobile browsers may still be able to synthesize speech
      const locales = LANGUAGE_LOCALE_MAP[languageCode];
      utterance.lang = locales?.[0] || languageCode;
      console.warn(`[TTS] No specific voice found for ${languageCode}, using lang: ${utterance.lang}`);
    }
    
    utterance.rate = options?.rate ?? 0.9;
    utterance.pitch = options?.pitch ?? 1.0;
    utterance.volume = options?.volume ?? 1.0;
    
    utterance.onend = () => {
      options?.onEnd?.();
    };
    
    utterance.onerror = (event) => {
      console.error('[TTS] Speech synthesis error:', event);
      // Don't report "interrupted" errors as they're usually from cancel()
      if (event.error !== 'interrupted' && event.error !== 'canceled') {
        options?.onError?.(new Error(`Speech synthesis failed: ${event.error}`));
      }
    };
    
    // Mobile fix: Chrome on Android sometimes needs the speech to be triggered
    // in a specific way to work properly
    try {
      window.speechSynthesis.speak(utterance);
      
      // Mobile fix: Some browsers pause speech synthesis when in background
      // Resume if paused
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    } catch (error) {
      console.error('[TTS] Error speaking:', error);
      options?.onError?.(new Error('Failed to start speech synthesis'));
    }
  }, 50);
}

/**
 * Check if TTS is available for a language
 * Returns true if either specific voices exist OR if the browser supports the language
 */
export function isTTSAvailableForLanguage(languageCode: string): boolean {
  if (!isSpeechSynthesisSupported()) {
    return false;
  }
  
  // Check if we have specific voices
  const voices = getVoicesForLanguage(languageCode);
  if (voices.length > 0) {
    return true;
  }
  
  // Mobile fallback: Even without specific voices, the browser might support TTS
  // for common languages through its default engine
  const commonLanguages = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];
  if (commonLanguages.includes(languageCode)) {
    // Assume availability for common languages even if voices aren't enumerated
    // This is especially important for mobile where voice enumeration may fail
    return true;
  }
  
  return false;
}

/**
 * Initialize speech synthesis (load voices)
 * Call this on component mount to ensure voices are loaded
 * Mobile browsers often need multiple attempts to load voices
 */
export function initializeSpeechSynthesis(callback?: () => void): void {
  if (!isSpeechSynthesisSupported()) {
    console.warn('[TTS] Speech synthesis not supported');
    callback?.();
    return;
  }

  // If callback provided, add to queue
  if (callback) {
    voiceLoadCallbacks.push(callback);
  }

  const notifyCallbacks = () => {
    voiceLoadCallbacks.forEach(cb => cb());
    voiceLoadCallbacks = [];
  };

  const checkVoices = () => {
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      console.log(`[TTS] Loaded ${voices.length} voices`);
      notifyCallbacks();
      return true;
    }
    return false;
  };

  // Try immediately
  if (checkVoices()) {
    return;
  }

  // Listen for voices changed event (primary method for Chrome)
  if (window.speechSynthesis.onvoiceschanged !== undefined) {
    window.speechSynthesis.onvoiceschanged = () => {
      checkVoices();
    };
  }

  // Mobile fix: Retry multiple times with increasing delays
  // Some mobile browsers need more time to load voices
  const retryDelays = [100, 300, 500, 1000, 2000];
  retryDelays.forEach((delay, index) => {
    setTimeout(() => {
      if (!voicesLoaded) {
        const loaded = checkVoices();
        if (!loaded && index === retryDelays.length - 1) {
          // Final attempt failed, but still notify callbacks
          // The browser might still work without enumerated voices
          console.warn('[TTS] Voices not enumerated, but TTS may still work');
          notifyCallbacks();
        }
      }
    }, delay);
  });
}

/**
 * Force reload voices (useful for mobile when switching apps)
 */
export function reloadVoices(): Promise<SpeechSynthesisVoice[]> {
  return new Promise((resolve) => {
    if (!isSpeechSynthesisSupported()) {
      resolve([]);
      return;
    }

    voicesLoaded = false;
    cachedVoices = [];

    // Trigger voice reload
    const voices = window.speechSynthesis.getVoices();
    if (voices.length > 0) {
      cachedVoices = voices;
      voicesLoaded = true;
      resolve(voices);
      return;
    }

    // Wait for voices to load
    const timeout = setTimeout(() => {
      resolve(cachedVoices);
    }, 2000);

    window.speechSynthesis.onvoiceschanged = () => {
      clearTimeout(timeout);
      const loadedVoices = window.speechSynthesis.getVoices();
      cachedVoices = loadedVoices;
      voicesLoaded = true;
      resolve(loadedVoices);
    };
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Check if speech is currently playing
 */
export function isSpeaking(): boolean {
  if (!isSpeechSynthesisSupported()) {
    return false;
  }
  return window.speechSynthesis.speaking;
}
