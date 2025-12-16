/**
 * Tests for Language TTS utility
 * Tests mobile compatibility features and fallback mechanisms
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock window.speechSynthesis
const mockSpeechSynthesis = {
  getVoices: vi.fn(),
  speak: vi.fn(),
  cancel: vi.fn(),
  paused: false,
  speaking: false,
  resume: vi.fn(),
  onvoiceschanged: null as (() => void) | null,
};

const mockVoices: SpeechSynthesisVoice[] = [
  { name: 'Spanish (Spain)', lang: 'es-ES', localService: true, default: false, voiceURI: 'es-ES' } as SpeechSynthesisVoice,
  { name: 'Spanish (Mexico)', lang: 'es-MX', localService: false, default: false, voiceURI: 'es-MX' } as SpeechSynthesisVoice,
  { name: 'English (US)', lang: 'en-US', localService: true, default: true, voiceURI: 'en-US' } as SpeechSynthesisVoice,
  { name: 'French (France)', lang: 'fr-FR', localService: true, default: false, voiceURI: 'fr-FR' } as SpeechSynthesisVoice,
  { name: 'German Natural', lang: 'de-DE', localService: false, default: false, voiceURI: 'de-DE-natural' } as SpeechSynthesisVoice,
];

describe('Language TTS Utility', () => {
  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();
    mockSpeechSynthesis.getVoices.mockReturnValue(mockVoices);
    
    // Mock window.speechSynthesis
    Object.defineProperty(global, 'window', {
      value: {
        speechSynthesis: mockSpeechSynthesis,
        SpeechSynthesisUtterance: vi.fn().mockImplementation((text) => ({
          text,
          voice: null,
          lang: '',
          rate: 1,
          pitch: 1,
          volume: 1,
          onend: null,
          onerror: null,
        })),
      },
      writable: true,
    });
    
    Object.defineProperty(global, 'document', {
      value: {
        visibilityState: 'visible',
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSpeechSynthesisSupported', () => {
    it('should return true when speechSynthesis is available', async () => {
      const { isSpeechSynthesisSupported } = await import('./languageTTS');
      expect(isSpeechSynthesisSupported()).toBe(true);
    });

    it('should return false when speechSynthesis is not available', async () => {
      Object.defineProperty(global, 'window', {
        value: {},
        writable: true,
      });
      
      // Re-import to get fresh module
      vi.resetModules();
      const { isSpeechSynthesisSupported } = await import('./languageTTS');
      expect(isSpeechSynthesisSupported()).toBe(false);
    });
  });

  describe('getVoicesForLanguage', () => {
    it('should return voices matching the language code', async () => {
      const { getVoicesForLanguage } = await import('./languageTTS');
      const spanishVoices = getVoicesForLanguage('es');
      
      expect(spanishVoices.length).toBe(2);
      expect(spanishVoices[0].lang).toBe('es-ES');
      expect(spanishVoices[1].lang).toBe('es-MX');
    });

    it('should return empty array for unsupported language', async () => {
      const { getVoicesForLanguage } = await import('./languageTTS');
      const voices = getVoicesForLanguage('xyz');
      
      expect(voices.length).toBe(0);
    });

    it('should match partial language codes', async () => {
      const { getVoicesForLanguage } = await import('./languageTTS');
      const frenchVoices = getVoicesForLanguage('fr');
      
      expect(frenchVoices.length).toBe(1);
      expect(frenchVoices[0].lang).toBe('fr-FR');
    });
  });

  describe('getBestVoiceForLanguage', () => {
    it('should prefer local service voices', async () => {
      const { getBestVoiceForLanguage } = await import('./languageTTS');
      const voice = getBestVoiceForLanguage('es');
      
      expect(voice).not.toBeNull();
      expect(voice?.localService).toBe(true);
      expect(voice?.lang).toBe('es-ES');
    });

    it('should return null for unsupported language with no fallback', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);
      vi.resetModules();
      
      const { getBestVoiceForLanguage } = await import('./languageTTS');
      const voice = getBestVoiceForLanguage('xyz');
      
      expect(voice).toBeNull();
    });

    it('should prefer enhanced/natural voices when available', async () => {
      const voicesWithNatural = [
        { name: 'German', lang: 'de-DE', localService: false, default: false, voiceURI: 'de-DE' } as SpeechSynthesisVoice,
        { name: 'German Natural', lang: 'de-DE', localService: false, default: false, voiceURI: 'de-DE-natural' } as SpeechSynthesisVoice,
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(voicesWithNatural);
      vi.resetModules();
      
      const { getBestVoiceForLanguage } = await import('./languageTTS');
      const voice = getBestVoiceForLanguage('de');
      
      expect(voice?.name).toContain('Natural');
    });
  });

  describe('isTTSAvailableForLanguage', () => {
    it('should return true for languages with voices', async () => {
      const { isTTSAvailableForLanguage } = await import('./languageTTS');
      
      expect(isTTSAvailableForLanguage('es')).toBe(true);
      expect(isTTSAvailableForLanguage('en')).toBe(true);
      expect(isTTSAvailableForLanguage('fr')).toBe(true);
    });

    it('should return true for common languages even without enumerated voices (mobile fallback)', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);
      vi.resetModules();
      
      const { isTTSAvailableForLanguage } = await import('./languageTTS');
      
      // Common languages should be assumed available
      expect(isTTSAvailableForLanguage('es')).toBe(true);
      expect(isTTSAvailableForLanguage('en')).toBe(true);
      expect(isTTSAvailableForLanguage('fr')).toBe(true);
      expect(isTTSAvailableForLanguage('de')).toBe(true);
      expect(isTTSAvailableForLanguage('ja')).toBe(true);
    });

    it('should return false for uncommon languages without voices', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);
      vi.resetModules();
      
      const { isTTSAvailableForLanguage } = await import('./languageTTS');
      
      expect(isTTSAvailableForLanguage('xyz')).toBe(false);
      expect(isTTSAvailableForLanguage('tlh')).toBe(false); // Klingon
    });
  });

  describe('LANGUAGE_NAMES', () => {
    it('should have display names for all supported languages', async () => {
      const { LANGUAGE_NAMES } = await import('./languageTTS');
      
      expect(LANGUAGE_NAMES.es).toBe('Spanish');
      expect(LANGUAGE_NAMES.fr).toBe('French');
      expect(LANGUAGE_NAMES.de).toBe('German');
      expect(LANGUAGE_NAMES.it).toBe('Italian');
      expect(LANGUAGE_NAMES.pt).toBe('Portuguese');
      expect(LANGUAGE_NAMES.ja).toBe('Japanese');
      expect(LANGUAGE_NAMES.zh).toBe('Chinese');
      expect(LANGUAGE_NAMES.ko).toBe('Korean');
      expect(LANGUAGE_NAMES.ru).toBe('Russian');
      expect(LANGUAGE_NAMES.ar).toBe('Arabic');
      expect(LANGUAGE_NAMES.en).toBe('English');
    });
  });

  describe('Mobile compatibility', () => {
    it('should handle empty voices array gracefully', async () => {
      mockSpeechSynthesis.getVoices.mockReturnValue([]);
      vi.resetModules();
      
      const { getVoicesForLanguage, getBestVoiceForLanguage } = await import('./languageTTS');
      
      expect(getVoicesForLanguage('es')).toEqual([]);
      expect(getBestVoiceForLanguage('es')).toBeNull();
    });

    it('should support expanded locale mappings for mobile', async () => {
      const mobileVoices = [
        { name: 'Spanish Argentina', lang: 'es-AR', localService: true, default: false, voiceURI: 'es-AR' } as SpeechSynthesisVoice,
        { name: 'Chinese Hong Kong', lang: 'zh-HK', localService: true, default: false, voiceURI: 'zh-HK' } as SpeechSynthesisVoice,
      ];
      mockSpeechSynthesis.getVoices.mockReturnValue(mobileVoices);
      vi.resetModules();
      
      const { getVoicesForLanguage } = await import('./languageTTS');
      
      expect(getVoicesForLanguage('es').length).toBe(1);
      expect(getVoicesForLanguage('zh').length).toBe(1);
    });
  });
});
