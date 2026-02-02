import { describe, it, expect } from "vitest";
import { stripe } from "./client";

describe("Custom Stripe Keys", () => {
  it("should connect to Stripe API with custom test keys", async () => {
    // This test verifies that the custom Stripe keys are valid
    // by making a lightweight API call to retrieve account information
    try {
      const account = await stripe.accounts.retrieve();
      
      expect(account).toBeDefined();
      expect(account.id).toBeDefined();
      
      console.log(`[Test] Successfully connected to Stripe account: ${account.id}`);
      console.log(`[Test] Account type: ${account.type}`);
      console.log(`[Test] Charges enabled: ${account.charges_enabled}`);
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Test] Failed to connect to Stripe: ${error.message}`);
        throw new Error(`Stripe API connection failed: ${error.message}`);
      }
      throw error;
    }
  });

  it("should be able to list products", async () => {
    // Verify we can list products from the Stripe account
    try {
      const products = await stripe.products.list({ limit: 5 });
      
      expect(products).toBeDefined();
      expect(products.data).toBeInstanceOf(Array);
      
      console.log(`[Test] Found ${products.data.length} products in Stripe account`);
      
    } catch (error) {
      if (error instanceof Error) {
        console.error(`[Test] Failed to list products: ${error.message}`);
        throw new Error(`Stripe products list failed: ${error.message}`);
      }
      throw error;
    }
  });
});
