/**
 * Stripe Client Configuration
 * 
 * Initializes and exports the Stripe client for use throughout the application.
 * 
 * IMPORTANT: This code is designed to work with YOUR OWN Stripe account.
 * 
 * To migrate from Manus-provided Stripe to your own account:
 * 1. Create a Stripe account at https://stripe.com
 * 2. Get your API keys from Stripe Dashboard → Developers → API keys
 * 3. Update these environment variables in Manus Settings → Secrets:
 *    - STRIPE_SECRET_KEY (your secret key, starts with sk_test_ or sk_live_)
 *    - VITE_STRIPE_PUBLISHABLE_KEY (your publishable key, starts with pk_test_ or pk_live_)
 *    - STRIPE_WEBHOOK_SECRET (from Stripe Dashboard → Developers → Webhooks)
 * 4. Update Price IDs in server/stripe/products.ts with your product prices
 * 
 * See STRIPE_SETUP_GUIDE.md for detailed migration instructions.
 */

import Stripe from "stripe";

// Use custom Stripe keys to bypass Manus-managed Stripe integration
const STRIPE_SECRET_KEY = process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error("CUSTOM_STRIPE_SECRET_KEY or STRIPE_SECRET_KEY environment variable is not set");
}

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: "2026-01-28.clover",
});

export const STRIPE_WEBHOOK_SECRET = process.env.CUSTOM_STRIPE_WEBHOOK_SECRET || process.env.STRIPE_WEBHOOK_SECRET || "";

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn("[Stripe] STRIPE_WEBHOOK_SECRET not configured - webhook signature verification will fail");
}
