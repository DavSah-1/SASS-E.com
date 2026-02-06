/**
 * Level-based progression system for Learn Finance
 * Users progress through 9 levels based on their learning achievements
 */

export interface Level {
  id: number;
  name: string;
  emoji: string;
  minProgress: number; // Minimum overall progress percentage to reach this level
  description: string;
}

export const LEVELS: Level[] = [
  {
    id: 1,
    name: "Crap",
    emoji: "💩",
    minProgress: 0,
    description: "Just starting out. Everyone begins somewhere!"
  },
  {
    id: 2,
    name: "Mud",
    emoji: "🟤",
    minProgress: 10,
    description: "Making progress, slowly but surely."
  },
  {
    id: 3,
    name: "Wood",
    emoji: "🪵",
    minProgress: 20,
    description: "Building a foundation of financial knowledge."
  },
  {
    id: 4,
    name: "Stone",
    emoji: "🪨",
    minProgress: 35,
    description: "Solid understanding of the basics."
  },
  {
    id: 5,
    name: "Copper",
    emoji: "🟠",
    minProgress: 50,
    description: "Halfway there! Keep pushing forward."
  },
  {
    id: 6,
    name: "Bronze",
    emoji: "🥉",
    minProgress: 65,
    description: "Strong financial literacy emerging."
  },
  {
    id: 7,
    name: "Silver",
    emoji: "🥈",
    minProgress: 80,
    description: "Excellent progress! You're nearly a master."
  },
  {
    id: 8,
    name: "Gold",
    emoji: "🥇",
    minProgress: 90,
    description: "Outstanding! Financial wisdom achieved."
  },
  {
    id: 9,
    name: "Platinum",
    emoji: "💎",
    minProgress: 100,
    description: "Perfect mastery! You've conquered all tiers."
  }
];

/**
 * Calculate user's current level based on overall progress percentage
 */
export function getUserLevel(progressPercentage: number): Level {
  // Find the highest level the user has reached
  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (progressPercentage >= LEVELS[i].minProgress) {
      return LEVELS[i];
    }
  }
  // Default to first level if somehow no match
  return LEVELS[0];
}

/**
 * Get the next level for the user
 */
export function getNextLevel(currentLevel: Level): Level | null {
  const currentIndex = LEVELS.findIndex(l => l.id === currentLevel.id);
  if (currentIndex < LEVELS.length - 1) {
    return LEVELS[currentIndex + 1];
  }
  return null; // Already at max level
}

/**
 * Calculate progress to next level (0-100)
 */
export function getProgressToNextLevel(progressPercentage: number, currentLevel: Level): number {
  const nextLevel = getNextLevel(currentLevel);
  if (!nextLevel) {
    return 100; // Already at max level
  }
  
  const currentMin = currentLevel.minProgress;
  const nextMin = nextLevel.minProgress;
  const range = nextMin - currentMin;
  const progress = progressPercentage - currentMin;
  
  return Math.min(100, Math.max(0, (progress / range) * 100));
}
