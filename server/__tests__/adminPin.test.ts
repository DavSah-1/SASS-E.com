import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";

describe("Admin PIN Configuration", () => {
  it("should have ADMIN_PIN_HASH environment variable set", () => {
    expect(process.env.ADMIN_PIN_HASH).toBeDefined();
    expect(process.env.ADMIN_PIN_HASH).not.toBe("");
  });

  it("should be a valid bcrypt hash", () => {
    const encodedHash = process.env.ADMIN_PIN_HASH;
    expect(encodedHash).toBeDefined();
    
    // Decode base64 to get actual bcrypt hash
    const hash = Buffer.from(encodedHash!, 'base64').toString('utf-8');
    
    // Bcrypt hashes start with $2a$, $2b$, or $2y$ and are 60 characters long
    expect(hash).toMatch(/^\$2[aby]\$\d{2}\$.+$/);
  });

  it("should be able to validate a PIN against the hash", async () => {
    const encodedHash = process.env.ADMIN_PIN_HASH;
    expect(encodedHash).toBeDefined();
    
    // Decode base64 to get actual bcrypt hash
    const hash = Buffer.from(encodedHash!, 'base64').toString('utf-8');

    // Test that bcrypt.compare works with the hash
    // We don't know the actual PIN, so we just test that the function doesn't throw
    const testResult = await bcrypt.compare("0000000000", hash);
    expect(typeof testResult).toBe("boolean");
  });
});
