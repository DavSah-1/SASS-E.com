import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, expect } from 'vitest';

// Cleanup after each test
afterEach(async () => {
  cleanup();
  // Note: Test data cleanup is handled by individual test files
  // using the supabaseTestHelper utilities
});

// Add custom matchers for better test assertions
expect.extend({
  toBeValidUser(received: any) {
    const pass = received?.id && received?.email;
    return {
      pass,
      message: () => `Expected valid user object with id and email`,
    };
  },
});

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {}, // deprecated
    removeListener: () => {}, // deprecated
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
