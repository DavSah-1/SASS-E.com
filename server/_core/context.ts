import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { UnifiedUser } from "./dbRouter";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: UnifiedUser | null;
  accessToken?: string; // JWT token for RLS enforcement
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: UnifiedUser | null = null;
  let accessToken: string | undefined = undefined;

  try {
    user = await sdk.authenticateRequest(opts.req);
    
    // Extract JWT token from Authorization header for RLS
    const authHeader = opts.req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
    accessToken,
  };
}
