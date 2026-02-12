import { getDb } from "../db";
import { auditLogs, InsertAuditLog } from "../../drizzle/schema";

export type AuditActionType =
  | "role_change"
  | "user_delete"
  | "password_reset"
  | "user_suspend"
  | "cache_clear"
  | "manual_cleanup";

export interface AuditLogData {
  adminId: string | number;
  adminEmail?: string | null;
  actionType: AuditActionType;
  targetUserId?: string | number | null;
  targetUserEmail?: string | null;
  details?: Record<string, any>;
  ipAddress?: string;
}

/**
 * Log an admin action to the audit log
 */
export async function logAuditAction(data: AuditLogData): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Audit Log] Database not available, skipping audit log");
      return;
    }

    const logEntry: InsertAuditLog = {
      adminId: typeof data.adminId === 'string' ? parseInt(data.adminId) : data.adminId,
      adminEmail: data.adminEmail || undefined,
      actionType: data.actionType,
      targetUserId: data.targetUserId ? (typeof data.targetUserId === 'string' ? parseInt(data.targetUserId) : data.targetUserId) : undefined,
      targetUserEmail: data.targetUserEmail || undefined,
      details: data.details ? JSON.stringify(data.details) : undefined,
      ipAddress: data.ipAddress,
    };

    await db.insert(auditLogs).values(logEntry);
    console.log(`[Audit Log] Logged action: ${data.actionType} by admin ${data.adminId}`);
  } catch (error) {
    console.error("[Audit Log] Failed to log action:", error);
    // Don't throw - audit logging should not break the main operation
  }
}

/**
 * Extract IP address from request
 */
export function getIpAddress(req: any): string | undefined {
  return (
    req.headers["x-forwarded-for"]?.split(",")[0] ||
    req.headers["x-real-ip"] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress
  );
}
