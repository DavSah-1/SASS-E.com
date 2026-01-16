import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import * as db from "../db";
import { getSessionCookieOptions } from "./cookies";
import { sdk } from "./sdk";

function getQueryParam(req: Request, key: string): string | undefined {
  const value = req.query[key];
  return typeof value === "string" ? value : undefined;
}

export function registerOAuthRoutes(app: Express) {
  app.get("/api/oauth/callback", async (req: Request, res: Response) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");

    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }

    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);

      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }

      await db.upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: new Date(),
      });

      // Get user's session preference
      const user = await db.getUserByOpenId(userInfo.openId);
      const ONE_DAY_MS = 24 * 60 * 60 * 1000;
      const THIRTY_DAYS_MS = 30 * ONE_DAY_MS;
      const sessionDuration = user?.staySignedIn ? THIRTY_DAYS_MS : ONE_DAY_MS;

      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: sessionDuration,
      });

      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: sessionDuration });

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
