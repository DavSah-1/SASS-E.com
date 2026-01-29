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
    id: "language_learning",
    name: "Language Learning",
    icon: "🌍",
    description: "Master any language with AI-powered lessons, vocabulary building, and pronunciation practice",
    features: [
      "10+ languages supported",
      "Vocabulary flashcards with spaced repetition",
      "Grammar explanations with examples",
      "Interactive exercises and quizzes",
      "Progress tracking and achievements"
    ]
  },
  {
    id: "math_tutor",
    name: "Math Tutor",
    icon: "🔢",
    description: "Get step-by-step math help from algebra to calculus with verified explanations",
    features: [
      "Step-by-step problem solving",
      "Visual explanations with diagrams",
      "Practice problems generator",
      "Concept explanations",
      "Homework help"
    ]
  },
  {
    id: "wellness_coach",
    name: "Wellness Coach",
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
    id: "money_advisor",
    name: "Money Advisor",
    icon: "💰",
    description: "Smart financial planning, budgeting, and investment guidance",
    features: [
      "Budget planning and tracking",
      "Investment strategy advice",
      "Debt management plans",
      "Savings goal tracking",
      "Financial literacy education"
    ]
  },
  {
    id: "career_mentor",
    name: "Career Mentor",
    icon: "💼",
    description: "Resume building, interview prep, and career advancement strategies",
    features: [
      "Resume and cover letter review",
      "Interview preparation",
      "Career path planning",
      "Salary negotiation tips",
      "Professional networking advice"
    ]
  },
  {
    id: "creative_writing",
    name: "Creative Writing",
    icon: "✍️",
    description: "Enhance your writing with AI-powered feedback, brainstorming, and editing",
    features: [
      "Story and plot development",
      "Character creation assistance",
      "Grammar and style feedback",
      "Writer's block solutions",
      "Genre-specific guidance"
    ]
  },
  {
    id: "coding_assistant",
    name: "Coding Assistant",
    icon: "💻",
    description: "Debug code, learn programming concepts, and get project guidance",
    features: [
      "Code debugging and optimization",
      "Algorithm explanations",
      "Best practices guidance",
      "Project architecture advice",
      "Multiple language support"
    ]
  },
  {
    id: "study_companion",
    name: "Study Companion",
    icon: "📚",
    description: "Verified learning with fact-checking, study guides, and quiz generation",
    features: [
      "Automatic fact-checking",
      "Study guide generation",
      "Interactive quizzes",
      "Source citations",
      "Learning progress tracking"
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
