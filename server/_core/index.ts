import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import uploadRouter from "../upload";
import { serveStatic, setupVite } from "./vite";
import { startCleanupScheduler } from "../services/audioCleanup";
import { apiLimiter, authLimiter, trpcLimiter, uploadLimiter } from "../middleware/rateLimiter";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  
  // Trust proxy to get correct client IP (required for rate limiting)
  app.set('trust proxy', 1);
  
  // Stripe webhook endpoint MUST come before body parser
  // Stripe requires raw body for signature verification
  app.post(
    "/api/stripe/webhook",
    express.raw({ type: "application/json" }),
    async (req, res) => {
      try {
        const { constructWebhookEvent, handleWebhookEvent } = await import("../stripe/webhook");
        
        const signature = req.headers["stripe-signature"];
        if (!signature || typeof signature !== "string") {
          console.error("[Stripe Webhook] No signature header");
          return res.status(400).send("No signature");
        }
        
        // Construct and verify the event
        const event = constructWebhookEvent(req.body, signature);
        
        // Handle the event
        await handleWebhookEvent(event);
        
        res.json({ received: true });
      } catch (error: any) {
        console.error("[Stripe Webhook] Error:", error.message);
        res.status(400).send(`Webhook Error: ${error.message}`);
      }
    }
  );
  
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  
  // Apply general API rate limiting
  app.use("/api", apiLimiter);
  // OAuth callback under /api/oauth/callback (with auth rate limiting)
  app.use("/api/oauth", authLimiter);
  registerOAuthRoutes(app);
  // File upload endpoint (with upload rate limiting)
  app.use("/api/upload", uploadLimiter);
  app.use("/api", uploadRouter);
  // tRPC API (with tRPC rate limiting)
  app.use(
    "/api/trpc",
    trpcLimiter,
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
    
    // Start automated audio cleanup scheduler (runs daily at 2 AM)
    if (process.env.NODE_ENV === 'production') {
      startCleanupScheduler();
      console.log('[Audio Cleanup] Scheduler enabled (production mode)');
    } else {
      console.log('[Audio Cleanup] Scheduler disabled (development mode)');
    }
    
    // Start notification cleanup scheduler (runs daily at 2 AM)
    const { startNotificationCleanupJob } = require('../scheduledJobs');
    startNotificationCleanupJob();
    console.log('[Notification Cleanup] Scheduler started (runs daily at 2:00 AM UTC)');
  });
}

startServer().catch(console.error);
