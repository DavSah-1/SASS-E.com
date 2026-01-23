import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { ENV } from "./env";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  // Only register Manus OAuth callback if in Manus auth mode
  if (ENV.authMode !== "manus") {
    console.log("[OAuth] Skipping Manus OAuth routes (auth mode: " + ENV.authMode + ")");
    return;
  }

  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      console.log("[OAuth] Starting callback with code:", code.substring(0, 10) + "...");
      
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      console.log("[OAuth] Got access token:", tokenResponse.accessToken ? "YES" : "NO");
      
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      console.log("[OAuth] Got user info:", { openId: userInfo.openId, name: userInfo.name, email: userInfo.email });

      if (!userInfo.openId) {
        console.error("[OAuth] Missing openId in user info");
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        supabaseId: userInfo.openId, // Store Manus openId in supabaseId column
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });
      console.log("[OAuth] User upserted to database");

      // Get user's session preference
      const user = await db.getUserBySupabaseId(userInfo.openId);
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      const sessionDuration = user?.staySignedIn ? THIRTY_DAYS_MS : ONE_DAY_MS;

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: sessionDuration,
      });
      console.log("[OAuth] Created session token, length:", sessionToken.length);

      const cookieOptions = getSessionCookieOptions(req);
      console.log("[OAuth] Cookie options:", cookieOptions);
      console.log("[OAuth] Setting cookie with name:", COOKIE_NAME, "maxAge:", sessionDuration);
      
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: sessionDuration });
      console.log("[OAuth] Cookie set, redirecting to /");

      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed:", error);
      console.error("[OAuth] Error stack:", error instanceof Error ? error.stack : 'No stack trace');
      console.error("[OAuth] Error details:", JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: "OAuth callback failed",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });
}
