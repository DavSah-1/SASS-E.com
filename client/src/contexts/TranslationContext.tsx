import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

/**
 * Translation cache to avoid repeated API calls
 * Structure: Map<language, Map<originalText, translatedText>>
 */
const translationCache = new Map<string, Map<string, string>>();

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");
  const [translations, setTranslations] = useState<Map<string, string>>(new Map());
  
  const setPreferredLanguageMutation = trpc.auth.setLanguage.useMutation();

  // Initialize language from localStorage or browser
  useEffect(() => {
    const saved = localStorage.getItem("preferredLanguage");
    if (saved && saved !== "en") {
      setLanguageState(saved);
    } else {
      const browserLang = navigator.language.split("-")[0];
      if (browserLang && browserLang !== "en") {
        setLanguageState(browserLang);
        localStorage.setItem("preferredLanguage", browserLang);
      }
    }
  }, []);

  // When language changes, update the translations map from cache
  useEffect(() => {
    if (language === "en") {
      setTranslations(new Map());
      return;
    }

    const langCache = translationCache.get(language);
    if (langCache) {
      setTranslations(new Map(langCache));
    } else {
      setTranslations(new Map());
      translationCache.set(language, new Map());
    }
  }, [language]);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    
    // Update user preference in database if authenticated
    setPreferredLanguageMutation.mutate({ language: lang }, {
      onError: () => {
        console.warn("Failed to save language preference to database");
      }
    });
  };

  /**
   * Translation function
   * Returns cached translation if available, otherwise triggers fetch and returns original
   */
  const t = (text: string): string => {
    console.log(`[t] Called with text="${text.substring(0, 30)}...", language="${language}"`);
    
    // Return original for English or empty text
    if (language === "en" || !language || !text) {
      console.log(`[t] Returning original (lang=${language})`);
      return text;
    }

    // Check if we have a cached translation
    const cached = translations.get(text);
    if (cached) {
      return cached;
    }

    // Trigger background translation (fire and forget)
    const langCache = translationCache.get(language);
    if (langCache && !langCache.has(text)) {
      // Mark as pending to avoid duplicate requests
      langCache.set(text, text);
      
      // Fetch translation in background
      fetch(`/api/trpc/i18n.translate?input=${encodeURIComponent(JSON.stringify({ text, targetLanguage: language }))}`)
        .then(res => res.json())
        .then(data => {
          if (data.result?.data?.translated) {
            const translated = data.result.data.translated;
            langCache.set(text, translated);
            
            // Update state to trigger re-render
            setTranslations(new Map(langCache));
          }
        })
        .catch(err => {
          console.error("Translation error:", err);
          // Remove pending marker on error
          langCache.delete(text);
        });
    }

    // Return original text while translation is pending
    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error("useTranslation must be used within a TranslationProvider");
  }
  return context;
}
