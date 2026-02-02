/**
 * Test webhook handler with proper new user flow
 * Simulates: Sign-up → Payment → Webhook → Supabase user creation
 */

import { config } from "dotenv";
config();

// Mock checkout session for a NEW USER (no userId in metadata)
const mockCheckoutSession = {
  id: "cs_test_new_user_flow",
  object: "checkout.session",
  customer: "cus_test_new_user",
  customer_details: {
    email: "test-1770059116@example.com",
  },
  customer_email: "test-1770059116@example.com",
  subscription: "sub_test_new_user",
  metadata: {
    // NO userId - this is a new user!
    isNewUser: "yes",
    password: "Test123456",
    tier: "starter",
    billingPeriod: "monthly",
    selectedHubs: JSON.stringify(["language_learning"]),
  },
};

// Mock subscription object
const mockSubscription = {
  id: "sub_test_new_user",
  object: "subscription",
  customer: "cus_test_new_user",
  status: "trialing",
  trial_start: Math.floor(Date.now() / 1000),
  trial_end: Math.floor(Date.now() / 1000) + (5 * 24 * 60 * 60), // 5 days from now
  items: {
    data: [{
      price: {
        id: "price_test",
        recurring: {
          interval: "month",
        },
      },
      subscription: "sub_test_new_user",
    }],
  },
  current_period_start: Math.floor(Date.now() / 1000),
  current_period_end: Math.floor(Date.now() / 1000) + (30 * 24 * 60 * 60), // 30 days from now
};

// Mock Stripe client
const mockStripe = {
  subscriptions: {
    retrieve: async (id, options) => {
      console.log(`[Mock Stripe] Retrieving subscription: ${id}`);
      return mockSubscription;
    },
  },
};

// Mock the stripe client module
const originalStripe = await import("./server/stripe/client.js");
originalStripe.stripe.subscriptions = mockStripe.subscriptions;

// Import webhook handler
const { handleWebhookEvent } = await import("./server/stripe/webhook.js");

console.log("=== Testing New User Webhook Flow ===\n");
console.log("Checkout Session:");
console.log(JSON.stringify(mockCheckoutSession, null, 2));
console.log("\n");

try {
  // Simulate webhook event
  const event = {
    type: "checkout.session.completed",
    data: {
      object: mockCheckoutSession,
    },
  };

  console.log("Processing webhook event...\n");
  await handleWebhookEvent(event);

  console.log("\n✅ Webhook processed successfully!");
  console.log("\nNow checking Supabase for the created user...\n");

  // Check if user was created in Supabase
  const { createClient } = await import("@supabase/supabase-js");
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // Query by email
  const { data: users, error } = await supabaseAdmin
    .from("users")
    .select("*")
    .eq("email", "test-1770059116@example.com")
    .order("created_at", { ascending: false })
    .limit(1);

  if (error) {
    console.error("❌ Error querying Supabase:", error);
  } else if (users && users.length > 0) {
    console.log("✅ User found in Supabase!");
    console.log("\nUser Details:");
    console.log(`  ID: ${users[0].id}`);
    console.log(`  Email: ${users[0].email}`);
    console.log(`  Subscription Tier: ${users[0].subscription_tier}`);
    console.log(`  Billing Period: ${users[0].billing_period}`);
    console.log(`  Subscription Status: ${users[0].subscription_status}`);
    console.log(`  Stripe Customer ID: ${users[0].stripe_customer_id}`);
    console.log(`  Stripe Subscription ID: ${users[0].stripe_subscription_id}`);
    console.log(`  Selected Hubs: ${users[0].selected_specialized_hubs}`);
    console.log(`  Trial Days: ${users[0].trial_days}`);
    console.log(`  Created At: ${users[0].created_at}`);
  } else {
    console.log("❌ User NOT found in Supabase");
    console.log("This means the webhook did not create the user successfully.");
  }

} catch (error) {
  console.error("\n❌ Error during webhook processing:");
  console.error(error);
  process.exit(1);
}
