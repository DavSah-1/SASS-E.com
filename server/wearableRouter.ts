/**
 * Wearable Device Integration Router
 * Handles device connections, OAuth, and data syncing
 */
import { z } from "zod";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import {
  getUserWearableConnections,
  getWearableConnection,
  addWearableConnection,
  disconnectWearable,
  getSyncHistory,
  syncWearableData,
  getOAuthUrl,
} from "./wearableService";

export const wearableRouter = router({
  /**
   * Get all wearable connections for the current user
   */
  getConnections: protectedProcedure.query(async ({ ctx }) => {
    return getUserWearableConnections(ctx.user.numericId);
  }),

  /**
   * Get a specific wearable connection
   */
  getConnection: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .query(async ({ ctx, input }) => {
      return getWearableConnection(input.connectionId, ctx.user.numericId);
    }),

  /**
   * Add a new wearable connection (manual setup)
   */
  addConnection: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["apple_health", "google_fit", "fitbit", "garmin", "samsung_health", "other"]),
        deviceName: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const connectionId = await addWearableConnection({
        userId: ctx.user.numericId,
        provider: input.provider,
        deviceName: input.deviceName,
      });
      
      return { connectionId, success: true };
    }),

  /**
   * Get OAuth URL for a provider
   */
  getOAuthUrl: protectedProcedure
    .input(
      z.object({
        provider: z.enum(["google_fit", "fitbit", "garmin"]),
        redirectUri: z.string(),
      })
    )
    .query(({ input }) => {
      try {
        const url = getOAuthUrl(input.provider, input.redirectUri);
        return { url, success: true };
      } catch (error) {
        return {
          url: "",
          success: false,
          error: error instanceof Error ? error.message : "Failed to generate OAuth URL",
        };
      }
    }),

  /**
   * Disconnect a wearable device
   */
  disconnect: protectedProcedure
    .input(z.object({ connectionId: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await disconnectWearable(input.connectionId, ctx.user.numericId);
      return { success: true };
    }),

  /**
   * Get sync history for a connection
   */
  getSyncHistory: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        limit: z.number().optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      return getSyncHistory(input.connectionId, ctx.user.numericId, input.limit);
    }),

  /**
   * Manually trigger a sync for a connection
   */
  syncData: protectedProcedure
    .input(
      z.object({
        connectionId: z.number(),
        dataTypes: z.array(
          z.enum([
            "steps",
            "heart_rate",
            "sleep",
            "weight",
            "calories",
            "distance",
            "active_minutes",
            "blood_pressure",
            "blood_glucose",
            "oxygen_saturation",
          ])
        ),
      })
    )
    .mutation(async ({ ctx, input }) => {
      return syncWearableData(input.connectionId, ctx.user.numericId, input.dataTypes);
    }),

  /**
   * Get supported providers
   */
  getSupportedProviders: publicProcedure.query(() => {
    return [
      {
        id: "apple_health",
        name: "Apple Health",
        description: "Sync data from iPhone Health app",
        icon: "🍎",
        supportsOAuth: false,
        dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes"],
      },
      {
        id: "google_fit",
        name: "Google Fit",
        description: "Sync data from Google Fit",
        icon: "🏃",
        supportsOAuth: true,
        dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes"],
      },
      {
        id: "fitbit",
        name: "Fitbit",
        description: "Sync data from Fitbit devices",
        icon: "⌚",
        supportsOAuth: true,
        dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "oxygen_saturation"],
      },
      {
        id: "garmin",
        name: "Garmin",
        description: "Sync data from Garmin devices",
        icon: "🏃‍♂️",
        supportsOAuth: true,
        dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes"],
      },
      {
        id: "samsung_health",
        name: "Samsung Health",
        description: "Sync data from Samsung Health app",
        icon: "📱",
        supportsOAuth: false,
        dataTypes: ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "blood_pressure"],
      },
    ];
  }),
});
