/**
 * Wearable Device Integration Schema
 * Supports Apple Health, Google Fit, Fitbit, and other wearable devices
 */
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Wearable Connections - tracks connected devices and authorization
 */
export const wearableConnections = mysqlTable("wearable_connections", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  provider: mysqlEnum("provider", ["apple_health", "google_fit", "fitbit", "garmin", "samsung_health", "other"]).notNull(),
  deviceName: varchar("deviceName", { length: 255 }),
  accessToken: text("accessToken"), // encrypted OAuth token
  refreshToken: text("refreshToken"), // encrypted refresh token
  tokenExpiresAt: timestamp("tokenExpiresAt"),
  scope: text("scope"), // permissions granted
  isActive: int("isActive").default(1).notNull(),
  lastSyncAt: timestamp("lastSyncAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type WearableConnection = typeof wearableConnections.$inferSelect;
export type InsertWearableConnection = typeof wearableConnections.$inferInsert;

/**
 * Wearable Sync Logs - tracks sync history and errors
 */
export const wearableSyncLogs = mysqlTable("wearable_sync_logs", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  dataType: mysqlEnum("dataType", ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "blood_pressure", "blood_glucose", "oxygen_saturation"]).notNull(),
  recordsProcessed: int("recordsProcessed").default(0).notNull(),
  status: mysqlEnum("status", ["success", "failed", "partial"]).notNull(),
  errorMessage: text("errorMessage"),
  syncStartedAt: timestamp("syncStartedAt").notNull(),
  syncCompletedAt: timestamp("syncCompletedAt"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableSyncLog = typeof wearableSyncLogs.$inferSelect;
export type InsertWearableSyncLog = typeof wearableSyncLogs.$inferInsert;

/**
 * Wearable Data Cache - temporary storage for synced data before processing
 */
export const wearableDataCache = mysqlTable("wearable_data_cache", {
  id: int("id").autoincrement().primaryKey(),
  connectionId: int("connectionId").notNull(),
  userId: int("userId").notNull(),
  dataType: mysqlEnum("dataType", ["steps", "heart_rate", "sleep", "weight", "calories", "distance", "active_minutes", "blood_pressure", "blood_glucose", "oxygen_saturation"]).notNull(),
  rawData: text("rawData").notNull(), // JSON string of raw API response
  timestamp: timestamp("timestamp").notNull(), // when the data was recorded by the device
  processed: int("processed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WearableDataCache = typeof wearableDataCache.$inferSelect;
export type InsertWearableDataCache = typeof wearableDataCache.$inferInsert;
