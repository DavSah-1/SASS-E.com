import { describe, it, expect } from "vitest";
import { getSupabaseDb } from "../server/supabaseDb";

describe("Supabase Database Connection", () => {
  it("should connect to Supabase database successfully", async () => {
    const db = await getSupabaseDb();
    expect(db).toBeDefined();
    expect(db).not.toBeNull();
  });

  it("should have valid database instance", async () => {
    const db = await getSupabaseDb();
    // Connection is valid if we got a non-null db instance
    expect(db).toBeTruthy();
  });
});
