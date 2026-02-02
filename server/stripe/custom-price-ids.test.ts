import { describe, it, expect } from 'vitest';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.CUSTOM_STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY or CUSTOM_STRIPE_SECRET_KEY must be set');
}

const stripe = new Stripe(STRIPE_SECRET_KEY, { apiVersion: '2024-12-18.acacia' });

describe('Custom Stripe Price IDs', () => {
  const priceIds = [
    { key: 'CUSTOM_STRIPE_PRICE_STARTER_MONTHLY', name: 'Starter Monthly' },
    { key: 'CUSTOM_STRIPE_PRICE_STARTER_SIX_MONTH', name: 'Starter 6-Month' },
    { key: 'CUSTOM_STRIPE_PRICE_STARTER_ANNUAL', name: 'Starter Annual' },
    { key: 'CUSTOM_STRIPE_PRICE_PRO_MONTHLY', name: 'Pro Monthly' },
    { key: 'CUSTOM_STRIPE_PRICE_PRO_SIX_MONTH', name: 'Pro 6-Month' },
    { key: 'CUSTOM_STRIPE_PRICE_PRO_ANNUAL', name: 'Pro Annual' },
    { key: 'CUSTOM_STRIPE_PRICE_ULTIMATE_MONTHLY', name: 'Ultimate Monthly' },
    { key: 'CUSTOM_STRIPE_PRICE_ULTIMATE_SIX_MONTH', name: 'Ultimate 6-Month' },
    { key: 'CUSTOM_STRIPE_PRICE_ULTIMATE_ANNUAL', name: 'Ultimate Annual' },
  ];

  it('should have all 9 custom Price IDs configured', () => {
    for (const { key, name } of priceIds) {
      const priceId = process.env[key];
      expect(priceId, `${name} (${key}) should be set`).toBeDefined();
      expect(priceId, `${name} (${key}) should not be empty`).not.toBe('');
    }
  });

  it('should be able to retrieve all Price IDs from Stripe', async () => {
    const results = [];
    
    for (const { key, name } of priceIds) {
      const priceId = process.env[key];
      if (!priceId) continue;

      try {
        const price = await stripe.prices.retrieve(priceId);
        results.push({
          name,
          priceId,
          amount: price.unit_amount ? price.unit_amount / 100 : 0,
          currency: price.currency,
          interval: price.recurring?.interval,
          status: 'valid'
        });
      } catch (error) {
        results.push({
          name,
          priceId,
          status: 'invalid',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // All prices should be valid
    const invalidPrices = results.filter(r => r.status === 'invalid');
    expect(invalidPrices, `Invalid prices found: ${JSON.stringify(invalidPrices, null, 2)}`).toHaveLength(0);

    // Log valid prices for verification
    console.log('\n✓ All custom Price IDs are valid:');
    results.forEach(r => {
      if (r.status === 'valid') {
        console.log(`  ${r.name}: ${r.currency} ${r.amount} / ${r.interval}`);
      }
    });
  }, 30000); // 30 second timeout for API calls
});
