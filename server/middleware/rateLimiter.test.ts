import { describe, it, expect } from 'vitest';
import { apiLimiter, authLimiter, trpcLimiter, uploadLimiter } from './rateLimiter';

describe('Rate Limiter Middleware', () => {
  it('exports apiLimiter', () => {
    expect(apiLimiter).toBeDefined();
    expect(typeof apiLimiter).toBe('function');
  });

  it('exports authLimiter', () => {
    expect(authLimiter).toBeDefined();
    expect(typeof authLimiter).toBe('function');
  });

  it('exports trpcLimiter', () => {
    expect(trpcLimiter).toBeDefined();
    expect(typeof trpcLimiter).toBe('function');
  });

  it('exports uploadLimiter', () => {
    expect(uploadLimiter).toBeDefined();
    expect(typeof uploadLimiter).toBe('function');
  });
});
