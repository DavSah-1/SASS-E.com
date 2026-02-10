/**
 * Specialized Hub Definitions
 * 
 * These are the AI-powered specialized hubs available for subscription tiers.
 * - Starter: Choose 1 hub
 * - Pro: Choose 2 hubs
 * - Ultimate: All hubs included
 */

export interface SpecializedHub {
  id: string;
  name: string;
  icon: string;
  description: string;
  features: string[];
}

export const SPECIALIZED_HUBS: SpecializedHub[] = [
  {
    id: "money",
    name: "Money Hub",
    icon: "💰",
    description: "Smart financial planning, budgeting, debt management, and investment guidance",
    features: [
      "Budget planning and tracking",
      "Transaction import (CSV/OFX)",
      "Debt management plans",
      "Savings goal tracking",
      "Financial health score"
    ]
  },
  {
    id: "wellness",
    name: "Wellness Hub",
    icon: "💪",
    description: "Personalized fitness, nutrition, and mental wellness guidance",
    features: [
      "Custom workout plans",
      "Nutrition tracking and advice",
      "Meditation and mindfulness",
      "Sleep optimization",
      "Stress management techniques"
    ]
  },
  {
    id: "translation_hub",
    name: "Translation Hub",
    icon: "🌍",
    description: "Real-time translation with voice support across 10+ languages",
    features: [
      "10+ languages supported",
      "Voice-to-voice translation",
      "Text translation with context",
      "Bilingual display",
      "Cultural context notes"
    ]
  },
  {
    id: "learning",
    name: "Learning Hub",
    icon: "📚",
    description: "Math tutoring, verified learning with fact-checking, and study guides",
    features: [
      "Step-by-step math problem solving",
      "Automatic fact-checking",
      "Study guide generation",
      "Interactive quizzes",
      "Source citations"
    ]
  }
];

export function getHubById(hubId: string): SpecializedHub | undefined {
  return SPECIALIZED_HUBS.find(hub => hub.id === hubId);
}

export function getHubsByIds(hubIds: string[]): SpecializedHub[] {
  return hubIds.map(id => getHubById(id)).filter(Boolean) as SpecializedHub[];
}

export function validateHubSelection(tier: string, selectedHubs: string[]): { valid: boolean; error?: string } {
  if (tier === "free") {
    return { valid: true }; // Free tier gets no hubs
  }
  
  if (tier === "starter" && selectedHubs.length !== 1) {
    return { valid: false, error: "Starter tier requires exactly 1 hub" };
  }
  
  if (tier === "pro" && selectedHubs.length !== 2) {
    return { valid: false, error: "Pro tier requires exactly 2 hubs" };
  }
  
  if (tier === "ultimate") {
    return { valid: true }; // Ultimate gets all hubs
  }
  
  // Validate hub IDs exist
  const invalidHubs = selectedHubs.filter(id => !getHubById(id));
  if (invalidHubs.length > 0) {
    return { valid: false, error: `Invalid hub IDs: ${invalidHubs.join(", ")}` };
  }
  
  return { valid: true };
}
