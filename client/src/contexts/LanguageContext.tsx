import React, { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Language, getTranslations, Translations, detectBrowserLanguage } from '@/lib/i18n';
import { trpc } from '@/lib/trpc';
import { useAuth } from '@/_core/hooks/useAuth';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
  translate: (text: string) => string;
  isLoading: boolean;
  _v: number; // Internal version counter for forcing re-renders
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  console.log('[LanguageProvider] Initializing...');
  const { user, isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  const [renderCounter, setRenderCounter] = useState(0);
  
  const setLanguageMutation = trpc.auth.setLanguage.useMutation();
  const utils = trpc.useUtils();

  // Initialize language from user preference or browser
  useEffect(() => {
    if (isAuthenticated && user?.preferredLanguage) {
      // Use user's saved preference
      const userLang = user.preferredLanguage as Language;
      if (['en', 'es', 'fr', 'de'].includes(userLang)) {
        setLanguageState(userLang);
      }
    } else {
      // Detect browser language
      const browserLang = detectBrowserLanguage();
      if (['en', 'es', 'fr', 'de'].includes(browserLang)) {
        setLanguageState(browserLang);
      }
    }
    setIsLoading(false);
  }, [user, isAuthenticated]);

  const setLanguage = async (lang: Language) => {
    setLanguageState(lang);
    
    // Save to database if user is authenticated
    if (isAuthenticated) {
      try {
        await setLanguageMutation.mutateAsync({ language: lang });
      } catch (error) {
        console.error('Failed to save language preference:', error);
      }
    }
    
    // Save to localStorage as fallback
    localStorage.setItem('preferredLanguage', lang);
  };

  const t = getTranslations(language);
  const translationCache = useRef<Map<string, Map<string, string>>>(new Map());
  const [, forceUpdate] = useState(0);
  
  // Load cache from localStorage on mount
  useEffect(() => {
    const cached = localStorage.getItem('translationCache');
    if (cached) {
      try {
        const parsed = JSON.parse(cached);
        translationCache.current = new Map(Object.entries(parsed).map(([lang, texts]) => 
          [lang, new Map(Object.entries(texts as Record<string, string>))]
        ));
      } catch (e) {
        console.error('Failed to load translation cache:', e);
      }
    }
  }, []);
  
  // Save cache to localStorage when it changes
  const saveCache = () => {
    const cacheObj: Record<string, Record<string, string>> = {};
    translationCache.current.forEach((texts, lang) => {
      cacheObj[lang] = Object.fromEntries(texts);
    });
    localStorage.setItem('translationCache', JSON.stringify(cacheObj));
  };
  
  const translate = (text: string): string => {
    // Return original text for English or empty strings
    if (language === 'en' || !text || text.trim() === '') {
      return text;
    }
    
    // Check cache first
    const langCache = translationCache.current.get(language);
    if (langCache?.has(text)) {
      return langCache.get(text)!;
    }
    
    // Fetch translation in background using tRPC utils (only if available)
    if (utils?.client?.i18n?.translate) {
      utils.client.i18n.translate.query({ text, targetLanguage: language })
      .then(result => {
        if (result.translated) {
          if (!translationCache.current.has(language)) {
            translationCache.current.set(language, new Map());
          }
          translationCache.current.get(language)!.set(text, result.translated);
          saveCache();
          // Force re-render to show translated text
          setRenderCounter(prev => prev + 1);
        }
      })
      .catch(error => {
        // Silently fail - translation will be retried on next render
        console.warn('Translation API call failed (will retry):', error.message);
      });
    }
    
    // Return original text while waiting for translation
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, isLoading, _v: renderCounter }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
