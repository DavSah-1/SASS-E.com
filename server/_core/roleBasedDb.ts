import { getDb as getManusDb } from "../db";
import { getSupabaseClient, getSupabaseAdminClient } from "../supabaseClient";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { MySql2Database } from "drizzle-orm/mysql2";

/**
 * Role-Based Database Wrapper
 * 
 * This module provides intelligent database routing based on user role:
 * - Admin users → Manus MySQL (Drizzle ORM)
 * - Regular users → Supabase PostgreSQL (with RLS enforcement)
 * 
 * This ensures:
 * 1. Admin data stays in Manus MySQL
 * 2. User data goes to Supabase with RLS protection
 * 3. Complete data isolation between users
 * 4. Single source of truth for database operations
 */

export type UserRole = "admin" | "user";

export interface DatabaseContext {
  userId: string;
  role: UserRole;
  accessToken?: string;
}

export type DatabaseClient = 
  | { type: "manus"; client: Awaited<ReturnType<typeof getManusDb>> | null }
  | { type: "supabase"; client: SupabaseClient };

/**
 * Get the appropriate database client based on user role
 * 
 * @param context - User context containing role and authentication info
 * @returns Database client (Manus MySQL for admin, Supabase for users)
 */
export async function getDbClient(context: DatabaseContext): Promise<DatabaseClient> {
  if (context.role === "admin") {
    // Admin users use Manus MySQL
    const client = await getManusDb();
    return { type: "manus", client };
  } else {
    // Regular users use Supabase with RLS enforcement
    const client = await getSupabaseClient(context.userId, context.accessToken);
    return { type: "supabase", client };
  }
}

/**
 * Get admin database client (bypasses RLS)
 * 
 * Use ONLY for:
 * - System operations (user creation, webhooks)
 * - Admin-only features
 * - Data migrations
 * 
 * DO NOT use for user-facing operations!
 */
export function getAdminDbClient(): DatabaseClient {
  const client = getSupabaseAdminClient();
  return { type: "supabase", client };
}

/**
 * Helper to check if client is Supabase
 */
export function isSupabaseClient(client: DatabaseClient): client is { type: "supabase"; client: SupabaseClient } {
  return client.type === "supabase";
}

/**
 * Helper to check if client is Manus
 */
export function isManusClient(client: DatabaseClient): client is { type: "manus"; client: Awaited<ReturnType<typeof getManusDb>> | null } {
  return client.type === "manus";
}

/**
 * Create database context from tRPC context
 * 
 * @param ctx - tRPC context with user and accessToken
 * @returns Database context for routing
 */
export function createDbContext(ctx: { user: any; accessToken?: string }): DatabaseContext {
  if (!ctx.user) {
    throw new Error("User context required for database operations");
  }

  return {
    userId: String(ctx.user.id),
    role: ctx.user.role === "admin" ? "admin" : "user",
    accessToken: ctx.accessToken,
  };
}

/**
 * Execute a database operation with automatic routing
 * 
 * @param context - Database context
 * @param operation - Function that performs the database operation
 * @returns Result of the operation
 * 
 * @example
 * ```typescript
 * const result = await executeDbOperation(
 *   createDbContext(ctx),
 *   async (client) => {
 *     if (isSupabaseClient(client)) {
 *       const { data } = await client.client
 *         .from('conversations')
 *         .select('*');
 *       return data;
 *     } else {
 *       return await client.client
 *         .select()
 *         .from(conversations);
 *     }
 *   }
 * );
 * ```
 */
export async function executeDbOperation<T>(
  context: DatabaseContext,
  operation: (client: DatabaseClient) => Promise<T>
): Promise<T> {
  const client = await getDbClient(context);
  return await operation(client);
}
