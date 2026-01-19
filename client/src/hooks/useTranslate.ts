import { useLanguage } from '@/contexts/LanguageContext';
import { trpc } from '@/lib/trpc';

/**
 * Hook for translating text using AI translation API
 * Returns the translated text, automatically re-rendering when translation completes
 */
export function useTranslate(text: string): string {
  const { language } = useLanguage();
  
  // Always call useQuery (hooks must be called unconditionally)
  const { data } = trpc.i18n.translate.useQuery(
    { text, targetLanguage: language },
    {
      enabled: language !== 'en' && !!text && text.trim() !== '', // Only fetch when needed
      staleTime: Infinity, // Translations never go stale
      gcTime: 24 * 60 * 60 * 1000, // Cache for 24 hours (renamed from cacheTime in React Query v5)
    }
  );
  
  // Return original text for English or empty strings
  if (language === 'en' || !text || text.trim() === '') {
    return text;
  }
  
  // Return translated text if available, otherwise original text
  return data?.translated || text;
}
