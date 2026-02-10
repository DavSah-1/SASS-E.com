/**
 * Pricing configuration for SASS-E subscription tiers
 * Defines pricing, limits, and features for each tier
 */

export type SubscriptionTier = "free" | "starter" | "pro" | "ultimate";
export type SpecializedHub = "money" | "wellness" | "translation_hub" | "learning";

export interface TierLimits {
  voiceChats: number | "unlimited";
  iotDevices: number | "unlimited";
  verifiedLearning: number | "unlimited";
  translationQueries: number | "unlimited";
  imageTranslation: number | "unlimited";
  specializedHubsCount: number | "unlimited";
}

export interface CoreFeature {
  name: string;
  value: number | "unlimited" | string;
  limited?: boolean;
}

export interface HubFeature {
  name: string;
  value: string;
  included?: boolean;
  notIncluded?: boolean;
  limited?: boolean;
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
  sixMonth?: {
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
  coreFeatures: CoreFeature[];
  hubAccessHeader: string;
  hubFeatures: HubFeature[];
  additionalFeatures: HubFeature[];
  ctaButton: string;
  footnote: string;
  popular?: boolean;
}

export const SPECIALIZED_HUBS: Record<SpecializedHub, { name: string; description: string; icon: string }> = {
  money: {
    name: "Money Hub",
    description: "Budget tracking, debt coach, financial goals with AI insights",
    icon: "💰",
  },
  wellness: {
    name: "Wellness Hub",
    description: "Fitness, nutrition, mental health, and wellness tracking",
    icon: "🧘",
  },
  translation_hub: {
    name: "Translation Hub",
    description: "Real-time translation, Image OCR, conversation mode",
    icon: "🌐",
  },
  learning: {
    name: "Learning Hub",
    description: "Math tutor with step-by-step problem solving",
    icon: "🔢",
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
      voiceChats: 5,
      iotDevices: 2,
      verifiedLearning: 5,
      translationQueries: 5,
      imageTranslation: 5,
      specializedHubsCount: 0,
    },
    coreFeatures: [
      { name: "Voice Chats / Day", value: 5, limited: true },
      { name: "IoT Device Connections", value: 2, limited: true },
      { name: "Verified Learning Sessions / Day", value: 5, limited: true },
      { name: "Translation Queries / Day", value: 5, limited: true },
      { name: "Image Translation / Day", value: 5, limited: true },
    ],
    hubAccessHeader: "Premium Hubs Access: 5-day trials only",
    hubFeatures: [
      { name: "Language Hub", value: "5-day trial", limited: true },
      { name: "Learning Hub", value: "5-day trial", limited: true },
      { name: "Wellness Hub", value: "5-day trial", limited: true },
      { name: "Money Hub", value: "5-day trial", limited: true },
    ],
    additionalFeatures: [
      { name: "Hub A.I. Coach", value: "–", notIncluded: true },
      { name: "Priority Support", value: "–", notIncluded: true },
    ],
    ctaButton: "Get Started Free",
    footnote: "No credit card required • All hubs available as 5-day trials",
  },
  starter: {
    name: "Starter",
    description: "Perfect for students or single-purpose users",
    pricing: {
      monthly: { GBP: 7.99, USD: 9.99, EUR: 8.99, INR: 349, SGD: 13.99, JPY: 1380, CNY: 68, KRW: 13900 },
      sixMonth: { GBP: 34.99, USD: 49.99, EUR: 42.99, INR: 1745, SGD: 69.95, JPY: 6900, CNY: 340, KRW: 69500 },
      annual: { GBP: 59.99, USD: 79.99, EUR: 69.99, INR: 2792, SGD: 111.92, JPY: 11040, CNY: 544, KRW: 111200 },
    },
    limits: {
      voiceChats: 10,
      iotDevices: 5,
      verifiedLearning: 10,
      translationQueries: 10,
      imageTranslation: 10,
      specializedHubsCount: 1,
    },
    coreFeatures: [
      { name: "Voice Chats / Day", value: 10, limited: true },
      { name: "IoT Device Connections", value: 5, limited: true },
      { name: "Verified Learning Sessions / Day", value: 10, limited: true },
      { name: "Translation Queries / Day", value: 10, limited: true },
      { name: "Image Translation / Day", value: 10, limited: true },
    ],
    hubAccessHeader: "Premium Hubs Access: Choose 1 Hub + Trials on Others",
    hubFeatures: [
      { name: "Language Hub", value: "Available²" },
      { name: "Learning Hub", value: "Available²" },
      { name: "Wellness Hub", value: "Available²" },
      { name: "Money Hub", value: "Available²" },
    ],
    additionalFeatures: [
      { name: "Hub A.I. Coach", value: "–", notIncluded: true },
      { name: "Priority Support", value: "–", notIncluded: true },
    ],
    ctaButton: "Choose Starter",
    footnote: "²Permanently select 1 Hub for full access • Other hubs: 5-day trials (monthly), 10-day trials (6-month), 20-day trials (annual) • Upgrading users retain existing access",
  },
  pro: {
    name: "Pro",
    description: "For power users who need multiple features",
    pricing: {
      monthly: { GBP: 14.99, USD: 19.99, EUR: 16.99, INR: 699, SGD: 25.99, JPY: 2680, CNY: 128, KRW: 26800 },
      sixMonth: { GBP: 74.99, USD: 99.99, EUR: 84.99, INR: 3495, SGD: 129.95, JPY: 13400, CNY: 640, KRW: 134000 },
      annual: { GBP: 119.99, USD: 159.99, EUR: 134.99, INR: 5592, SGD: 207.92, JPY: 21440, CNY: 1024, KRW: 214400 },
    },
    limits: {
      voiceChats: "unlimited",
      iotDevices: "unlimited",
      verifiedLearning: 20,
      translationQueries: 20,
      imageTranslation: 20,
      specializedHubsCount: 2,
    },
    coreFeatures: [
      { name: "Voice Chats / Day", value: "Unlimited" },
      { name: "IoT Device Connections", value: "Unlimited" },
      { name: "Verified Learning Sessions / Day", value: 20, limited: true },
      { name: "Translation Queries / Day", value: 20, limited: true },
      { name: "Image Translation / Day", value: 20, limited: true },
    ],
    hubAccessHeader: "Premium Hubs Access: Choose 2 Hubs + Trials on Others",
    hubFeatures: [
      { name: "Language Hub", value: "Available²" },
      { name: "Learning Hub", value: "Available²" },
      { name: "Wellness Hub", value: "Available²" },
      { name: "Money Hub", value: "Available²" },
    ],
    additionalFeatures: [
      { name: "Hub A.I. Coach", value: "✓", included: true },
      { name: "Priority Support", value: "✓", included: true },
    ],
    ctaButton: "Choose Pro",
    footnote: "²Permanently select 2 Hubs for full access • Other hubs: 5-day trials (monthly), 10-day trials (6-month), 20-day trials (annual) • Upgrading users retain existing access",
    popular: true,
  },
  ultimate: {
    name: "Ultimate",
    description: "Everything unlimited - the complete SASS-E experience",
    pricing: {
      monthly: { GBP: 19.99, USD: 29.99, EUR: 24.99, INR: 999, SGD: 39.99, JPY: 3980, CNY: 198, KRW: 39800 },
      sixMonth: { GBP: 99.99, USD: 149.99, EUR: 124.99, INR: 4995, SGD: 199.95, JPY: 19900, CNY: 990, KRW: 199000 },
      annual: { GBP: 159.99, USD: 239.99, EUR: 199.99, INR: 7992, SGD: 319.92, JPY: 31840, CNY: 1584, KRW: 318400 },
    },
    limits: {
      voiceChats: "unlimited",
      iotDevices: "unlimited",
      verifiedLearning: "unlimited",
      translationQueries: "unlimited",
      imageTranslation: "unlimited",
      specializedHubsCount: "unlimited",
    },
    coreFeatures: [
      { name: "Voice Chats / Day", value: "Unlimited" },
      { name: "IoT Device Connections", value: "Unlimited" },
      { name: "Verified Learning Sessions / Day", value: "Unlimited" },
      { name: "Translation Queries / Day", value: "Unlimited" },
    ],
    hubAccessHeader: "Premium Hubs Access: All Hubs Included (Full Access)",
    hubFeatures: [
      { name: "Language Hub", value: "✓ Full Access", included: true },
      { name: "Learning Hub", value: "✓ Full Access", included: true },
      { name: "Wellness Hub", value: "✓ Full Access", included: true },
      { name: "Money Hub", value: "✓ Full Access", included: true },
    ],
    additionalFeatures: [
      { name: "Hub A.I. Coach", value: "✓", included: true },
      { name: "Priority Support", value: "✓", included: true },
    ],
    ctaButton: "Choose Ultimate",
    footnote: "All 4 hubs included • Full access to all features • Priority support included",
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
 * Get the 6-month discount percentage for a tier
 */
export function getSixMonthDiscountPercent(tier: SubscriptionTier, currency: keyof TierPricing["monthly"]): number {
  const pricing = PRICING_TIERS[tier].pricing;
  if (pricing.monthly[currency] === 0 || !pricing.sixMonth) return 0;
  const monthlyTotal = pricing.monthly[currency] * 6;
  const sixMonthPrice = pricing.sixMonth[currency];
  return Math.round(((monthlyTotal - sixMonthPrice) / monthlyTotal) * 100);
}

/**
 * Get monthly price from 6-month (for display)
 */
export function getMonthlyFromSixMonth(tier: SubscriptionTier, currency: keyof TierPricing["monthly"]): number {
  const pricing = PRICING_TIERS[tier].pricing;
  if (!pricing.sixMonth) return pricing.monthly[currency];
  return Math.round((pricing.sixMonth[currency] / 6) * 100) / 100;
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
