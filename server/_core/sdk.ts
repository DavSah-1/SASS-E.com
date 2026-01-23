import { COOKIE_NAME } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import { parse as parseCookieHeader } from "cookie";
import type { Request } from "express";
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

  // Manus OAuth methods
  async createSessionToken(
    openId: string,
    options: { name: string; expiresInMs: number }
  ): Promise<string> {
    const response = await fetch(`${ENV.oAuthServerUrl}/create-session-token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": ENV.appId,
      },
      body: JSON.stringify({
        openId,
        name: options.name,
        expiresInMs: options.expiresInMs,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Failed to create session token: ${response.status} ${text}`
      );
    }

    const data = await response.json();
    return data.sessionToken;
  }

  async exchangeCodeForToken(
    code: string,
    state: string
  ): Promise<{ accessToken: string }> {
    const response = await fetch(`${ENV.oAuthServerUrl}/exchange-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-App-Id": ENV.appId,
      },
      body: JSON.stringify({ code, state }),
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
    const response = await fetch(`${ENV.oAuthServerUrl}/user-info`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "X-App-Id": ENV.appId,
      },
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Failed to get user info: ${response.status} ${text}`);
    }

    return await response.json();
  }

  async verifySessionToken(sessionToken: string): Promise<GetUserInfoResponse> {
    const response = await fetch(`${ENV.oAuthServerUrl}/verify-session`, {
      headers: {
        Authorization: `Bearer ${sessionToken}`,
        "X-App-Id": ENV.appId,
      },
    });

    if (!response.ok) {
      throw ForbiddenError("Invalid session token");
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

  private async authenticateWithManus(token: string): Promise<User> {
    const userInfo = await this.verifySessionToken(token);

    if (!userInfo.openId) {
      throw ForbiddenError("Invalid user info");
    }

    const signedInAt = new Date();
    
    // For Manus auth, use openId as supabaseId (they're stored in the same column)
    let user = await db.getUserBySupabaseId(userInfo.openId);

    // If user not in DB, create them
    if (!user) {
      await db.upsertUser({
        supabaseId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: signedInAt,
      });
      user = await db.getUserBySupabaseId(userInfo.openId);
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
