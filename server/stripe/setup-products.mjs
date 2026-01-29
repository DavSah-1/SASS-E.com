#!/usr/bin/env node
/**
 * Setup Stripe Products and Prices
 * 
 * This script creates all necessary products and prices in Stripe.
 * Run once to initialize the Stripe catalog.
 * 
 * Usage: pnpm tsx server/stripe/setup-products.mjs
 */

import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2024-12-18.acacia",
});

const PRODUCTS_CONFIG = {
  starter: {
    name: "Starter",
    description: "Perfect for individuals getting started with AI assistance",
    prices: [
      { amount: 799, interval: "month", intervalCount: 1, trialDays: 5, nickname: "Monthly" },
      { amount: 4031, interval: "month", intervalCount: 6, trialDays: 7, nickname: "6-Month (16% off)" },
      { amount: 6431, interval: "year", intervalCount: 1, trialDays: 7, nickname: "Annual (33% off)" },
    ],
  },
  pro: {
    name: "Pro",
    description: "Advanced features for power users",
    prices: [
      { amount: 1499, interval: "month", intervalCount: 1, trialDays: 5, nickname: "Monthly" },
      { amount: 7555, interval: "month", intervalCount: 6, trialDays: 7, nickname: "6-Month (16% off)" },
      { amount: 12071, interval: "year", intervalCount: 1, trialDays: 7, nickname: "Annual (33% off)" },
    ],
  },
  ultimate: {
    name: "Ultimate",
    description: "Complete access to all features and hubs",
    prices: [
      { amount: 2499, interval: "month", intervalCount: 1, trialDays: 0, nickname: "Monthly" },
      { amount: 12595, interval: "month", intervalCount: 6, trialDays: 0, nickname: "6-Month (16% off)" },
      { amount: 20111, interval: "year", intervalCount: 1, trialDays: 0, nickname: "Annual (33% off)" },
    ],
  },
};

async function setupProducts() {
  console.log("🚀 Setting up Stripe products and prices...\n");

  const envVars = [];

  for (const [tier, config] of Object.entries(PRODUCTS_CONFIG)) {
    console.log(`📦 Creating product: ${config.name}`);

    // Create product
    const product = await stripe.products.create({
      name: config.name,
      description: config.description,
      metadata: {
        tier: tier,
      },
    });

    console.log(`   ✓ Product created: ${product.id}`);

    // Create prices for this product
    for (const priceConfig of config.prices) {
      const price = await stripe.prices.create({
        product: product.id,
        currency: "gbp",
        unit_amount: priceConfig.amount,
        recurring: {
          interval: priceConfig.interval,
          interval_count: priceConfig.intervalCount,
          trial_period_days: priceConfig.trialDays > 0 ? priceConfig.trialDays : undefined,
        },
        nickname: priceConfig.nickname,
        metadata: {
          tier: tier,
          billing_period: priceConfig.intervalCount === 6 ? "six_month" : priceConfig.interval === "year" ? "annual" : "monthly",
          trial_days: priceConfig.trialDays.toString(),
        },
      });

      const billingPeriod = priceConfig.intervalCount === 6 ? "six_month" : priceConfig.interval === "year" ? "annual" : "monthly";
      const envVarName = `STRIPE_PRICE_${tier.toUpperCase()}_${billingPeriod.toUpperCase()}`;
      
      console.log(`   ✓ Price created: ${price.id} (${priceConfig.nickname})`);
      envVars.push(`${envVarName}=${price.id}`);
    }

    console.log("");
  }

  console.log("✅ All products and prices created successfully!\n");
  console.log("📋 Add these environment variables to your .env file or Manus Settings → Secrets:\n");
  console.log(envVars.join("\n"));
  console.log("\n💡 Tip: You can also view and manage these in the Stripe Dashboard → Products");
}

setupProducts().catch((error) => {
  console.error("❌ Error setting up products:", error);
  process.exit(1);
});
