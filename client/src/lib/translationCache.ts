/**
 * Translation Cache Utility
 * Manages offline caching of frequently used translations in localStorage
 */

export interface CachedTranslation {
  originalText: string;
  translatedText: string;
  sourceLanguage: string;
  targetLanguage: string;
  usageCount: number;
  lastUsedAt: string;
}

const CACHE_KEY = 'translation_cache';
const MAX_CACHE_SIZE = 100;

/**
 * Get cached translation from localStorage
 */
export function getCachedTranslation(
  originalText: string,
  sourceLanguage: string,
  targetLanguage: string
): CachedTranslation | null {
  try {
    const cache = getCache();
    const key = generateCacheKey(originalText, sourceLanguage, targetLanguage);
    const cached = cache.find(t => generateCacheKey(t.originalText, t.sourceLanguage, t.targetLanguage) === key);
    
    if (cached) {
      // Update usage
      cached.usageCount++;
      cached.lastUsedAt = new Date().toISOString();
      saveCache(cache);
      return cached;
    }
    
    return null;
  } catch (error) {
    console.error('Error reading translation cache:', error);
    return null;
  }
}

/**
 * Add translation to cache
 */
export function cacheTranslation(translation: Omit<CachedTranslation, 'usageCount' | 'lastUsedAt'>) {
  try {
    const cache = getCache();
    const key = generateCacheKey(translation.originalText, translation.sourceLanguage, translation.targetLanguage);
    
    // Check if already exists
    const existingIndex = cache.findIndex(
      t => generateCacheKey(t.originalText, t.sourceLanguage, t.targetLanguage) === key
    );
    
    if (existingIndex >= 0) {
      // Update existing
      cache[existingIndex].translatedText = translation.translatedText;
      cache[existingIndex].usageCount++;
      cache[existingIndex].lastUsedAt = new Date().toISOString();
    } else {
      // Add new
      cache.push({
        ...translation,
        usageCount: 1,
        lastUsedAt: new Date().toISOString()
      });
      
      // Trim cache if too large (keep most frequently used)
      if (cache.length > MAX_CACHE_SIZE) {
        cache.sort((a, b) => b.usageCount - a.usageCount);
        cache.splice(MAX_CACHE_SIZE);
      }
    }
    
    saveCache(cache);
  } catch (error) {
    console.error('Error caching translation:', error);
  }
}

/**
 * Sync cache with server data (called after fetching frequent translations)
 */
export function syncCacheWithServer(serverTranslations: CachedTranslation[]) {
  try {
    // Merge server data with local cache, preferring server data
    const localCache = getCache();
    const mergedCache: CachedTranslation[] = [];
    
    // Add all server translations
    for (const serverTrans of serverTranslations) {
      mergedCache.push(serverTrans);
    }
    
    // Add local translations not in server data
    for (const localTrans of localCache) {
      const key = generateCacheKey(localTrans.originalText, localTrans.sourceLanguage, localTrans.targetLanguage);
      const existsInServer = serverTranslations.some(
        t => generateCacheKey(t.originalText, t.sourceLanguage, t.targetLanguage) === key
      );
      
      if (!existsInServer && mergedCache.length < MAX_CACHE_SIZE) {
        mergedCache.push(localTrans);
      }
    }
    
    // Sort by usage count and trim
    mergedCache.sort((a, b) => b.usageCount - a.usageCount);
    mergedCache.splice(MAX_CACHE_SIZE);
    
    saveCache(mergedCache);
  } catch (error) {
    console.error('Error syncing cache:', error);
  }
}

/**
 * Clear translation cache
 */
export function clearCache() {
  try {
    localStorage.removeItem(CACHE_KEY);
  } catch (error) {
    console.error('Error clearing cache:', error);
  }
}

/**
 * Get cache size
 */
export function getCacheSize(): number {
  try {
    return getCache().length;
  } catch {
    return 0;
  }
}

// Helper functions

function getCache(): CachedTranslation[] {
  try {
    const data = localStorage.getItem(CACHE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

function saveCache(cache: CachedTranslation[]) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving cache:', error);
  }
}

function generateCacheKey(originalText: string, sourceLanguage: string, targetLanguage: string): string {
  return `${sourceLanguage}:${targetLanguage}:${originalText.toLowerCase().trim()}`;
}
