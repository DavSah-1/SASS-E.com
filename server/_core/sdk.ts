import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifySupabaseToken } from "../lib/supabaseAuth";

// Utility function
const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

class SDKServer {
  private parseCookies(cookieHeader: string | undefined) {
    if (!cookieHeader) {
      return new Map<string, string>();
    }

    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  async authenticateRequest(req: Request): Promise<User> {
    // Get Supabase token from Authorization header or cookie
    const authHeader = req.headers.authorization;
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (sessionCookie) {
      token = sessionCookie;
    }

    if (!token) {
      throw ForbiddenError("Missing authentication token");
    }

    // Verify Supabase token
    const supabaseUser = await verifySupabaseToken(token);

    if (!supabaseUser) {
      throw ForbiddenError("Invalid authentication token");
    }

    const signedInAt = new Date();
    let user = await db.getUserBySupabaseId(supabaseUser.id);

    // If user not in DB, create them
    if (!user) {
      await db.upsertUser({
        supabaseId: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email || null,
        email: supabaseUser.email ?? null,
        loginMethod: supabaseUser.app_metadata?.provider ?? "email",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserBySupabaseId(supabaseUser.id);
    }

    if (!user) {
      throw ForbiddenError("User not found");
    }

    // Update last signed in
    await db.upsertUser({
      supabaseId: user.supabaseId,
      lastSignedIn: signedInAt,
    });

    return user;
  }
}

export const sdk = new SDKServer();
