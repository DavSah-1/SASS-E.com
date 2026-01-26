import { describe, it, expect } from "vitest";
import { getDb } from "./db";
import { getSupabaseDb, getSupabaseUserById } from "./supabaseDb";

describe("Dual Authentication Routing", () => {
  it("should connect to Manus database", async () => {
    const db = await getDb();
    expect(db).toBeDefined();
    console.log("✓ Manus database connection successful");
  });

  it("should connect to Supabase database", async () => {
    const db = await getSupabaseDb();
    expect(db).toBeDefined();
    console.log("✓ Supabase database connection successful");
  });

  it("should verify databases are separate", async () => {
    const manusDb = await getDb();
    const supabaseDb = await getSupabaseDb();
    
    // They should be different database instances
    expect(manusDb).not.toBe(supabaseDb);
    console.log("✓ Databases are isolated");
  });

  it("should verify Supabase user functions work", async () => {
    // Try to get a non-existent user (should return undefined)
    // Use a valid UUID format
    const user = await getSupabaseUserById("00000000-0000-0000-0000-000000000000");
    expect(user).toBeUndefined();
    console.log("✓ Supabase user lookup functions correctly");
  });
});
