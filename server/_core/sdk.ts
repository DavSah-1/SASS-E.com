import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
import { jwtVerify, SignJWT } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { verifySupabaseToken } from "../lib/supabaseAuth";
import { ENV } from "./env";
import type { GetUserInfoResponse } from "./types/manusTypes";

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

    return await response.json();
  }

  async getUserInfo(accessToken: string): Promise<GetUserInfoResponse> {
    const response = await fetch(`${ENV.oAuthServerUrl}/webdev.v1.WebDevAuthPublicService/GetUserInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        accessToken,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get user info: ${response.status} ${text}`);
    }

    return await response.json();
  }

  async getUserInfoWithJwt(jwtToken: string): Promise<GetUserInfoResponse> {
    const response = await fetch(`${ENV.oAuthServerUrl}/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        jwtToken,
        projectId: ENV.appId,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get user info with JWT: ${response.status} ${text}`);
    }

    return await response.json();
  }

  // Dual auth: Manus OAuth or Supabase
  async authenticateRequest(req: Request): Promise<User> {
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

    // Route to appropriate auth system based on AUTH_MODE
    if (ENV.authMode === "supabase") {
      return await this.authenticateWithSupabase(token);
    } else {
      return await this.authenticateWithManus(token);
    }
  }

  private async authenticateWithSupabase(token: string): Promise<User> {
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

  private async authenticateWithManus(sessionCookie: string): Promise<User> {
    // Verify JWT session cookie
    const session = await this.verifySession(sessionCookie);
    
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    
    // For Manus auth, use openId as supabaseId (they're stored in the same column)
    let user = await db.getUserBySupabaseId(sessionUserId);

    // If user not in DB, sync from OAuth server automatically
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie);
        await db.upsertUser({
          supabaseId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt,
        });
        user = await db.getUserBySupabaseId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
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
