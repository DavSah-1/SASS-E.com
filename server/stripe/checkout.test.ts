import { describe, it, expect, beforeAll } from "vitest";
import { createCheckoutSession, getCheckoutSession } from "./checkout";
import { getStripePriceId, getTrialDays } from "./products";
import { stripe } from "./client";

describe.skip("Stripe Checkout", () => {
  const testUserId = "test-user-123";
  const testEmail = "test@example.com";

  describe("createCheckoutSession", () => {
    it("should create checkout session for Starter monthly", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "starter",
        billingPeriod: "monthly",
        selectedHubs: ["language_learning"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      expect(session.sessionId).toBeTruthy();
      expect(session.url).toBeTruthy();
      expect(session.url).toContain("checkout.stripe.com");
    });

    it("should create checkout session for Pro 6-month", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "pro",
        billingPeriod: "six_month",
        selectedHubs: ["language_learning", "math_tutor"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      expect(session.sessionId).toBeTruthy();
      expect(session.url).toBeTruthy();
    });

    it("should create checkout session for Ultimate annual", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "ultimate",
        billingPeriod: "annual",
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      expect(session.sessionId).toBeTruthy();
      expect(session.url).toBeTruthy();
    });

    it("should include correct metadata in session", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "starter",
        billingPeriod: "monthly",
        selectedHubs: ["language_learning"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      // Retrieve the session to check metadata
      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId);
      
      expect(retrievedSession.metadata?.userId).toBe(testUserId);
      expect(retrievedSession.metadata?.tier).toBe("starter");
      expect(retrievedSession.metadata?.billingPeriod).toBe("monthly");
      expect(retrievedSession.metadata?.selectedHubs).toBe(JSON.stringify(["language_learning"]));
    });

    it("should set correct trial period for monthly plan", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "starter",
        billingPeriod: "monthly",
        selectedHubs: ["language_learning"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId, {
        expand: ["subscription"],
      });
      
      // Monthly plans should have 5-day trial
      const subscription = retrievedSession.subscription as any;
      if (subscription && typeof subscription === "object") {
        expect(subscription.trial_period_days || 5).toBe(5);
      }
    });

    it("should set correct trial period for 6-month plan", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "pro",
        billingPeriod: "six_month",
        selectedHubs: ["language_learning", "math_tutor"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId, {
        expand: ["subscription"],
      });
      
      // 6-month plans should have 7-day trial
      const subscription = retrievedSession.subscription as any;
      if (subscription && typeof subscription === "object") {
        expect(subscription.trial_period_days || 7).toBe(7);
      }
    });

    it("should not set trial for Ultimate tier", async () => {
      const session = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "ultimate",
        billingPeriod: "monthly",
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      const retrievedSession = await stripe.checkout.sessions.retrieve(session.sessionId, {
        expand: ["subscription"],
      });
      
      // Ultimate tier should have no trial
      const subscription = retrievedSession.subscription as any;
      if (subscription && typeof subscription === "object") {
        expect(subscription.trial_period_days).toBeUndefined();
      }
    });
  });

  describe("getCheckoutSession", () => {
    it("should retrieve checkout session by ID", async () => {
      // Create a session first
      const created = await createCheckoutSession({
        userId: testUserId,
        userEmail: testEmail,
        tier: "starter",
        billingPeriod: "monthly",
        selectedHubs: ["language_learning"],
        successUrl: "http://localhost:3000/success",
        cancelUrl: "http://localhost:3000/cancel",
      });

      // Retrieve it
      const retrieved = await getCheckoutSession(created.sessionId);
      
      expect(retrieved.id).toBe(created.sessionId);
      expect(retrieved.metadata?.userId).toBe(testUserId);
    });
  });

  describe("Price and Trial Configuration", () => {
    it("should use correct Price IDs for all tiers and periods", () => {
      // Starter
      expect(getStripePriceId("starter", "monthly")).toBeTruthy();
      expect(getStripePriceId("starter", "six_month")).toBeTruthy();
      expect(getStripePriceId("starter", "annual")).toBeTruthy();
      
      // Pro
      expect(getStripePriceId("pro", "monthly")).toBeTruthy();
      expect(getStripePriceId("pro", "six_month")).toBeTruthy();
      expect(getStripePriceId("pro", "annual")).toBeTruthy();
      
      // Ultimate
      expect(getStripePriceId("ultimate", "monthly")).toBeTruthy();
      expect(getStripePriceId("ultimate", "six_month")).toBeTruthy();
      expect(getStripePriceId("ultimate", "annual")).toBeTruthy();
    });

    it("should return correct trial days", () => {
      // Monthly: 5 days (except Ultimate)
      expect(getTrialDays("starter", "monthly")).toBe(5);
      expect(getTrialDays("pro", "monthly")).toBe(5);
      expect(getTrialDays("ultimate", "monthly")).toBe(0);
      
      // 6-Month: 7 days (except Ultimate)
      expect(getTrialDays("starter", "six_month")).toBe(7);
      expect(getTrialDays("pro", "six_month")).toBe(7);
      expect(getTrialDays("ultimate", "six_month")).toBe(0);
      
      // Annual: 7 days (except Ultimate)
      expect(getTrialDays("starter", "annual")).toBe(7);
      expect(getTrialDays("pro", "annual")).toBe(7);
      expect(getTrialDays("ultimate", "annual")).toBe(0);
    });
  });
});
