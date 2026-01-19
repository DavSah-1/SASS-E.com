import { invokeLLM } from "./llm";

/**
 * Translation cache to avoid repeated API calls
 * Key format: `${text}:${targetLanguage}`
 */
const translationCache = new Map<string, string>();

/**
 * Translate text to target language using LLM
 * @param text - Text to translate
 * @param targetLanguage - Target language code (e.g., 'es', 'fr', 'de', 'zh', 'ar')
 * @returns Translated text
 */
export async function translateText(text: string, targetLanguage: string): Promise<string> {
  // Return original if target is English
  if (targetLanguage === 'en' || !targetLanguage) {
    return text;
  }

  // Check cache first
  const cacheKey = `${text}:${targetLanguage}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following text to ${getLanguageName(targetLanguage)}. Only return the translated text, nothing else. Preserve formatting, HTML tags, and special characters exactly as they appear.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
    });

    const translated = typeof response.choices[0]?.message?.content === 'string' 
      ? response.choices[0].message.content 
      : text;
    
    // Cache the result
    translationCache.set(cacheKey, translated);
    
    return translated;
  } catch (error) {
    console.error("Translation error:", error);
    return text; // Return original text on error
  }
}

/**
 * Batch translate multiple texts
 * @param texts - Array of texts to translate
 * @param targetLanguage - Target language code
 * @returns Array of translated texts
 */
export async function translateBatch(texts: string[], targetLanguage: string): Promise<string[]> {
  if (targetLanguage === 'en' || !targetLanguage) {
    return texts;
  }

  // Check which texts need translation
  const toTranslate: { index: number; text: string }[] = [];
  const results: string[] = new Array(texts.length);

  texts.forEach((text, index) => {
    const cacheKey = `${text}:${targetLanguage}`;
    if (translationCache.has(cacheKey)) {
      results[index] = translationCache.get(cacheKey)!;
    } else {
      toTranslate.push({ index, text });
    }
  });

  // If all cached, return immediately
  if (toTranslate.length === 0) {
    return results;
  }

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `You are a professional translator. Translate the following texts to ${getLanguageName(targetLanguage)}. Return only the translations separated by newlines, in the same order. Preserve formatting and special characters.`,
        },
        {
          role: "user",
          content: toTranslate.map((item) => item.text).join("\n---\n"),
        },
      ],
    });

    const translated = typeof response.choices[0]?.message?.content === 'string'
      ? response.choices[0].message.content
      : "";
    const translations = translated.split("\n---\n");

    toTranslate.forEach((item, i) => {
      const translation = translations[i] || item.text;
      results[item.index] = translation;
      
      // Cache the result
      const cacheKey = `${item.text}:${targetLanguage}`;
      translationCache.set(cacheKey, translation);
    });

    return results;
  } catch (error) {
    console.error("Batch translation error:", error);
    // Fill remaining with original texts
    toTranslate.forEach((item) => {
      results[item.index] = item.text;
    });
    return results;
  }
}

/**
 * Get full language name from code
 */
function getLanguageName(code: string): string {
  const languages: Record<string, string> = {
    es: "Spanish",
    fr: "French",
    de: "German",
    zh: "Chinese",
    ar: "Arabic",
    ja: "Japanese",
    ko: "Korean",
    pt: "Portuguese",
    ru: "Russian",
    it: "Italian",
    nl: "Dutch",
    pl: "Polish",
    tr: "Turkish",
    hi: "Hindi",
    th: "Thai",
    vi: "Vietnamese",
    id: "Indonesian",
    ms: "Malay",
    sv: "Swedish",
    no: "Norwegian",
    da: "Danish",
    fi: "Finnish",
    el: "Greek",
    he: "Hebrew",
    uk: "Ukrainian",
    cs: "Czech",
    ro: "Romanian",
    hu: "Hungarian",
  };
  return languages[code] || code;
}

/**
 * Clear translation cache (useful for testing)
 */
export function clearTranslationCache() {
  translationCache.clear();
}
