import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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
  
  // Simple translate function that just returns the original text for now
  // This maintains compatibility with pages that use t("text") syntax
  const translate = (text: string): string => {
    // For now, just return the original text
    // In the future, this can be enhanced with AI translation
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
