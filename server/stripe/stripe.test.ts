import { describe, it, expect } from "vitest";
import Stripe from "stripe";
import { STRIPE_PRICE_IDS, getStripePriceId, getTrialDays, getPriceGBP } from "./products";

describe.skip("Stripe Integration", () => {
  it("should have all required Stripe environment variables", () => {
    expect(process.env.STRIPE_SECRET_KEY).toBeDefined();
    expect(process.env.STRIPE_WEBHOOK_SECRET).toBeDefined();
    expect(process.env.VITE_STRIPE_PUBLISHABLE_KEY).toBeDefined();
  });

  it("should have all 9 Price IDs configured", () => {
    expect(STRIPE_PRICE_IDS.starter_monthly).toBeTruthy();
    expect(STRIPE_PRICE_IDS.starter_six_month).toBeTruthy();
    expect(STRIPE_PRICE_IDS.starter_annual).toBeTruthy();
    
    expect(STRIPE_PRICE_IDS.pro_monthly).toBeTruthy();
    expect(STRIPE_PRICE_IDS.pro_six_month).toBeTruthy();
    expect(STRIPE_PRICE_IDS.pro_annual).toBeTruthy();
    
    expect(STRIPE_PRICE_IDS.ultimate_monthly).toBeTruthy();
    expect(STRIPE_PRICE_IDS.ultimate_six_month).toBeTruthy();
    expect(STRIPE_PRICE_IDS.ultimate_annual).toBeTruthy();
  });

  it("should retrieve correct Price IDs", () => {
    expect(getStripePriceId("starter", "monthly")).toBe(STRIPE_PRICE_IDS.starter_monthly);
    expect(getStripePriceId("pro", "six_month")).toBe(STRIPE_PRICE_IDS.pro_six_month);
    expect(getStripePriceId("ultimate", "annual")).toBe(STRIPE_PRICE_IDS.ultimate_annual);
  });

  it("should return correct trial days", () => {
    // Monthly plans: 5 days (except Ultimate)
    expect(getTrialDays("starter", "monthly")).toBe(5);
    expect(getTrialDays("pro", "monthly")).toBe(5);
    expect(getTrialDays("ultimate", "monthly")).toBe(0); // No trial for Ultimate
    
    // 6-Month plans: 7 days (except Ultimate)
    expect(getTrialDays("starter", "six_month")).toBe(7);
    expect(getTrialDays("pro", "six_month")).toBe(7);
    expect(getTrialDays("ultimate", "six_month")).toBe(0); // No trial for Ultimate
    
    // Annual plans: 7 days (except Ultimate)
    expect(getTrialDays("starter", "annual")).toBe(7);
    expect(getTrialDays("pro", "annual")).toBe(7);
    expect(getTrialDays("ultimate", "annual")).toBe(0); // No trial for Ultimate
  });

  it("should return correct prices in GBP", () => {
    // Starter
    expect(getPriceGBP("starter", "monthly")).toBe(7.99);
    expect(getPriceGBP("starter", "six_month")).toBe(40.31);
    expect(getPriceGBP("starter", "annual")).toBe(64.31);
    
    // Pro
    expect(getPriceGBP("pro", "monthly")).toBe(14.99);
    expect(getPriceGBP("pro", "six_month")).toBe(75.55);
    expect(getPriceGBP("pro", "annual")).toBe(120.71);
    
    // Ultimate
    expect(getPriceGBP("ultimate", "monthly")).toBe(24.99);
    expect(getPriceGBP("ultimate", "six_month")).toBe(125.95);
    expect(getPriceGBP("ultimate", "annual")).toBe(201.11);
  });

  it("should connect to Stripe API and retrieve prices", async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia",
    });

    // Test retrieving one price to verify API connection
    const priceId = STRIPE_PRICE_IDS.starter_monthly;
    const price = await stripe.prices.retrieve(priceId);

    expect(price.id).toBe(priceId);
    expect(price.currency).toBe("gbp");
    expect(price.unit_amount).toBe(799); // £7.99 in pence
    expect(price.recurring?.interval).toBe("month");
    expect(price.recurring?.trial_period_days).toBe(5);
  });

  it("should verify all 9 prices exist in Stripe", async () => {
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
      apiVersion: "2024-12-18.acacia",
    });

    const priceIds = Object.values(STRIPE_PRICE_IDS);
    
    for (const priceId of priceIds) {
      const price = await stripe.prices.retrieve(priceId);
      expect(price.id).toBe(priceId);
      expect(price.currency).toBe("gbp");
      expect(price.active).toBe(true);
    }
  }, 15000); // 15 second timeout for 9 API calls
});
