/**
 * Tests for Server-Side TTS Service
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the ENV
vi.mock('./_core/env', () => ({
  ENV: {
    forgeApiKey: 'test-api-key',
    forgeApiUrl: 'https://forge.manus.im',
  },
}));

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('Text-to-Speech Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getVoiceForLanguage', () => {
    it('should return nova voice for English', async () => {
      const { getVoiceForLanguage } = await import('./_core/textToSpeech');
      expect(getVoiceForLanguage('en')).toBe('nova');
    });

    it('should return shimmer voice for French', async () => {
      const { getVoiceForLanguage } = await import('./_core/textToSpeech');
      expect(getVoiceForLanguage('fr')).toBe('shimmer');
    });

    it('should return nova voice for Spanish', async () => {
      const { getVoiceForLanguage } = await import('./_core/textToSpeech');
      expect(getVoiceForLanguage('es')).toBe('nova');
    });

    it('should return nova voice for unknown languages', async () => {
      const { getVoiceForLanguage } = await import('./_core/textToSpeech');
      expect(getVoiceForLanguage('xyz')).toBe('nova');
    });
  });

  describe('generateSpeech', () => {
    it('should call TTS API with correct parameters', async () => {
      const mockAudioBuffer = new ArrayBuffer(100);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
      });

      const { generateSpeech } = await import('./_core/textToSpeech');
      
      const result = await generateSpeech({
        text: 'Hello world',
        voice: 'nova',
        model: 'tts-1-hd',
        speed: 0.9,
      });

      expect(mockFetch).toHaveBeenCalledWith(
        'https://forge.manus.im/v1/audio/speech',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key',
          }),
        })
      );

      expect(result.contentType).toBe('audio/mpeg');
      expect(result.audioBuffer).toBeInstanceOf(Buffer);
    });

    it('should throw error when API fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: () => Promise.resolve('Server error'),
      });

      const { generateSpeech } = await import('./_core/textToSpeech');
      
      await expect(generateSpeech({
        text: 'Hello',
        voice: 'nova',
      })).rejects.toThrow('TTS API failed');
    });
  });

  describe('generatePronunciation', () => {
    it('should use HD model and appropriate voice for language', async () => {
      const mockAudioBuffer = new ArrayBuffer(100);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
      });

      const { generatePronunciation } = await import('./_core/textToSpeech');
      
      await generatePronunciation('hola', 'es', 0.85);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.model).toBe('tts-1-hd');
      expect(body.voice).toBe('nova');
      expect(body.speed).toBe(0.85);
      expect(body.input).toBe('hola');
    });

    it('should use shimmer voice for Italian', async () => {
      const mockAudioBuffer = new ArrayBuffer(100);
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: () => Promise.resolve(mockAudioBuffer),
      });

      const { generatePronunciation } = await import('./_core/textToSpeech');
      
      await generatePronunciation('ciao', 'it', 0.85);

      const fetchCall = mockFetch.mock.calls[0];
      const body = JSON.parse(fetchCall[1].body);
      
      expect(body.voice).toBe('shimmer');
    });
  });
});
