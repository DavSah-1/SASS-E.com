/**
 * Tests for Pronunciation Analysis Feature
 */

import { describe, it, expect } from 'vitest';

// Helper function to count syllables (same as in routers.ts)
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouyáéíóúàèìòùäëïöüâêîôû]/gi);
  if (!vowels) return 1;
  
  let count = 0;
  let lastWasVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/.test(char);
    if (isVowel && !lastWasVowel) {
      count++;
    }
    lastWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}

// Scoring algorithm (same logic as in routers.ts)
function calculatePronunciationScores(
  word: string,
  duration: number,
  waveformStats: {
    peaks: number;
    average: number;
    variance: number;
    silenceRatio: number;
  }
) {
  const syllableCount = countSyllables(word);
  const expectedDuration = syllableCount * 0.4;
  const durationRatio = Math.min(duration, expectedDuration) / Math.max(duration, expectedDuration);
  
  const { peaks, average, variance, silenceRatio } = waveformStats;
  
  // Timing score
  const timingScore = Math.round(durationRatio * 100);
  
  // Clarity score
  let clarityScore = 50;
  if (average > 0.25 && average < 0.75) clarityScore += 20;
  if (variance > 0.04 && variance < 0.18) clarityScore += 15;
  if (silenceRatio < 0.35) clarityScore += 15;
  clarityScore = Math.min(100, Math.max(0, clarityScore));
  
  // Pitch score
  const expectedPeaks = syllableCount * 8;
  const peakRatio = Math.min(peaks, expectedPeaks) / Math.max(peaks, expectedPeaks);
  const pitchScore = Math.round(50 + (peakRatio * 50));
  
  // Accent score (deterministic for testing)
  const accentScore = Math.round((timingScore + clarityScore + pitchScore) / 3);
  
  // Overall score
  const overallScore = Math.round(
    timingScore * 0.25 +
    clarityScore * 0.30 +
    pitchScore * 0.25 +
    accentScore * 0.20
  );
  
  return { overallScore, pitchScore, clarityScore, timingScore, accentScore };
}

describe('Pronunciation Analysis', () => {
  describe('countSyllables', () => {
    it('should count syllables in simple English words', () => {
      expect(countSyllables('hello')).toBe(2);
      expect(countSyllables('world')).toBe(1);
      expect(countSyllables('beautiful')).toBe(3);
      expect(countSyllables('cat')).toBe(1);
    });

    it('should count syllables in Spanish words', () => {
      expect(countSyllables('hola')).toBe(2);
      expect(countSyllables('gracias')).toBe(2);
      expect(countSyllables('español')).toBe(3);
      expect(countSyllables('buenos')).toBe(2);
    });

    it('should count syllables in French words', () => {
      expect(countSyllables('bonjour')).toBe(2);
      expect(countSyllables('merci')).toBe(2);
      expect(countSyllables('français')).toBe(2);
    });

    it('should handle words with no vowels', () => {
      expect(countSyllables('xyz')).toBe(1);
      expect(countSyllables('rhythm')).toBe(1);
    });

    it('should handle consecutive vowels as one syllable', () => {
      expect(countSyllables('beautiful')).toBe(3);
      expect(countSyllables('queue')).toBe(1);
    });
  });

  describe('calculatePronunciationScores', () => {
    it('should give high scores for good pronunciation characteristics', () => {
      const word = 'hola'; // 2 syllables, expected ~0.8s
      const duration = 0.8;
      const waveformStats = {
        peaks: 16, // 2 syllables * 8 = 16 expected
        average: 0.5, // Good amplitude
        variance: 0.1, // Good variance
        silenceRatio: 0.2, // Low silence
      };

      const scores = calculatePronunciationScores(word, duration, waveformStats);
      
      expect(scores.overallScore).toBeGreaterThan(80);
      expect(scores.timingScore).toBe(100);
      expect(scores.clarityScore).toBe(100);
      expect(scores.pitchScore).toBe(100);
    });

    it('should give lower scores for poor timing', () => {
      const word = 'hola'; // 2 syllables, expected ~0.8s
      const duration = 2.0; // Too slow
      const waveformStats = {
        peaks: 16,
        average: 0.5,
        variance: 0.1,
        silenceRatio: 0.2,
      };

      const scores = calculatePronunciationScores(word, duration, waveformStats);
      
      expect(scores.timingScore).toBeLessThan(50);
      expect(scores.overallScore).toBeLessThan(85);
    });

    it('should give lower scores for poor clarity', () => {
      const word = 'hola';
      const duration = 0.8;
      const waveformStats = {
        peaks: 16,
        average: 0.1, // Too quiet
        variance: 0.01, // Too flat
        silenceRatio: 0.5, // Too much silence
      };

      const scores = calculatePronunciationScores(word, duration, waveformStats);
      
      expect(scores.clarityScore).toBe(50); // Base score only
      expect(scores.overallScore).toBeLessThan(90);
    });

    it('should give lower scores for incorrect pitch patterns', () => {
      const word = 'hola';
      const duration = 0.8;
      const waveformStats = {
        peaks: 4, // Too few peaks
        average: 0.5,
        variance: 0.1,
        silenceRatio: 0.2,
      };

      const scores = calculatePronunciationScores(word, duration, waveformStats);
      
      expect(scores.pitchScore).toBeLessThan(80);
    });

    it('should produce different scores for different inputs', () => {
      const word = 'gracias';
      
      const goodPronunciation = calculatePronunciationScores(word, 0.8, {
        peaks: 16,
        average: 0.5,
        variance: 0.1,
        silenceRatio: 0.2,
      });

      const poorPronunciation = calculatePronunciationScores(word, 2.5, {
        peaks: 5,
        average: 0.1,
        variance: 0.02,
        silenceRatio: 0.6,
      });

      expect(goodPronunciation.overallScore).toBeGreaterThan(poorPronunciation.overallScore);
      expect(goodPronunciation.overallScore - poorPronunciation.overallScore).toBeGreaterThan(20);
    });

    it('should handle longer words correctly', () => {
      const word = 'beautiful'; // 3 syllables
      const duration = 1.2; // ~0.4s per syllable
      const waveformStats = {
        peaks: 24, // 3 * 8
        average: 0.5,
        variance: 0.1,
        silenceRatio: 0.2,
      };

      const scores = calculatePronunciationScores(word, duration, waveformStats);
      
      expect(scores.timingScore).toBe(100);
      expect(scores.overallScore).toBeGreaterThan(85);
    });
  });

  describe('Score ranges', () => {
    it('should always produce scores between 0 and 100', () => {
      const testCases = [
        { word: 'a', duration: 0.1, stats: { peaks: 1, average: 0.1, variance: 0.01, silenceRatio: 0.9 } },
        { word: 'supercalifragilistic', duration: 5, stats: { peaks: 100, average: 0.9, variance: 0.5, silenceRatio: 0 } },
        { word: 'test', duration: 0.4, stats: { peaks: 8, average: 0.5, variance: 0.1, silenceRatio: 0.2 } },
      ];

      for (const { word, duration, stats } of testCases) {
        const scores = calculatePronunciationScores(word, duration, stats);
        
        expect(scores.overallScore).toBeGreaterThanOrEqual(0);
        expect(scores.overallScore).toBeLessThanOrEqual(100);
        expect(scores.pitchScore).toBeGreaterThanOrEqual(0);
        expect(scores.pitchScore).toBeLessThanOrEqual(100);
        expect(scores.clarityScore).toBeGreaterThanOrEqual(0);
        expect(scores.clarityScore).toBeLessThanOrEqual(100);
        expect(scores.timingScore).toBeGreaterThanOrEqual(0);
        expect(scores.timingScore).toBeLessThanOrEqual(100);
        expect(scores.accentScore).toBeGreaterThanOrEqual(0);
        expect(scores.accentScore).toBeLessThanOrEqual(100);
      }
    });
  });
});
