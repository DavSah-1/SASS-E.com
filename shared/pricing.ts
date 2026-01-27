/**
 * Pricing configuration for SASS-E subscription tiers
 * Defines pricing, limits, and features for each tier
 */

export type SubscriptionTier = "free" | "starter" | "pro" | "ultimate";
export type SpecializedHub = "language_learning" | "math_tutor" | "science_labs" | "translation_hub" | "money_hub" | "wellness";

export interface TierLimits {
  voiceAssistant: number | "unlimited";
  iotDevices: number | "unlimited";
  verifiedLearning: number | "unlimited";
  mathTutor: number | "unlimited";
  translate: number | "unlimited";
  imageOcr: number | "unlimited";
  specializedHubsCount: number | "unlimited";
}

export interface TierPricing {
  monthly: {
    GBP: number;
    USD: number;
    EUR: number;
    INR: number;
    SGD: number;
    JPY: number;
    CNY: number;
    KRW: number;
  };
  annual: {
    GBP: number;
    USD: number;
    EUR: number;
    INR: number;
    SGD: number;
    JPY: number;
    CNY: number;
    KRW: number;
  };
}

export interface TierFeatures {
  name: string;
  description: string;
  pricing: TierPricing;
  limits: TierLimits;
  features: string[];
  hubSection?: {
    title: string;
    description: string;
  };
  ctaNote?: string;
  popular?: boolean;
}

export const SPECIALIZED_HUBS: Record<SpecializedHub, { name: string; description: string; icon: string }> = {
  language_learning: {
    name: "Language Learning",
    description: "10 languages, 3,450 vocabulary words, interactive exercises",
    icon: "🌍",
  },
  math_tutor: {
    name: "Math Tutor",
    description: "Step-by-step problem solving, 120+ practice problems",
    icon: "🔢",
  },
  science_labs: {
    name: "Science Labs",
    description: "30+ virtual experiments across Physics, Chemistry, Biology",
    icon: "🔬",
  },
  translation_hub: {
    name: "Translation Hub",
    description: "Real-time translation, Image OCR, conversation mode, phrasebook, multilingual chat",
    icon: "🌐",
  },
  money_hub: {
    name: "Money Hub",
    description: "Budget tracking, debt coach, financial goals with AI insights",
    icon: "💰",
  },
  wellness: {
    name: "Wellness Hub",
    description: "Fitness, nutrition, mental health, and wellness tracking",
    icon: "🧘",
  },
};

export const PRICING_TIERS: Record<SubscriptionTier, TierFeatures> = {
  free: {
    name: "Free",
    description: "Try SASS-E with limited daily usage",
    pricing: {
      monthly: { GBP: 0, USD: 0, EUR: 0, INR: 0, SGD: 0, JPY: 0, CNY: 0, KRW: 0 },
      annual: { GBP: 0, USD: 0, EUR: 0, INR: 0, SGD: 0, JPY: 0, CNY: 0, KRW: 0 },
    },
    limits: {
      voiceAssistant: 5,
      iotDevices: 2,
      verifiedLearning: 5,
      mathTutor: 5,
      translate: 5,
      imageOcr: 1,
      specializedHubsCount: 0,
    },
    features: [
      "5 voice assistant conversations per day",
      "Connect up to 2 IoT devices",
      "5 verified learning questions per day",
      "5 math problems per day",
      "5 translations per day",
      "1 image OCR per day",
    ],
    hubSection: {
      title: "Specialized Features",
      description: "All hubs available as a 7-day free trial",
    },
    ctaNote: "No credit card required",
  },
  starter: {
    name: "Starter",
    description: "Perfect for students or single-purpose users",
    pricing: {
      monthly: { GBP: 7.99, USD: 9.99, EUR: 8.99, INR: 349, SGD: 13.99, JPY: 1380, CNY: 68, KRW: 13900 },
      annual: { GBP: 63.92, USD: 79.92, EUR: 71.92, INR: 2792, SGD: 111.92, JPY: 11040, CNY: 544, KRW: 111200 },
    },
    limits: {
      voiceAssistant: 15,
      iotDevices: 5,
      verifiedLearning: 15,
      mathTutor: 0,
      translate: 15,
      imageOcr: 10,
      specializedHubsCount: 1,
    },
    features: [
      "15 voice assistant conversations per day",
      "Connect up to 5 IoT devices",
      "15 verified learning questions per day",
      "15 translations",
      "10 image OCR per day",
      "Choose 1 hub",
    ],
    hubSection: {
      title: "Specialized Hubs",
      description: "Choose 1 hub for permanent full access (select during signup)",
    },
  },
  pro: {
    name: "Pro",
    description: "For power users who need multiple features",
    pricing: {
      monthly: { GBP: 14.99, USD: 18.99, EUR: 16.99, INR: 699, SGD: 25.99, JPY: 2680, CNY: 128, KRW: 26800 },
      annual: { GBP: 119.92, USD: 151.92, EUR: 135.92, INR: 5592, SGD: 207.92, JPY: 21440, CNY: 1024, KRW: 214400 },
    },
    limits: {
      voiceAssistant: "unlimited",
      iotDevices: "unlimited",
      verifiedLearning: "unlimited",
      mathTutor: "unlimited",
      translate: "unlimited",
      imageOcr: "unlimited",
      specializedHubsCount: 2,
    },
    features: [
      "Unlimited voice assistant conversations",
      "Unlimited IoT device connections",
      "Unlimited verified learning",
      "Unlimited translations",
      "Unlimited image OCR",
      "Choose 2 hubs",
    ],
    hubSection: {
      title: "Specialized Hubs",
      description: "Choose 2 hubs for permanent full access (select during signup)",
    },
    popular: true,
  },
  ultimate: {
    name: "Ultimate",
    description: "Everything unlimited - the complete SASS-E experience",
    pricing: {
      monthly: { GBP: 24.99, USD: 29.99, EUR: 27.99, INR: 999, SGD: 39.99, JPY: 3980, CNY: 198, KRW: 39800 },
      annual: { GBP: 199.92, USD: 239.92, EUR: 223.92, INR: 7992, SGD: 319.92, JPY: 31840, CNY: 1584, KRW: 318400 },
    },
    limits: {
      voiceAssistant: "unlimited",
      iotDevices: "unlimited",
      verifiedLearning: "unlimited",
      mathTutor: "unlimited",
      translate: "unlimited",
      imageOcr: "unlimited",
      specializedHubsCount: "unlimited",
    },
    features: [
      "Everything in Pro plan included",
      "All hubs included",
      "Priority customer support",
      "Early access to new features",
    ],
    hubSection: {
      title: "All Hubs Included",
      description: "• Language Learning (10 languages)\n• Math Tutor (full curriculum)\n• Science Labs (30+ experiments)\n• Translation Hub (full features)\n• Money Hub (budget, debt, goals)\n• Wellness Hub (fitness, nutrition, mental)",
    },
  },
};

/**
 * Get the annual discount percentage for a tier
 */
export function getAnnualDiscountPercent(tier: SubscriptionTier, currency: keyof TierPricing["monthly"]): number {
  const pricing = PRICING_TIERS[tier].pricing;
  if (pricing.monthly[currency] === 0) return 0;
  const monthlyTotal = pricing.monthly[currency] * 12;
  const annualPrice = pricing.annual[currency];
  return Math.round(((monthlyTotal - annualPrice) / monthlyTotal) * 100);
}

/**
 * Get monthly price from annual (for display)
 */
export function getMonthlyFromAnnual(tier: SubscriptionTier, currency: keyof TierPricing["monthly"]): number {
  return Math.round((PRICING_TIERS[tier].pricing.annual[currency] / 12) * 100) / 100;
}

/**
 * Check if a user has access to a specialized hub
 */
export function hasAccessToHub(
  tier: SubscriptionTier,
  selectedHubs: SpecializedHub[],
  hubToCheck: SpecializedHub
): boolean {
  if (tier === "free") return false;
  if (tier === "ultimate") return true;
  return selectedHubs.includes(hubToCheck);
}

/**
 * Check if a user can add more specialized hubs
 */
export function canAddMoreHubs(tier: SubscriptionTier, currentHubsCount: number): boolean {
  const limit = PRICING_TIERS[tier].limits.specializedHubsCount;
  if (limit === "unlimited") return true;
  return currentHubsCount < limit;
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    GBP: "£",
    USD: "$",
    EUR: "€",
    INR: "₹",
    SGD: "S$",
    JPY: "¥",
    CNY: "¥",
    KRW: "₩",
  };
  return symbols[currency] || currency;
}
