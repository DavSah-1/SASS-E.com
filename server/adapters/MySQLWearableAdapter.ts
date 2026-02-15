/**
 * MySQLWearableAdapter - MySQL implementation for wearable device operations
 * 
 * Used for admin users. Delegates to server/db/wearable.ts functions.
 */

import { WearableAdapter } from "./WearableAdapter";
import * as wearableDb from "../db/wearable";

export class MySQLWearableAdapter implements WearableAdapter {
  async getUserWearableConnections(userId: number): Promise<any[]> {
    return wearableDb.getUserWearableConnections(userId);
  }

  async getWearableConnection(connectionId: number, userId: number): Promise<any | null> {
    return wearableDb.getWearableConnection(connectionId, userId);
  }

  async addWearableConnection(data: {
    userId: number;
    provider: "apple_health" | "google_fit" | "fitbit" | "garmin" | "samsung_health" | "other";
    deviceName?: string;
    accessToken?: string;
    refreshToken?: string;
    tokenExpiresAt?: Date;
    scope?: string;
  }): Promise<number> {
    return wearableDb.addWearableConnection(data);
  }

  async updateWearableConnectionTokens(
    connectionId: number,
    userId: number,
    accessToken: string,
    refreshToken?: string,
    expiresAt?: Date
  ): Promise<void> {
    return wearableDb.updateWearableConnectionTokens(
      connectionId,
      userId,
      accessToken,
      refreshToken,
      expiresAt
    );
  }

  async updateLastSyncTime(connectionId: number, userId: number): Promise<void> {
    return wearableDb.updateLastSyncTime(connectionId, userId);
  }

  async disconnectWearable(connectionId: number, userId: number): Promise<void> {
    return wearableDb.disconnectWearable(connectionId, userId);
  }

  async logSync(data: {
    connectionId: number;
    userId: number;
    dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
    recordsProcessed: number;
    status: "success" | "failed" | "partial";
    errorMessage?: string;
    syncStartedAt: Date;
    syncCompletedAt?: Date;
  }): Promise<void> {
    return wearableDb.logSync(data);
  }

  async getSyncHistory(connectionId: number, userId: number, limit: number = 20): Promise<any[]> {
    return wearableDb.getSyncHistory(connectionId, userId, limit);
  }

  async cacheWearableData(data: {
    connectionId: number;
    userId: number;
    dataType: "steps" | "heart_rate" | "sleep" | "weight" | "calories" | "distance" | "active_minutes" | "blood_pressure" | "blood_glucose" | "oxygen_saturation";
    rawData: string;
    timestamp: Date;
  }): Promise<void> {
    return wearableDb.cacheWearableData(data);
  }

  async syncWearableData(
    connectionId: number,
    userId: number,
    dataTypes: string[]
  ): Promise<{ success: boolean; message: string; recordsSynced: number }> {
    return wearableDb.syncWearableData(connectionId, userId, dataTypes);
  }
}
