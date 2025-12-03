/**
 * Pronunciation comparison and similarity scoring
 * Compares user pronunciation with native/reference pronunciation
 */

import { AudioFeatures } from './audioRecording';

export interface ComparisonResult {
  overallScore: number; // 0-100 percentage
  pitchScore: number; // 0-100
  energyScore: number; // 0-100
  durationScore: number; // 0-100
  timbreScore: number; // 0-100 (based on spectral centroid)
  feedback: string; // Textual feedback for the user
}

/**
 * Compare two audio recordings and calculate similarity score
 */
export function compareAudio(
  userFeatures: AudioFeatures,
  nativeFeatures: AudioFeatures
): ComparisonResult {
  // Calculate individual component scores
  const pitchScore = comparePitch(userFeatures.pitch, nativeFeatures.pitch);
  const energyScore = compareEnergy(userFeatures.energy, nativeFeatures.energy);
  const durationScore = compareDuration(userFeatures.duration, nativeFeatures.duration);
  const timbreScore = compareTimbre(
    userFeatures.spectralCentroid,
    nativeFeatures.spectralCentroid
  );

  // Weighted average for overall score
  const weights = {
    pitch: 0.35,    // Pitch is very important for pronunciation
    energy: 0.20,   // Stress patterns matter
    duration: 0.25, // Timing is important
    timbre: 0.20,   // Voice quality/resonance
  };

  const overallScore = Math.round(
    pitchScore * weights.pitch +
    energyScore * weights.energy +
    durationScore * weights.duration +
    timbreScore * weights.timbre
  );

  const feedback = generateFeedback({
    overallScore,
    pitchScore,
    energyScore,
    durationScore,
    timbreScore,
  });

  return {
    overallScore,
    pitchScore,
    energyScore,
    durationScore,
    timbreScore,
    feedback,
  };
}

/**
 * Compare pitch contours using Dynamic Time Warping (DTW) distance
 */
function comparePitch(userPitch: number[], nativePitch: number[]): number {
  if (userPitch.length === 0 || nativePitch.length === 0) {
    return 0;
  }

  // Normalize pitch values to 0-1 range
  const normalizedUser = normalizePitch(userPitch);
  const normalizedNative = normalizePitch(nativePitch);

  // Calculate DTW distance
  const distance = dtwDistance(normalizedUser, normalizedNative);
  
  // Convert distance to similarity score (0-100)
  // Lower distance = higher score
  const maxDistance = 2.0; // Empirical maximum for normalized pitch
  const similarity = Math.max(0, 100 * (1 - distance / maxDistance));
  
  return Math.round(similarity);
}

/**
 * Normalize pitch values to 0-1 range
 */
function normalizePitch(pitch: number[]): number[] {
  const validPitch = pitch.filter(p => p > 0);
  if (validPitch.length === 0) return pitch;
  
  const min = Math.min(...validPitch);
  const max = Math.max(...validPitch);
  const range = max - min;
  
  if (range === 0) return pitch.map(() => 0.5);
  
  return pitch.map(p => p > 0 ? (p - min) / range : 0);
}

/**
 * Dynamic Time Warping distance between two sequences
 */
function dtwDistance(seq1: number[], seq2: number[]): number {
  const n = seq1.length;
  const m = seq2.length;
  
  // Initialize DTW matrix
  const dtw: number[][] = Array(n + 1).fill(0).map(() => 
    Array(m + 1).fill(Infinity)
  );
  dtw[0][0] = 0;
  
  // Fill DTW matrix
  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const cost = Math.abs(seq1[i - 1] - seq2[j - 1]);
      dtw[i][j] = cost + Math.min(
        dtw[i - 1][j],     // insertion
        dtw[i][j - 1],     // deletion
        dtw[i - 1][j - 1]  // match
      );
    }
  }
  
  return dtw[n][m] / Math.max(n, m); // Normalize by length
}

/**
 * Compare energy patterns (stress and volume)
 */
function compareEnergy(userEnergy: number[], nativeEnergy: number[]): number {
  if (userEnergy.length === 0 || nativeEnergy.length === 0) {
    return 0;
  }

  // Use DTW for energy comparison as well
  const distance = dtwDistance(userEnergy, nativeEnergy);
  const maxDistance = 1.5;
  const similarity = Math.max(0, 100 * (1 - distance / maxDistance));
  
  return Math.round(similarity);
}

/**
 * Compare duration (timing)
 */
function compareDuration(userDuration: number, nativeDuration: number): number {
  if (nativeDuration === 0) return 0;
  
  const ratio = userDuration / nativeDuration;
  
  // Ideal ratio is 1.0 (same duration)
  // Acceptable range: 0.7 to 1.3 (within 30%)
  let score: number;
  
  if (ratio >= 0.9 && ratio <= 1.1) {
    score = 100; // Perfect timing
  } else if (ratio >= 0.7 && ratio <= 1.3) {
    // Linear decrease from 100 to 70
    const deviation = Math.abs(ratio - 1.0);
    score = 100 - (deviation * 100);
  } else {
    // Too fast or too slow
    score = Math.max(0, 70 - Math.abs(ratio - 1.0) * 50);
  }
  
  return Math.round(score);
}

/**
 * Compare timbre (voice quality/resonance)
 */
function compareTimbre(userCentroid: number, nativeCentroid: number): number {
  if (nativeCentroid === 0) return 0;
  
  const ratio = userCentroid / nativeCentroid;
  
  // Similar logic to duration comparison
  let score: number;
  
  if (ratio >= 0.85 && ratio <= 1.15) {
    score = 100;
  } else if (ratio >= 0.7 && ratio <= 1.3) {
    const deviation = Math.abs(ratio - 1.0);
    score = 100 - (deviation * 200);
  } else {
    score = Math.max(0, 60 - Math.abs(ratio - 1.0) * 40);
  }
  
  return Math.round(score);
}

/**
 * Generate helpful feedback based on scores
 */
function generateFeedback(scores: {
  overallScore: number;
  pitchScore: number;
  energyScore: number;
  durationScore: number;
  timbreScore: number;
}): string {
  const { overallScore, pitchScore, energyScore, durationScore, timbreScore } = scores;
  
  if (overallScore >= 90) {
    return "Excellent! Your pronunciation is nearly perfect. 🎉";
  } else if (overallScore >= 80) {
    return "Great job! Your pronunciation is very good. Keep practicing!";
  } else if (overallScore >= 70) {
    return "Good effort! You're on the right track. Focus on the areas below.";
  } else if (overallScore >= 60) {
    return "Not bad! With more practice, you'll improve. Pay attention to the feedback.";
  } else {
    return "Keep trying! Pronunciation takes practice. Listen carefully and try again.";
  }
}

/**
 * Get specific tips based on which scores are lowest
 */
export function getImprovementTips(result: ComparisonResult): string[] {
  const tips: string[] = [];
  
  if (result.pitchScore < 70) {
    tips.push("🎵 Work on your pitch/tone. Listen carefully to the native pronunciation and try to match the melody of the word.");
  }
  
  if (result.energyScore < 70) {
    tips.push("💪 Pay attention to stress patterns. Some syllables should be emphasized more than others.");
  }
  
  if (result.durationScore < 70) {
    tips.push("⏱️ Adjust your timing. Try to match the speed and rhythm of the native pronunciation.");
  }
  
  if (result.timbreScore < 70) {
    tips.push("🗣️ Focus on voice quality. Try to position your tongue and mouth the same way as native speakers.");
  }
  
  if (tips.length === 0) {
    tips.push("✨ You're doing great! Keep practicing to maintain your pronunciation skills.");
  }
  
  return tips;
}
