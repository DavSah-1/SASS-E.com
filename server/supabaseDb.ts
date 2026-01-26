import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { pgTable, text, timestamp, varchar, pgEnum } from "drizzle-orm/pg-core";
import { eq } from "drizzle-orm";

/**
 * Supabase Database Connection
 * This database stores all regular user accounts and their data.
 * Admin/owner accounts are stored in the Manus database.
 */

// Define the role enum for Supabase users
export const userRoleEnum = pgEnum("user_role", ["user", "admin"]);

// Define the subscription tier enum
export const subscriptionTierEnum = pgEnum("subscription_tier", [
  "free",
  "starter",
  "pro",
  "ultimate",
]);

// Supabase users table schema
export const supabaseUsers = pgTable("users", {
  id: text("id").primaryKey(), // Supabase Auth user ID
  email: varchar("email", { length: 320 }),
  name: text("name"),
  role: userRoleEnum("role").default("user").notNull(),
  subscriptionTier: subscriptionTierEnum("subscription_tier")
    .default("free")
    .notNull(),
  selectedSpecializedHubs: text("selected_specialized_hubs")
    .array()
    .default([])
    .notNull(),
  hubsSelectedAt: timestamp("hubs_selected_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in").defaultNow().notNull(),
});

export type SupabaseUser = typeof supabaseUsers.$inferSelect;
export type InsertSupabaseUser = typeof supabaseUsers.$inferInsert;

// Lazy connection to Supabase database
let _supabaseDb: ReturnType<typeof drizzle> | null = null;

export async function getSupabaseDb() {
  if (!_supabaseDb && process.env.SUPABASE_DB_URL) {
    try {
      const sql = postgres(process.env.SUPABASE_DB_URL);
      _supabaseDb = drizzle(sql);
    } catch (error) {
      console.warn("[Supabase Database] Failed to connect:", error);
      _supabaseDb = null;
    }
  }
  return _supabaseDb;
}

/**
 * Upsert a Supabase user
 */
export async function upsertSupabaseUser(
  user: InsertSupabaseUser
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot upsert user: database not available"
    );
    return;
  }

  try {
    await db
      .insert(supabaseUsers)
      .values(user)
      .onConflictDoUpdate({
        target: supabaseUsers.id,
        set: {
          email: user.email,
          name: user.name,
          lastSignedIn: user.lastSignedIn || new Date(),
          updatedAt: new Date(),
        },
      });
  } catch (error) {
    console.error("[Supabase Database] Failed to upsert user:", error);
    throw error;
  }
}

/**
 * Get a Supabase user by ID
 */
export async function getSupabaseUserById(
  id: string
): Promise<SupabaseUser | undefined> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot get user: database not available"
    );
    return undefined;
  }

  const result = await db
    .select()
    .from(supabaseUsers)
    .where(eq(supabaseUsers.id, id))
    .limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Update Supabase user's subscription tier
 */
export async function updateSupabaseUserTier(
  userId: string,
  tier: "free" | "starter" | "pro" | "ultimate"
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update tier: database not available"
    );
    return;
  }

  await db
    .update(supabaseUsers)
    .set({ subscriptionTier: tier, updatedAt: new Date() })
    .where(eq(supabaseUsers.id, userId));
}

/**
 * Update Supabase user's selected hubs
 */
export async function updateSupabaseUserHubs(
  userId: string,
  hubs: string[]
): Promise<void> {
  const db = await getSupabaseDb();
  if (!db) {
    console.warn(
      "[Supabase Database] Cannot update hubs: database not available"
    );
    return;
  }

  await db
    .update(supabaseUsers)
    .set({
      selectedSpecializedHubs: hubs,
      hubsSelectedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(eq(supabaseUsers.id, userId));
}
