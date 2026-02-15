/**
 * WearableAdapter - Interface for wearable device integration operations
 * 
 * Supports dual-database architecture:
 * - MySQL for admin users
 * - Supabase for regular users with Row-Level Security (RLS)
 */

export interface WearableAdapter {
  /**
   * Get OAuth URL for wearable provider
   */
  getOAuthUrl(provider: string, redirectUri: string): string;

  /**
   * Get all wearable connections for a user
   */
  getUserWearableConnections(userId: number): Promise<any[]>;

  /**
   * Get a specific wearable connection
   */
  getWearableConnection(connectionId: number, userId: number): Promise<any | null>;

  /**
   * Add a new wearable connection
   */
  addWearableConnection(data: {
    userId: number;
    provider: "apple_health" | "google_fit" | "fitbit" | "garmin" | "samsung_health" | "other";
    deviceName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    scope?: string;
  }): Promise<number>;

  /**
   * Update wearable connection tokens
   */
  updateWearableConnectionTokens(
    connectionId: number,
    userId: number,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<void>;

  /**
   * Update last sync time for a connection
   */
  updateLastSyncTime(connectionId: number, userId: number): Promise<void>;

  /**
   * Disconnect a wearable device
   */
  disconnectWearable(connectionId: number, userId: number): Promise<void>;

  /**
   * Log a sync operation
   */
  logSync(data: {
    connectionId: number;
    userId: number;
    dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
    recordsProcessed: number;
    status: "success" | "failed" | "partial";
    errorMessage?: string;
    syncStartedAt: Date;
    syncCompletedAt?: Date;
  }): Promise<void>;

  /**
   * Get sync history for a connection
   */
  getSyncHistory(connectionId: number, userId: number, limit?: number): Promise<any[]>;

  /**
   * Cache raw wearable data for processing
   */
  cacheWearableData(data: {
    connectionId: number;
    userId: number;
    dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
    rawData: string;
    timestamp: Date;
  }): Promise<void>;

  /**
   * Sync data from a wearable device
   */
  syncWearableData(
    connectionId: number,
    userId: number,
    dataTypes: string[]
  ): Promise<{ success: boolean; message: string; recordsSynced: number }>;
}
