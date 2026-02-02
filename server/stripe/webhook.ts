/**
 * Stripe Webhook Event Handlers
 * 
 * Processes Stripe webhook events to keep subscription data in sync.
 * 
 * Key Events:
 * - checkout.session.completed: New subscription created
 * - customer.subscription.updated: Subscription changed (trial ended, renewed, etc.)
 * - customer.subscription.deleted: Subscription canceled/expired
 * - invoice.payment_succeeded: Payment successful
 * - invoice.payment_failed: Payment failed
 */

import Stripe from "stripe";
import { stripe, STRIPE_WEBHOOK_SECRET } from "./client";
import { updateSupabaseUser, upsertSupabaseUser, getSupabaseDb } from "../supabaseDb";
import { eq } from "drizzle-orm";
import { supabaseUsers } from "../supabaseDb";

/**
 * Verify and construct Stripe webhook event from raw request
 */
export function constructWebhookEvent(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error("STRIPE_WEBHOOK_SECRET is not configured");
  }

  return stripe.webhooks.constructEvent(
    payload,
    signature,
    STRIPE_WEBHOOK_SECRET
  );
}

/**
 * Main webhook event handler
 * Routes events to appropriate processors
 */
export async function handleWebhookEvent(event: Stripe.Event): Promise<void> {
  console.log(`[Stripe Webhook] Processing event: ${event.type}`);

  try {
    switch (event.type) {
      case "checkout.session.completed":
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;

      case "customer.subscription.created":
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.updated":
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case "customer.subscription.deleted":
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      case "invoice.payment_succeeded":
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case "invoice.payment_failed":
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      default:
        console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`[Stripe Webhook] Error processing ${event.type}:`, error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed
 * 
 * Triggered when a user completes checkout.
 * Creates or updates the subscription record.
 */
async function handleCheckoutSessionCompleted(
  session: any
): Promise<void> {
  console.log(`[Stripe Webhook] Checkout completed: ${session.id}`);

  const userId = session.metadata?.userId;
  const isNewUser = session.metadata?.isNewUser === "yes";
  const password = session.metadata?.password;
  const tier = session.metadata?.tier as "starter" | "pro" | "ultimate";
  const billingPeriod = session.metadata?.billingPeriod as "monthly" | "six_month" | "annual";
  const selectedHubs = session.metadata?.selectedHubs 
    ? JSON.parse(session.metadata.selectedHubs) 
    : [];
  const customerEmail = session.customer_details?.email || session.customer_email;

  if (!tier || !billingPeriod) {
    console.error("[Stripe Webhook] Missing metadata in checkout session");
    return;
  }
  
  // For new users, create Supabase account
  let finalUserId = userId;
  if (isNewUser && password && customerEmail) {
    try {
      // Import Supabase admin client
      const { createClient } = await import("@supabase/supabase-js");
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;
      
      if (!supabaseUrl || !supabaseServiceKey) {
        throw new Error("Supabase credentials not configured");
      }
      
      const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      });
      
      // Create user in Supabase Auth
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: customerEmail,
        password: password,
        email_confirm: true, // Auto-confirm email since they paid
      });
      
      if (authError) {
        console.error("[Stripe Webhook] Failed to create Supabase auth user:", authError);
        throw authError;
      }
      
      if (!authData.user) {
        throw new Error("No user returned from Supabase");
      }
      
      finalUserId = authData.user.id;
      console.log(`[Stripe Webhook] Created Supabase user: ${finalUserId}`);
      
    } catch (error) {
      console.error("[Stripe Webhook] Error creating Supabase account:", error);
      // Continue with subscription creation even if account creation fails
      // Admin can manually create account later
    }
  }
  
  if (!finalUserId) {
    console.error("[Stripe Webhook] No user ID available for subscription");
    return;
  }

  const customerId = session.customer as string;
  const subscriptionId = session.subscription as string;

  // Get subscription details to determine trial status
  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ['latest_invoice', 'customer'],
  });

  const db = await getSupabaseDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Determine trial days based on billing period
  const trialDays = billingPeriod === "monthly" ? 5 : 7;
  
  // Ultimate tier has no trial
  const effectiveTrialDays = tier === "ultimate" ? 0 : trialDays;

  // Get current period dates from subscription items
  const subscriptionItem = subscription.items?.data?.[0];
  const currentPeriodStart = subscriptionItem?.current_period_start || subscription.billing_cycle_anchor;
  const currentPeriodEnd = subscriptionItem?.current_period_end || subscription.current_period_end;
  
  // Update user record
  const updateData: any = {
    id: finalUserId,
    stripeCustomerId: customerId,
    stripeSubscriptionId: subscriptionId,
    subscriptionTier: tier,
    subscriptionStatus: subscription.status as any,
    billingPeriod: billingPeriod,
    trialDays: effectiveTrialDays,
    currentPeriodStart: currentPeriodStart ? new Date(currentPeriodStart * 1000) : null,
    currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd * 1000) : null,
    selectedSpecializedHubs: selectedHubs,
    isNewUser: "yes", // Mark as new user for trial tracking
    updatedAt: new Date(),
  };
  
  // Only include hubsSelectedAt if there are selected hubs
  if (selectedHubs.length > 0) {
    updateData.hubsSelectedAt = new Date();
  }
  
  // Use upsert to create new record or update existing one
  await upsertSupabaseUser(updateData as any);

  console.log(`[Stripe Webhook] User ${finalUserId} subscription created: ${tier} ${billingPeriod}`);
}

/**
 * Handle customer.subscription.created
 * 
 * Triggered when a subscription is created (usually after checkout).
 */
async function handleSubscriptionCreated(
  subscription: any
): Promise<void> {
  console.log(`[Stripe Webhook] Subscription created: ${subscription.id}`);

  const userId = subscription.metadata?.userId;
  if (!userId) {
    console.error("[Stripe Webhook] No userId in subscription metadata");
    return;
  }

  const tier = subscription.metadata?.tier as "starter" | "pro" | "ultimate";
  const billingPeriod = subscription.metadata?.billingPeriod as "monthly" | "six_month" | "annual";

  await updateSupabaseUser({
    id: userId,
    stripeCustomerId: subscription.customer as string,
    stripeSubscriptionId: subscription.id,
    subscriptionStatus: subscription.status as any,
    currentPeriodStart: new Date(subscription.current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    updatedAt: new Date(),
  });
}

/**
 * Handle customer.subscription.updated
 * 
 * Triggered when subscription status changes:
 * - Trial ends → active
 * - Renewal
 * - Cancellation scheduled
 * - Plan changes
 */
async function handleSubscriptionUpdated(
  subscription: any
): Promise<void> {
  console.log(`[Stripe Webhook] Subscription updated: ${subscription.id}`);

  const db = await getSupabaseDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Find user by subscription ID
  const users = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (users.length === 0) {
    console.error(`[Stripe Webhook] No user found for subscription ${subscription.id}`);
    return;
  }

  const user = users[0];

  // Check if trial just ended (status changed from trialing to active)
  const wasTrialing = user.subscriptionStatus === "trialing";
  const isNowActive = subscription.status === "active";

  if (wasTrialing && isNowActive) {
    console.log(`[Stripe Webhook] Trial ended for user ${user.id}, now active`);
    // Set isNewUser to "no" since trial has completed
    await updateSupabaseUser({
      id: user.id,
      subscriptionStatus: "active",
      isNewUser: "no",
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      updatedAt: new Date(),
    });
  } else {
    // Regular update
    await updateSupabaseUser({
      id: user.id,
      subscriptionStatus: subscription.status as any,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      cancelAtPeriodEnd: subscription.cancel_at_period_end ? user.cancelAtPeriodEnd : null,
      updatedAt: new Date(),
    });
  }
}

/**
 * Handle customer.subscription.deleted
 * 
 * Triggered when subscription is canceled or expires.
 * Downgrade user to free tier.
 */
async function handleSubscriptionDeleted(
  subscription: any
): Promise<void> {
  console.log(`[Stripe Webhook] Subscription deleted: ${subscription.id}`);

  const db = await getSupabaseDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Find user by subscription ID
  const users = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.stripeSubscriptionId, subscription.id))
    .limit(1);

  if (users.length === 0) {
    console.error(`[Stripe Webhook] No user found for subscription ${subscription.id}`);
    return;
  }

  const user = users[0];

  // Downgrade to free tier
  await updateSupabaseUser({
    id: user.id,
    subscriptionTier: "free",
    subscriptionStatus: "canceled",
    stripeSubscriptionId: null,
    cancelAtPeriodEnd: null,
    currentPeriodStart: null,
    currentPeriodEnd: null,
    updatedAt: new Date(),
  });

  console.log(`[Stripe Webhook] User ${user.id} downgraded to free tier`);
}

/**
 * Handle invoice.payment_succeeded
 * 
 * Triggered when payment succeeds (subscription renewal, etc.)
 */
async function handleInvoicePaymentSucceeded(
  invoice: any
): Promise<void> {
  console.log(`[Stripe Webhook] Payment succeeded: ${invoice.id}`);

  // Invoice subscription can be string ID or null
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  const db = await getSupabaseDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Find user by subscription ID
  const users = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (users.length === 0) {
    console.error(`[Stripe Webhook] No user found for subscription ${subscriptionId}`);
    return;
  }

  const user = users[0];

  // Get updated subscription details
  const subscription: any = await stripe.subscriptions.retrieve(subscriptionId);

  // Update subscription status and period
  await updateSupabaseUser({
    id: user.id,
    subscriptionStatus: subscription.status as any,
    currentPeriodStart: subscription.current_period_start 
      ? new Date(subscription.current_period_start * 1000) 
      : null,
    currentPeriodEnd: subscription.current_period_end 
      ? new Date(subscription.current_period_end * 1000) 
      : null,
    updatedAt: new Date(),
  });

  console.log(`[Stripe Webhook] User ${user.id} payment successful, subscription renewed`);
}

/**
 * Handle invoice.payment_failed
 * 
 * Triggered when payment fails.
 * Update subscription status to past_due.
 */
async function handleInvoicePaymentFailed(
  invoice: any
): Promise<void> {
  console.log(`[Stripe Webhook] Payment failed: ${invoice.id}`);

  // Invoice subscription can be string ID or null
  const subscriptionId = invoice.subscription as string | null;
  if (!subscriptionId) {
    return; // Not a subscription invoice
  }

  const db = await getSupabaseDb();
  if (!db) {
    throw new Error("Database connection failed");
  }

  // Find user by subscription ID
  const users = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.stripeSubscriptionId, subscriptionId))
    .limit(1);

  if (users.length === 0) {
    console.error(`[Stripe Webhook] No user found for subscription ${subscriptionId}`);
    return;
  }

  const user = users[0];

  // Update subscription status to past_due
  await updateSupabaseUser({
    id: user.id,
    subscriptionStatus: "past_due",
    updatedAt: new Date(),
  });

  console.log(`[Stripe Webhook] User ${user.id} payment failed, marked as past_due`);
}
