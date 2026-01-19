import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { trpc } from "@/lib/trpc";

interface TranslationContextType {
  language: string;
  setLanguage: (lang: string) => void;
  t: (text: string) => string;
  isTranslating: boolean;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

/**
 * Translation cache to avoid repeated API calls
 */
const translationCache = new Map<string, Map<string, string>>();

export function TranslationProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<string>("en");
  const [isTranslating, setIsTranslating] = useState(false);
  const [pendingTranslations, setPendingTranslations] = useState<Set<string>>(new Set());

  const setPreferredLanguageMutation = trpc.i18n.setPreferredLanguage.useMutation();

  // Detect browser language on mount
  useEffect(() => {
    const stored = localStorage.getItem("preferredLanguage");
    if (stored) {
      setLanguageState(stored);
    } else {
      // Detect from browser
      const browserLang = navigator.language.split("-")[0]; // e.g., "en-US" -> "en"
      setLanguageState(browserLang);
      localStorage.setItem("preferredLanguage", browserLang);
    }
  }, []);

  const setLanguage = (lang: string) => {
    setLanguageState(lang);
    localStorage.setItem("preferredLanguage", lang);
    
    // Update user preference in database if authenticated
    setPreferredLanguageMutation.mutate({ language: lang }, {
      onError: () => {
        // Ignore errors if user is not authenticated
      }
    });
  };

  /**
   * Translate text function
   * Returns original text immediately and triggers background translation
   */
  const t = (text: string): string => {
    // Return original for English
    if (language === "en" || !language || !text) {
      return text;
    }

    // Check cache first
    if (!translationCache.has(language)) {
      translationCache.set(language, new Map());
    }
    
    const langCache = translationCache.get(language)!;
    if (langCache.has(text)) {
      return langCache.get(text)!;
    }

    // If not in cache and not already pending, trigger translation
    if (!pendingTranslations.has(`${text}:${language}`)) {
      setPendingTranslations(prev => new Set(prev).add(`${text}:${language}`));
      
      // Trigger background translation
      fetch(`/api/trpc/i18n.translate?input=${encodeURIComponent(JSON.stringify({ text, targetLanguage: language }))}`)
        .then(res => res.json())
        .then(data => {
          if (data.result?.data?.translated) {
            langCache.set(text, data.result.data.translated);
            setPendingTranslations(prev => {
              const newSet = new Set(prev);
              newSet.delete(`${text}:${language}`);
              return newSet;
            });
            // Force re-render by updating a dummy state
            setIsTranslating(prev => !prev);
          }
        })
        .catch(err => {
          console.error("Translation error:", err);
          setPendingTranslations(prev => {
            const newSet = new Set(prev);
            newSet.delete(`${text}:${language}`);
            return newSet;
          });
        });
    }

    // Return original text while translation is pending
    return text;
  };

  return (
    <TranslationContext.Provider value={{ language, setLanguage, t, isTranslating }}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error("useTranslation must be used within TranslationProvider");
  }
  return context;
}
