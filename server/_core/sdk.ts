import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { jwtVerify, SignJWT } from "jose";
import * as db from "../db";
import { getSupabaseUserById, upsertSupabaseUser } from "../supabaseDb";
import { verifySupabaseToken } from "../lib/supabaseAuth";
import { ENV } from "./env";
import type { GetUserInfoResponse } from "./types/manusTypes";
import { 
  type UnifiedUser, 
  type AuthProvider,
  normalizeManusUser, 
  normalizeSupabaseUser,
  detectAuthProvider 
} from "./dbRouter";

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

  private getSessionSecret(): Uint8Array {
    return new TextEncoder().encode(ENV.cookieSecret);
  }

  // Manus OAuth methods
  async createSessionToken(
    openId: string,
    options: { name: string; expiresInMs: number }
  ): Promise<string> {
    const secretKey = this.getSessionSecret();
    // Convert milliseconds to seconds for JWT exp claim
    const expirationSeconds = Math.floor(options.expiresInMs / 1000);
    // Use string format: "Xs" means X seconds from now
    const expirationTime = `${expirationSeconds}s`;

    return await new SignJWT({ openId, appId: ENV.appId, name: options.name })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationTime)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<{ openId: string; appId: string; name: string } | null> {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });

      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }

      return { openId, appId, name };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<{ accessToken: string }> {
    const redirectUri = atob(state);
    const response = await fetch(`${ENV.oAuthServerUrl}/webdev.v1.WebDevAuthPublicService/ExchangeToken`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        clientId: ENV.appId,
        grantType: "authorization_code",
        code,
        redirectUri,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to exchange code for token: ${response.status} ${text}`
      );
    }

    const data = await response.json();
    return { accessToken: data.accessToken };
  }

  async getUserInfoWithJwt(jwt: string): Promise<GetUserInfoResponse> {
    const response = await fetch(`${ENV.oAuthServerUrl}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${jwt}`,
      },
      body: JSON.stringify({}),
    });

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.status}`);
    }

    return await response.json();
  }

  /**
   * Authenticate request using dual database architecture
   * Routes to Manus DB for admin (Manus OAuth) or Supabase DB for users (Supabase Auth)
   */
  async authenticateRequest(req: Request): Promise<UnifiedUser> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const authHeader = req.headers.authorization;

    let token: string | undefined;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      token = authHeader.substring(7);
    } else if (sessionCookie) {
      token = sessionCookie;
    }

    if (!token) {
      throw ForbiddenError("Missing authentication token");
    }

    // Try Supabase auth first (Bearer token)
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return await this.authenticateWithSupabase(token);
    }

    // Try Manus auth (session cookie)
    return await this.authenticateWithManus(token);
  }

  private async authenticateWithSupabase(token: string): Promise<UnifiedUser> {
    const supabaseUser = await verifySupabaseToken(token);

    if (!supabaseUser) {
      throw ForbiddenError("Invalid Supabase authentication token");
    }

    const signedInAt = new Date();
    let user = await getSupabaseUserById(supabaseUser.id);

    // If user not in Supabase DB, create them
    if (!user) {
      await upsertSupabaseUser({
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || supabaseUser.email || null,
        email: supabaseUser.email ?? null,
        role: "user", // Regular users always have "user" role
        lastSignedIn: signedInAt,
      });
      user = await getSupabaseUserById(supabaseUser.id);
    }

    if (!user) {
      throw ForbiddenError("User not found in Supabase database");
    }

    // Update last signed in
    await upsertSupabaseUser({
      id: user.id,
      lastSignedIn: signedInAt,
    });

    return normalizeSupabaseUser(user);
  }

  private async authenticateWithManus(sessionCookie: string): Promise<UnifiedUser> {
    // Verify JWT session cookie
    const session = await this.verifySession(sessionCookie);
    
    if (!session) {
      throw ForbiddenError("Invalid Manus session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    
    // For Manus auth, query Manus database
    // User should already exist from OAuth callback upsert
    const user = await db.getUserBySupabaseId(sessionUserId);

    if (!user) {
      console.error("[Auth] User not found in Manus database for openId:", sessionUserId);
      throw ForbiddenError("User not found in Manus database. Please sign in again.");
    }

    // Update last signed in
    await db.upsertUser({
      supabaseId: user.supabaseId,
      lastSignedIn: signedInAt,
    });

    return normalizeManusUser(user);
  }
}

export const sdk = new SDKServer();
