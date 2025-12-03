import { useEffect, useState } from 'react';

/**
 * Hook to detect if the browser is in incognito/private mode
 * Returns true if incognito mode is detected, false otherwise
 */
export function useIncognitoDetection(): boolean {
  const [isIncognito, setIsIncognito] = useState(false);

  useEffect(() => {
    detectIncognito();
  }, []);

  const detectIncognito = async () => {
    try {
      // Method 1: Check if localStorage is available and persistent
      if (!window.localStorage) {
        setIsIncognito(true);
        return;
      }

      // Method 2: Try to use IndexedDB (blocked in some incognito modes)
      if ('storage' in navigator && 'estimate' in navigator.storage) {
        const { quota } = await navigator.storage.estimate();
        // In incognito mode, quota is typically very small (< 120MB)
        if (quota && quota < 120000000) {
          setIsIncognito(true);
          return;
        }
      }

      // Method 3: Check for FileSystem API (often restricted in incognito)
      if ('webkitRequestFileSystem' in window) {
        (window as any).webkitRequestFileSystem(
          (window as any).TEMPORARY,
          1,
          () => setIsIncognito(false),
          () => setIsIncognito(true)
        );
      }

      // If none of the above methods detect incognito, assume normal mode
      setIsIncognito(false);
    } catch (error) {
      // If any error occurs, assume normal mode to avoid false positives
      console.warn('Incognito detection failed:', error);
      setIsIncognito(false);
    }
  };

  return isIncognito;
}
