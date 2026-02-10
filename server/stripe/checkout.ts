/**
 * Stripe Checkout Session Management
 * 
 * Handles creation of Stripe Checkout sessions for subscription purchases.
 */

import { stripe } from "./client";
import { getStripePriceId, getTrialDays } from "./products";

export interface CreateCheckoutSessionParams {
  userId?: string; // Optional for unauthenticated users
  userEmail: string;
  tier: "starter" | "pro" | "ultimate";
  billingPeriod: "monthly" | "six_month" | "annual";
  selectedHubs?: string[];
  password?: string; // For creating account after payment
  successUrl: string;
  cancelUrl: string;
  uiMode?: "hosted" | "embedded"; // Default: hosted (redirect), embedded (in-app modal)
}

/**
 * Create a Stripe Checkout Session for subscription purchase
 * 
 * This function:
 * 1. Gets the correct Stripe Price ID for the tier/billing period
 * 2. Determines trial period based on billing period (5 or 7 days)
 * 3. Creates a Checkout Session with trial enabled
 * 4. Stores metadata for webhook processing
 * 
 * @returns Checkout Session with URL for redirect
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<{ sessionId: string; url?: string; clientSecret?: string }> {
  const { userId, userEmail, tier, billingPeriod, selectedHubs, password, successUrl, cancelUrl, uiMode = "hosted" } = params;

  // Get the Stripe Price ID for this tier/period combination
  const priceId = getStripePriceId(tier, billingPeriod);
  
  // Get trial days (5 for monthly, 7 for 6-month/annual, 0 for Ultimate)
  const trialDays = getTrialDays(tier, billingPeriod);

  // Prepare metadata for webhook processing
  const metadata: Record<string, string> = {
    tier,
    billingPeriod,
    isNewUser: userId ? "no" : "yes", // New user if no userId provided
  };
  
  // Add userId if authenticated
  if (userId) {
    metadata.userId = userId;
  }
  
  // Add password for account creation (will be encrypted by Stripe)
  if (password) {
    metadata.password = password;
  }

  // Add selected hubs to metadata if provided
  if (selectedHubs && selectedHubs.length > 0) {
    metadata.selectedHubs = JSON.stringify(selectedHubs);
  }

  // Create the Checkout Session
  const sessionConfig: any = {
    mode: "subscription",
    customer_email: userEmail,
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    subscription_data: {
      trial_period_days: trialDays > 0 ? trialDays : undefined,
      metadata,
    },
    metadata,
    allow_promotion_codes: true,
    billing_address_collection: "auto",
  };
  
  // Add UI mode specific config
  if (uiMode === "embedded") {
    sessionConfig.ui_mode = "embedded";
    sessionConfig.return_url = successUrl; // Embedded mode uses return_url instead of success_url/cancel_url
  } else {
    sessionConfig.success_url = successUrl;
    sessionConfig.cancel_url = cancelUrl;
  }
  
  const session = await stripe.checkout.sessions.create(sessionConfig);

  // For embedded mode, return clientSecret; for hosted mode, return URL
  if (uiMode === "embedded") {
    if (!session.client_secret) {
      throw new Error("Failed to create embedded checkout session: no client secret returned");
    }
    return {
      sessionId: session.id,
      clientSecret: session.client_secret,
    };
  } else {
    if (!session.url) {
      throw new Error("Failed to create checkout session: no URL returned");
    }
    return {
      sessionId: session.id,
      url: session.url,
    };
  }
}

/**
 * Retrieve a Checkout Session by ID
 */
export async function getCheckoutSession(sessionId: string) {
  return await stripe.checkout.sessions.retrieve(sessionId, {
    expand: ["subscription", "customer"],
  });
}

/**
 * Create a Customer Portal session for subscription management
 * 
 * This allows users to:
 * - Update payment methods
 * - View invoices
 * - Cancel subscriptions
 * 
 * @param customerId - Stripe Customer ID
 * @param returnUrl - URL to return to after portal session
 */
export async function createPortalSession(
  customerId: string,
  returnUrl: string
): Promise<{ url: string }> {
  const session = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: returnUrl,
  });

  return {
    url: session.url,
  };
}
