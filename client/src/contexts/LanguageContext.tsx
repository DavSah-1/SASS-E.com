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
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  console.log('[LanguageProvider] Initializing...');
  const { user, isAuthenticated } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [isLoading, setIsLoading] = useState(true);
  
  const setLanguageMutation = trpc.auth.setLanguage.useMutation();

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
    // Hardcoded test translations to verify the mechanism works
    const testTranslations: Record<string, Record<string, string>> = {
      'fr': {
        'Meet SASS-E': 'Rencontrez SASS-E',
        'Your intelligent AI assistant. Advanced, adaptive, and always ready to help.': 'Votre assistant IA intelligent. Avancé, adaptatif et toujours prêt à aider.',
        'Start Voice Chat': 'Démarrer le chat vocal',
        'Money Hub': 'Centre financier',
      },
      'es': {
        'Meet SASS-E': 'Conoce a SASS-E',
        'Your intelligent AI assistant. Advanced, adaptive, and always ready to help.': 'Tu asistente de IA inteligente. Avanzado, adaptable y siempre listo para ayudar.',
        'Start Voice Chat': 'Iniciar chat de voz',
        'Money Hub': 'Centro de dinero',
      }
    };
    
    // Return original text for English or empty strings
    if (language === 'en' || !text || text.trim() === '') {
      return text;
    }
    
    // Check hardcoded translations first
    if (testTranslations[language]?.[text]) {
      return testTranslations[language][text];
    }
    
    // Return original text if no translation found
    return text;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translate, isLoading }}>
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
