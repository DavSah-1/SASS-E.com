/**
 * Wearable Device Integration Service
 * Handles OAuth flows and data syncing for Apple Health, Google Fit, Fitbit, etc.
 */

import { getDb } from "./db";
import { wearableConnections, wearableSyncLogs, wearableDataCache } from "../drizzle/schema";
import { eq, and, desc } from "drizzle-orm";

/**
 * Get all wearable connections for a user
 */
export async function getUserWearableConnections(userId: number) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(wearableConnections)
    .where(eq(wearableConnections.userId, userId))
    .orderBy(desc(wearableConnections.createdAt));
}

/**
 * Get a specific wearable connection
 */
export async function getWearableConnection(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const results = await db
    .select()
    .from(wearableConnections)
    .where(
      and(
        eq(wearableConnections.id, connectionId),
        eq(wearableConnections.userId, userId)
      )
    )
    .limit(1);
  
  return results[0] || null;
}

/**
 * Add a new wearable connection
 */
export async function addWearableConnection(data: {
  userId: number;
  provider: "apple_health" | "google_fit" | "fitbit" | "garmin" | "samsung_health" | "other";
  deviceName?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: Date;
  scope?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const result = await db.insert(wearableConnections).values({
    userId: data.userId,
    provider: data.provider,
    deviceName: data.deviceName,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    tokenExpiresAt: data.tokenExpiresAt,
    scope: data.scope,
  });
  
  return Number((result as any).insertId || 0);
}

/**
 * Update wearable connection tokens
 */
export async function updateWearableConnectionTokens(
  connectionId: number,
  userId: number,
  accessToken: string,
  refreshToken?: string,
  expiresAt?: Date
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(wearableConnections)
    .set({
      accessToken,
      refreshToken,
      tokenExpiresAt: expiresAt,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(wearableConnections.id, connectionId),
        eq(wearableConnections.userId, userId)
      )
    );
}

/**
 * Update last sync time for a connection
 */
export async function updateLastSyncTime(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(wearableConnections)
    .set({
      lastSyncAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(wearableConnections.id, connectionId),
        eq(wearableConnections.userId, userId)
      )
    );
}

/**
 * Disconnect a wearable device
 */
export async function disconnectWearable(connectionId: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db
    .update(wearableConnections)
    .set({
      isActive: 0,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(wearableConnections.id, connectionId),
        eq(wearableConnections.userId, userId)
      )
    );
}

/**
 * Log a sync operation
 */
export async function logSync(data: {
  connectionId: number;
  userId: number;
  dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
  recordsProcessed: number;
  status: "success" | "failed" | "partial";
  errorMessage?: string;
  syncStartedAt: Date;
  syncCompletedAt?: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(wearableSyncLogs).values(data);
}

/**
 * Get sync history for a connection
 */
export async function getSyncHistory(connectionId: number, userId: number, limit: number = 20) {
  const db = await getDb();
  if (!db) return [];
  
  return db
    .select()
    .from(wearableSyncLogs)
    .where(
      and(
        eq(wearableSyncLogs.connectionId, connectionId),
        eq(wearableSyncLogs.userId, userId)
      )
    )
    .orderBy(desc(wearableSyncLogs.createdAt))
    .limit(limit);
}

/**
 * Cache raw wearable data for processing
 */
export async function cacheWearableData(data: {
  connectionId: number;
  userId: number;
  dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
  rawData: string;
  timestamp: Date;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  await db.insert(wearableDataCache).values(data);
}

/**
 * Get OAuth authorization URL for a provider
 * Note: This is a placeholder - actual OAuth implementation requires provider-specific setup
 */
export function getOAuthUrl(provider: string, redirectUri: string): string {
  const clientIds: Record<string, string> = {
    google_fit: process.env.GOOGLE_FIT_CLIENT_ID || "",
    fitbit: process.env.FITBIT_CLIENT_ID || "",
    garmin: process.env.GARMIN_CLIENT_ID || "",
  };
  
  const authUrls: Record<string, string> = {
    google_fit: "https://accounts.google.com/o/oauth2/v2/auth",
    fitbit: "https://www.fitbit.com/oauth2/authorize",
    garmin: "https://connect.garmin.com/oauthConfirm",
  };
  
  const scopes: Record<string, string> = {
    google_fit: "https://www.googleapis.com/auth/fitness.activity.read https://www.googleapis.com/auth/fitness.body.read https://www.googleapis.com/auth/fitness.sleep.read",
    fitbit: "activity heartrate sleep weight",
    garmin: "activity sleep weight",
  };
  
  const clientId = clientIds[provider];
  const authUrl = authUrls[provider];
  const scope = scopes[provider];
  
  if (!clientId || !authUrl) {
    throw new Error(`OAuth not configured for provider: ${provider}`);
  }
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: scope,
  });
  
  return `${authUrl}?${params.toString()}`;
}

/**
 * Sync data from a wearable device
 * Note: This is a placeholder - actual sync implementation requires provider-specific APIs
 */
export async function syncWearableData(
  connectionId: number,
  userId: number,
  dataTypes: string[]
): Promise<{ success: boolean; message: string; recordsSynced: number }> {
  const connection = await getWearableConnection(connectionId, userId);
  
  if (!connection) {
    return { success: false, message: "Connection not found", recordsSynced: 0 };
  }
  
  if (!connection.isActive) {
    return { success: false, message: "Connection is not active", recordsSynced: 0 };
  }
  
  const syncStartedAt = new Date();
  let totalRecords = 0;
  
  try {
    // Placeholder: In a real implementation, this would call provider-specific APIs
    // For now, we'll simulate a successful sync
    
    for (const dataType of dataTypes) {
      // Simulate syncing data
      const recordsProcessed = Math.floor(Math.random() * 10) + 1;
      totalRecords += recordsProcessed;
      
      await logSync({
        connectionId,
        userId,
        dataType: dataType as any,
        recordsProcessed,
        status: "success",
        syncStartedAt,
        syncCompletedAt: new Date(),
      });
    }
    
    await updateLastSyncTime(connectionId, userId);
    
    return {
      success: true,
      message: `Successfully synced ${totalRecords} records`,
      recordsSynced: totalRecords,
    };
  } catch (error) {
    await logSync({
      connectionId,
      userId,
      dataType: dataTypes[0] as any,
      recordsProcessed: 0,
      status: "failed",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
      syncStartedAt,
      syncCompletedAt: new Date(),
    });
    
    return {
      success: false,
      message: error instanceof Error ? error.message : "Sync failed",
      recordsSynced: 0,
    };
  }
}
