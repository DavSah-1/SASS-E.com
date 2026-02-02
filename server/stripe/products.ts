/**
 * Stripe Products and Prices Configuration
 * 
 * This file defines all subscription products and their pricing for the SASS-E application.
 * 
 * Pricing Structure:
 * - Monthly: Base price
 * - 6-Month: 16% discount (multiply by 0.84, then by 6)
 * - Annual: 33% discount (multiply by 0.67, then by 12)
 * 
 * Trial Periods:
 * - Monthly plans: 5-day trial
 * - 6-Month & Annual plans: 7-day trial
 * - Ultimate tier: No trial (immediate access)
 */

export const STRIPE_PRODUCTS = {
  starter: {
    name: "Starter",
    description: "Perfect for individuals getting started with AI assistance",
    monthly: {
      priceGBP: 7.99,
      interval: "month" as const,
      trialDays: 5,
    },
    sixMonth: {
      priceGBP: 40.31, // 7.99 × 6 × 0.84 = 40.3056
      interval: "month" as const,
      intervalCount: 6,
      trialDays: 7,
    },
    annual: {
      priceGBP: 64.31, // 7.99 × 12 × 0.67 = 64.3116
      interval: "year" as const,
      trialDays: 7,
    },
  },
  pro: {
    name: "Pro",
    description: "Advanced features for power users",
    monthly: {
      priceGBP: 14.99,
      interval: "month" as const,
      trialDays: 5,
    },
    sixMonth: {
      priceGBP: 75.55, // 14.99 × 6 × 0.84 = 75.5496
      interval: "month" as const,
      intervalCount: 6,
      trialDays: 7,
    },
    annual: {
      priceGBP: 120.71, // 14.99 × 12 × 0.67 = 120.7116
      interval: "year" as const,
      trialDays: 7,
    },
  },
  ultimate: {
    name: "Ultimate",
    description: "Complete access to all features and hubs",
    monthly: {
      priceGBP: 24.99,
      interval: "month" as const,
      trialDays: 0, // No trial for Ultimate
    },
    sixMonth: {
      priceGBP: 125.95, // 24.99 × 6 × 0.84 = 125.9496
      interval: "month" as const,
      intervalCount: 6,
      trialDays: 0, // No trial for Ultimate
    },
    annual: {
      priceGBP: 201.11, // 24.99 × 12 × 0.67 = 201.1116
      interval: "year" as const,
      trialDays: 0, // No trial for Ultimate
    },
  },
} as const;

/**
 * Stripe Price IDs
 * 
 * IMPORTANT: When migrating to your own Stripe account, you need to:
 * 
 * 1. Create products and prices in your Stripe Dashboard
 * 2. Copy the Price IDs (format: price_XXXXXXXXXXXXXXXXXXXXXXXX)
 * 3. Add them as environment variables in Manus Settings → Secrets:
 *    - STRIPE_PRICE_STARTER_MONTHLY
 *    - STRIPE_PRICE_STARTER_SIX_MONTH
 *    - STRIPE_PRICE_STARTER_ANNUAL
 *    - STRIPE_PRICE_PRO_MONTHLY
 *    - STRIPE_PRICE_PRO_SIX_MONTH
 *    - STRIPE_PRICE_PRO_ANNUAL
 *    - STRIPE_PRICE_ULTIMATE_MONTHLY
 *    - STRIPE_PRICE_ULTIMATE_SIX_MONTH
 *    - STRIPE_PRICE_ULTIMATE_ANNUAL
 * 
 * See STRIPE_SETUP_GUIDE.md for detailed instructions on creating products.
 * 
 * Pricing Reference (from STRIPE_PRODUCTS above):
 * - Starter: £7.99/mo, £40.31/6mo, £64.31/yr
 * - Pro: £14.99/mo, £75.55/6mo, £120.71/yr
 * - Ultimate: £24.99/mo, £125.95/6mo, £201.11/yr
 */
export const STRIPE_PRICE_IDS = {
  starter_monthly: process.env.CUSTOM_STRIPE_PRICE_STARTER_MONTHLY || process.env.STRIPE_PRICE_STARTER_MONTHLY || "",
  starter_six_month: process.env.CUSTOM_STRIPE_PRICE_STARTER_SIX_MONTH || process.env.STRIPE_PRICE_STARTER_SIX_MONTH || "",
  starter_annual: process.env.CUSTOM_STRIPE_PRICE_STARTER_ANNUAL || process.env.STRIPE_PRICE_STARTER_ANNUAL || "",
  
  pro_monthly: process.env.CUSTOM_STRIPE_PRICE_PRO_MONTHLY || process.env.STRIPE_PRICE_PRO_MONTHLY || "",
  pro_six_month: process.env.CUSTOM_STRIPE_PRICE_PRO_SIX_MONTH || process.env.STRIPE_PRICE_PRO_SIX_MONTH || "",
  pro_annual: process.env.CUSTOM_STRIPE_PRICE_PRO_ANNUAL || process.env.STRIPE_PRICE_PRO_ANNUAL || "",
  
  ultimate_monthly: process.env.CUSTOM_STRIPE_PRICE_ULTIMATE_MONTHLY || process.env.STRIPE_PRICE_ULTIMATE_MONTHLY || "",
  ultimate_six_month: process.env.CUSTOM_STRIPE_PRICE_ULTIMATE_SIX_MONTH || process.env.STRIPE_PRICE_ULTIMATE_SIX_MONTH || "",
  ultimate_annual: process.env.CUSTOM_STRIPE_PRICE_ULTIMATE_ANNUAL || process.env.STRIPE_PRICE_ULTIMATE_ANNUAL || "",
} as const;

/**
 * Get Stripe Price ID for a tier and billing period
 */
export function getStripePriceId(
  tier: "starter" | "pro" | "ultimate",
  billingPeriod: "monthly" | "six_month" | "annual"
): string {
  const key = `${tier}_${billingPeriod}` as keyof typeof STRIPE_PRICE_IDS;
  const priceId = STRIPE_PRICE_IDS[key];
  
  if (!priceId) {
    throw new Error(`Stripe Price ID not configured for ${tier} ${billingPeriod}`);
  }
  
  return priceId;
}

/**
 * Get trial days for a tier and billing period
 */
export function getTrialDays(
  tier: "starter" | "pro" | "ultimate",
  billingPeriod: "monthly" | "six_month" | "annual"
): number {
  const product = STRIPE_PRODUCTS[tier];
  
  if (billingPeriod === "monthly") {
    return product.monthly.trialDays;
  } else if (billingPeriod === "six_month") {
    return product.sixMonth.trialDays;
  } else {
    return product.annual.trialDays;
  }
}

/**
 * Get price in GBP for a tier and billing period
 */
export function getPriceGBP(
  tier: "starter" | "pro" | "ultimate",
  billingPeriod: "monthly" | "six_month" | "annual"
): number {
  const product = STRIPE_PRODUCTS[tier];
  
  if (billingPeriod === "monthly") {
    return product.monthly.priceGBP;
  } else if (billingPeriod === "six_month") {
    return product.sixMonth.priceGBP;
  } else {
    return product.annual.priceGBP;
  }
}
