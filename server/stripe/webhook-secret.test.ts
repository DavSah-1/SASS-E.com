import { describe, it, expect } from 'vitest';
import { STRIPE_WEBHOOK_SECRET } from './client';

describe('Stripe Webhook Secret Configuration', () => {
  it('should have webhook secret configured', () => {
    expect(STRIPE_WEBHOOK_SECRET).toBeDefined();
    expect(STRIPE_WEBHOOK_SECRET).not.toBe('');
    expect(STRIPE_WEBHOOK_SECRET.length).toBeGreaterThan(0);
  });

  it('should use custom webhook secret when available', () => {
    // The custom webhook secret should be used (from CUSTOM_STRIPE_WEBHOOK_SECRET)
    expect(STRIPE_WEBHOOK_SECRET).toContain('whsec_');
  });

  it('webhook secret should be valid format', () => {
    // Stripe webhook secrets start with whsec_ and are 64+ characters
    expect(STRIPE_WEBHOOK_SECRET).toMatch(/^whsec_[a-f0-9]{64,}$/);
  });
});
