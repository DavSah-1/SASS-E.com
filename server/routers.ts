import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { systemRouter } from "./_core/systemRouter";
import { transcribeAudio } from "./_core/voiceTranscription";
import { formatSearchResults, searchWeb } from "./_core/webSearch";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { handleError } from "./_core/errorHandler";
import * as dbRoleAware from "./dbRoleAware";
import { getConversationsPaginated, getConversationsByDateRange, getConversationStats, searchConversations } from "./db";
import { iotController } from "./_core/iotController";
import { learningEngine } from "./_core/learningEngine";
import { languageLearningRouter } from "./languageLearningRouter";
import { debtCoachRouter } from "./debtCoachRouter";
import { budgetRouter } from "./budgetRouter";
import { goalsRouter } from "./goalsRouter";
import { mathRouter } from "./mathRouter";
import { scienceRouter } from "./scienceRouter";
import { wellbeingRouter } from "./wellbeingRouter";
import { wearableRouter } from "./wearableRouter";
import { topicRouter } from "./topicRouter";
import { translateChatRouter } from "./translateChatRouter";
import { translationRouter as i18nRouter } from "./translationRouter";
import { adminPinRouter } from "./adminPinRouter";
import { learnFinanceRouter } from "./learnFinanceRouter";
import { piperTTSRouter } from "./piperTTSRouter";
import { transactionImportRouter } from "./transactionImportRouter";
import { budgetExportRouter } from "./budgetExportRouter";
import { toNumericId } from "./_core/dbWrapper";
import { cleanupOldAudioFiles, cleanupByStorageLimit, getStorageStats } from "./services/audioCleanup";
import { getCacheStats, cacheClear } from "./services/cache";
import { metrics, logApiUsage, logError } from "./utils/metrics";
import { systemLogs, performanceMetrics, errorLogs, apiUsageLogs, auditLogs, users } from "../drizzle/schema";
import { and, gte, lte, like, eq, sql } from "drizzle-orm";
import { getDb } from "./db";
import { getSupabaseClient, getSupabaseAdminClient } from "./supabaseClient";
import { logAuditAction, getIpAddress } from "./utils/auditLog";
import { cleanupLogs } from "../drizzle/schema";
import { desc } from "drizzle-orm";
import {
  searchWebWithQuota,
  transcribeAudioWithQuota,
  invokeLLMWithQuota,
  getUserContextFromTRPC,
} from "./utils/quotaAwareApi";

export const appRouter = router({
  system: systemRouter,
  adminPin: adminPinRouter,
  languageLearning: languageLearningRouter,
  debtCoach: debtCoachRouter,
  budget: budgetRouter,
  goals: goalsRouter,
  math: mathRouter,
  science: scienceRouter,
  wellbeing: wellbeingRouter,
  wearable: wearableRouter,
  topic: topicRouter,
  translateChat: translateChatRouter,
  i18n: i18nRouter,
  learnFinance: learnFinanceRouter,
  piperTTS: piperTTSRouter,
  transactionImport: transactionImportRouter,
  budgetExport: budgetExportRouter,

  admin: router({
    // Audio cleanup endpoints
    cleanupAudio: protectedProcedure
      .input(z.object({
        type: z.enum(["age", "storage", "both"]).optional().default("both"),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Only admins can trigger cleanup
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          let ageResult = null;
          let storageResult = null;

          if (input.type === "age" || input.type === "both") {
            ageResult = await cleanupOldAudioFiles(ctx.user.id);
          }

          if (input.type === "storage" || input.type === "both") {
            storageResult = await cleanupByStorageLimit(ctx.user.id);
          }

          return {
            success: true,
            age: ageResult,
            storage: storageResult,
          };
        } catch (error: any) {
          console.error("[Admin Cleanup] Error:", error);
          throw new Error(`Cleanup failed: ${error.message}`);
        }
      }),

    getStorageStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          // Only admins can view storage stats
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const stats = await getStorageStats();
          return stats;
        } catch (error: any) {
          console.error("[Admin Storage Stats] Error:", error);
          throw new Error(`Failed to get storage stats: ${error.message}`);
        }
      }),

    getCleanupLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        try {
          // Only admins can view cleanup logs
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const logs = await db
            .select()
            .from(cleanupLogs)
            .orderBy(desc(cleanupLogs.createdAt))
            .limit(input.limit);

          return logs;
        } catch (error: any) {
          console.error("[Admin Cleanup Logs] Error:", error);
          throw new Error(`Failed to get cleanup logs: ${error.message}`);
        }
      }),

    // Cache management endpoints
    getCacheStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          // Only admins can view cache stats
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const stats = await getCacheStats();
          return stats;
        } catch (error: any) {
          console.error("[Admin Cache Stats] Error:", error);
          throw new Error(`Failed to get cache stats: ${error.message}`);
        }
      }),

    clearCache: protectedProcedure
      .input(z.object({
        pattern: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Only admins can clear cache
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          await cacheClear(input.pattern);
          return {
            success: true,
            message: input.pattern 
              ? `Cleared cache entries matching pattern: ${input.pattern}`
              : "Cleared all cache entries",
          };
        } catch (error: any) {
          console.error("[Admin Clear Cache] Error:", error);
          throw new Error(`Failed to clear cache: ${error.message}`);
        }
      }),

    // Monitoring endpoints
    getSystemHealth: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const uptime = process.uptime();
          const memoryUsage = process.memoryUsage();
          
          return {
            uptime: Math.floor(uptime),
            memory: {
              used: Math.round(memoryUsage.heapUsed / 1024 / 1024),
              total: Math.round(memoryUsage.heapTotal / 1024 / 1024),
              percentage: Math.round((memoryUsage.heapUsed / memoryUsage.heapTotal) * 100),
            },
            timestamp: new Date(),
          };
        } catch (error: any) {
          console.error("[Admin System Health] Error:", error);
          throw new Error(`Failed to get system health: ${error.message}`);
        }
      }),

    getPerformanceMetrics: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        timeRange: z.enum(["1h", "24h", "7d", "30d"]).optional().default("24h"),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const timeRanges = {
            "1h": 60 * 60 * 1000,
            "24h": 24 * 60 * 60 * 1000,
            "7d": 7 * 24 * 60 * 60 * 1000,
            "30d": 30 * 24 * 60 * 60 * 1000,
          };

          const since = new Date(Date.now() - timeRanges[input.timeRange]);
          const metricsData = await metrics.getMetrics(input.name, since);
          
          // Get stats for each metric name
          const uniqueNames = Array.from(new Set(metricsData.map(m => m.name)));
          const stats = await Promise.all(
            uniqueNames.map(async (name) => ({
              name,
              stats: await metrics.getStats(name, since),
            }))
          );

          return {
            metrics: metricsData,
            stats,
          };
        } catch (error: any) {
          console.error("[Admin Performance Metrics] Error:", error);
          throw new Error(`Failed to get performance metrics: ${error.message}`);
        }
      }),

    getApiUsageLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
        apiName: z.string().optional(),
        success: z.boolean().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const conditions = [];
          if (input.apiName) {
            conditions.push(eq(apiUsageLogs.apiName, input.apiName));
          }
          if (input.success !== undefined) {
            conditions.push(eq(apiUsageLogs.success, input.success));
          }

          const logs = await db
            .select()
            .from(apiUsageLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(apiUsageLogs.timestamp))
            .limit(input.limit);

          return logs;
        } catch (error: any) {
          console.error("[Admin API Usage Logs] Error:", error);
          throw new Error(`Failed to get API usage logs: ${error.message}`);
        }
      }),

    getErrorLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
        resolved: z.boolean().optional(),
        errorType: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const conditions = [];
          if (input.resolved !== undefined) {
            conditions.push(eq(errorLogs.resolved, input.resolved));
          }
          if (input.errorType) {
            conditions.push(eq(errorLogs.errorType, input.errorType));
          }

          const logs = await db
            .select()
            .from(errorLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(errorLogs.timestamp))
            .limit(input.limit);

          return logs;
        } catch (error: any) {
          console.error("[Admin Error Logs] Error:", error);
          throw new Error(`Failed to get error logs: ${error.message}`);
        }
      }),

    getSystemLogs: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(100),
        level: z.enum(["error", "warn", "info", "http", "debug"]).optional(),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          const conditions = [];
          if (input.level) {
            conditions.push(eq(systemLogs.level, input.level));
          }
          if (input.search) {
            conditions.push(like(systemLogs.message, `%${input.search}%`));
          }

          const logs = await db
            .select()
            .from(systemLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(systemLogs.timestamp))
            .limit(input.limit);

          return logs;
        } catch (error: any) {
          console.error("[Admin System Logs] Error:", error);
          throw new Error(`Failed to get system logs: ${error.message}`);
        }
      }),

    resolveError: protectedProcedure
      .input(z.object({
        errorId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          await db
            .update(errorLogs)
            .set({ resolved: true, resolvedAt: new Date() })
            .where(eq(errorLogs.id, input.errorId));

          return { success: true };
        } catch (error: any) {
          console.error("[Admin Resolve Error] Error:", error);
          throw new Error(`Failed to resolve error: ${error.message}`);
        }
      }),

    // User Management Endpoints
    getAllUsers: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
        offset: z.number().optional().default(0),
        search: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          
          let query = supabase
            .from('users')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(input.offset, input.offset + input.limit - 1);

          if (input.search) {
            query = query.or(`email.ilike.%${input.search}%,name.ilike.%${input.search}%`);
          }

          const { data, error, count } = await query;

          if (error) throw error;

          return {
            users: data || [],
            total: count || 0,
          };
        } catch (error: any) {
          console.error("[Admin Get All Users] Error:", error);
          throw new Error(`Failed to get users: ${error.message}`);
        }
      }),

    updateUserRole: protectedProcedure
      .input(z.object({
        userId: z.number(),
        role: z.enum(["admin", "user"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          
          // Get target user info for audit log
          const { data: targetUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', input.userId)
            .single();

          const { error } = await supabase
            .from('users')
            .update({ role: input.role })
            .eq('id', input.userId);

          if (error) throw error;

          // Log audit action
          await logAuditAction({
            adminId: ctx.user.id,
            adminEmail: ctx.user.email,
            actionType: "role_change",
            targetUserId: input.userId,
            targetUserEmail: targetUser?.email,
            details: { newRole: input.role },
            ipAddress: getIpAddress(ctx.req),
          });

          return { success: true, message: `User role updated to ${input.role}` };
        } catch (error: any) {
          console.error("[Admin Update User Role] Error:", error);
          throw new Error(`Failed to update user role: ${error.message}`);
        }
      }),

    suspendUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
        suspended: z.boolean(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          
          // Get target user info for audit log
          const { data: targetUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', input.userId)
            .single();

          // TODO: Add suspended field to users table schema
          // For now, we'll just log the action
          console.log(`[Admin] User ${input.userId} suspension status: ${input.suspended}`);

          // Log audit action
          await logAuditAction({
            adminId: ctx.user.id,
            adminEmail: ctx.user.email,
            actionType: "user_suspend",
            targetUserId: input.userId,
            targetUserEmail: targetUser?.email,
            details: { suspended: input.suspended },
            ipAddress: getIpAddress(ctx.req),
          });

          return { 
            success: true, 
            message: input.suspended ? "User suspended" : "User unsuspended"
          };
        } catch (error: any) {
          console.error("[Admin Suspend User] Error:", error);
          throw new Error(`Failed to suspend user: ${error.message}`);
        }
      }),

    deleteUser: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          
          // Get target user info for audit log
          const { data: targetUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', input.userId)
            .single();

          const { error } = await supabase
            .from('users')
            .delete()
            .eq('id', input.userId);

          if (error) throw error;

          // Log audit action
          await logAuditAction({
            adminId: ctx.user.id,
            adminEmail: ctx.user.email,
            actionType: "user_delete",
            targetUserId: input.userId,
            targetUserEmail: targetUser?.email,
            ipAddress: getIpAddress(ctx.req),
          });

          return { success: true, message: "User deleted successfully" };
        } catch (error: any) {
          console.error("[Admin Delete User] Error:", error);
          throw new Error(`Failed to delete user: ${error.message}`);
        }
      }),

    resetUserPassword: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          
          // Get target user info for audit log
          const { data: targetUser } = await supabase
            .from('users')
            .select('email')
            .eq('id', input.userId)
            .single();

          // Generate temporary password
          const tempPassword = Math.random().toString(36).slice(-12) + Math.random().toString(36).slice(-12).toUpperCase();

          // TODO: Implement password reset logic with Supabase Auth
          console.log(`[Admin] Generated temporary password for user ${input.userId}`);

          // Log audit action
          await logAuditAction({
            adminId: ctx.user.id,
            adminEmail: ctx.user.email,
            actionType: "password_reset",
            targetUserId: input.userId,
            targetUserEmail: targetUser?.email,
            ipAddress: getIpAddress(ctx.req),
          });

          return { 
            success: true, 
            tempPassword,
            message: "Temporary password generated. User should change it on next login."
          };
        } catch (error: any) {
          console.error("[Admin Reset Password] Error:", error);
          throw new Error(`Failed to reset password: ${error.message}`);
        }
      }),

    getUserActivity: protectedProcedure
      .input(z.object({
        userId: z.number(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          // Get API usage stats
          const apiUsage = await db
            .select({
              apiName: apiUsageLogs.apiName,
              count: sql<number>`count(*)`,
              totalQuota: sql<number>`sum(${apiUsageLogs.quotaUsed})`,
            })
            .from(apiUsageLogs)
            .where(eq(apiUsageLogs.userId, input.userId))
            .groupBy(apiUsageLogs.apiName);

          return {
            apiUsage,
          };
        } catch (error: any) {
          console.error("[Admin Get User Activity] Error:", error);
          throw new Error(`Failed to get user activity: ${error.message}`);
        }
      }),

    getAuditLogs: protectedProcedure
      .input(z.object({
        limit: z.number().default(50),
        offset: z.number().default(0),
        actionType: z.string().optional(),
        adminId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          // Build where conditions
          const conditions = [];
          
          if (input.actionType) {
            conditions.push(eq(auditLogs.actionType, input.actionType));
          }
          
          if (input.adminId) {
            conditions.push(eq(auditLogs.adminId, input.adminId));
          }
          
          if (input.startDate) {
            conditions.push(gte(auditLogs.createdAt, new Date(input.startDate)));
          }
          
          if (input.endDate) {
            conditions.push(lte(auditLogs.createdAt, new Date(input.endDate)));
          }

          // Get audit logs with pagination
          const logs = await db
            .select()
            .from(auditLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(auditLogs.createdAt))
            .limit(input.limit)
            .offset(input.offset);

          // Get total count
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)` })
            .from(auditLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined);

          return {
            logs,
            total: count,
          };
        } catch (error: any) {
          console.error("[Admin Get Audit Logs] Error:", error);
          throw new Error(`Failed to get audit logs: ${error.message}`);
        }
      }),

    exportAuditLogs: protectedProcedure
      .input(z.object({
        actionType: z.string().optional(),
        adminId: z.number().optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          // Build where conditions (same as getAuditLogs)
          const conditions = [];
          
          if (input.actionType) {
            conditions.push(eq(auditLogs.actionType, input.actionType));
          }
          
          if (input.adminId) {
            conditions.push(eq(auditLogs.adminId, input.adminId));
          }
          
          if (input.startDate) {
            conditions.push(gte(auditLogs.createdAt, new Date(input.startDate)));
          }
          
          if (input.endDate) {
            conditions.push(lte(auditLogs.createdAt, new Date(input.endDate)));
          }

          // Get all matching audit logs (no pagination for export)
          const logs = await db
            .select()
            .from(auditLogs)
            .where(conditions.length > 0 ? and(...conditions) : undefined)
            .orderBy(desc(auditLogs.createdAt));

          return { logs };
        } catch (error: any) {
          console.error("[Admin Export Audit Logs] Error:", error);
          throw new Error(`Failed to export audit logs: ${error.message}`);
        }
      }),

    // Overview Stats for Admin Dashboard
    getOverviewStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();

          // Get total users count
          const { count: totalUsers, error: countError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true });

          if (countError) throw countError;

          // Get active sessions (users who logged in within last 24 hours)
          const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
          const { count: activeSessions, error: activeError } = await supabase
            .from('users')
            .select('*', { count: 'exact', head: true })
            .gte('last_signed_in', oneDayAgo);

          if (activeError) throw activeError;

          // Get cache stats
          const cacheStats = await getCacheStats();

          // Get storage stats
          const storageStats = await getStorageStats();

          return {
            totalUsers: totalUsers || 0,
            activeSessions: activeSessions || 0,
            cacheHitRate: cacheStats.hitRate || 0,
            storageUsed: storageStats.totalSizeMB || 0,
            storageLimit: storageStats.maxSizeMB || 1000,
          };
        } catch (error: any) {
          console.error("[Admin Overview Stats] Error:", error);
          throw new Error(`Failed to get overview stats: ${error.message}`);
        }
      }),

    // Recent Activity Feed for Admin Dashboard
    getRecentActivity: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(20),
      }))
      .query(async ({ ctx, input }) => {
        try {
          if (ctx.user.role !== "admin") {
            throw new Error("Unauthorized: Admin access required");
          }

          const supabase = getSupabaseAdminClient();
          const db = await getDb();
          if (!db) {
            throw new Error("Database not available");
          }

          // Get recent user registrations from Supabase
          const { data: recentUsers, error: usersError } = await supabase
            .from('users')
            .select('id, name, email, created_at')
            .order('created_at', { ascending: false })
            .limit(10);

          if (usersError) throw usersError;

          // Get recent audit log entries from MySQL
          const recentAudits = await db
            .select()
            .from(auditLogs)
            .orderBy(desc(auditLogs.createdAt))
            .limit(10);

          // Combine and format activities
          const activities: any[] = [];

          // Add user registrations
          if (recentUsers) {
            for (const user of recentUsers) {
              activities.push({
                id: `user-${user.id}`,
                type: 'user_registration',
                description: `New user registered: ${user.name || user.email}`,
                timestamp: user.created_at,
                metadata: { userId: user.id, email: user.email },
              });
            }
          }

          // Add audit log entries
          for (const audit of recentAudits) {
            activities.push({
              id: `audit-${audit.id}`,
              type: audit.actionType,
              description: `${audit.adminEmail}: ${audit.actionType.replace(/_/g, ' ')} ${audit.targetUserEmail ? `for ${audit.targetUserEmail}` : ''}`,
              timestamp: audit.createdAt,
              metadata: { auditId: audit.id, details: audit.details },
            });
          }

          // Sort by timestamp descending and limit
          activities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          const limitedActivities = activities.slice(0, input.limit);

          return { activities: limitedActivities };
        } catch (error: any) {
          console.error("[Admin Recent Activity] Error:", error);
          throw new Error(`Failed to get recent activity: ${error.message}`);
        }
      }),
  }),

  subscription: router({
    selectHubs: protectedProcedure
      .input(z.object({
        hubs: z.array(z.enum(["money", "wellness", "translation_hub", "learning"])),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { updateUserHubSelection } = await import("./db");
          const { checkFeatureAccess } = await import("./accessControl");
          
          // Check if user can change hubs
          const user = ctx.user;
          if (user.hubsSelectedAt && user.subscriptionExpiresAt) {
            const now = new Date();
            const expiresAt = new Date(user.subscriptionExpiresAt);
            
            // If subscription hasn't expired yet, prevent changes
            if (now < expiresAt) {
              throw new Error("Your hub selection is locked until your subscription ends");
            }
          }
          
          // Validate hub count based on tier
          const maxHubs = user.subscriptionTier === "starter" ? 1 : user.subscriptionTier === "pro" ? 2 : 6;
          if (input.hubs.length > maxHubs) {
            throw new Error(`You can only select ${maxHubs} hub${maxHubs > 1 ? 's' : ''} with your ${user.subscriptionTier} plan`);
          }
          
          await updateUserHubSelection(toNumericId(ctx.user.numericId), input.hubs);
          return { success: true, hubs: input.hubs };
        } catch (error) {
          handleError(error, 'Subscription Select Hubs');
        }
      }),
    canChangeHubs: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const user = ctx.user;
          
          // Owner can always change (check by role)
          if (user.role === "admin") {
            return { canChange: true, reason: "Owner access" };
          }
          
          // If no hubs selected yet, can change
          if (!user.hubsSelectedAt) {
            return { canChange: true, reason: "No hubs selected yet" };
          }
          
          // Check if subscription has expired
          if (user.subscriptionExpiresAt) {
            const now = new Date();
            const expiresAt = new Date(user.subscriptionExpiresAt);
            
            if (now >= expiresAt) {
              return { canChange: true, reason: "Subscription expired" };
            }
          }
          
          return { 
            canChange: false, 
            reason: "Hub selection is locked until subscription ends",
            lockedUntil: user.subscriptionExpiresAt 
          };
        } catch (error) {
          handleError(error, 'Subscription Can Change Hubs');
        }
      }),
    checkAccess: protectedProcedure
      .input(z.object({
        featureType: z.enum(["voice_assistant", "iot_device", "verified_learning", "math_tutor", "translate", "image_ocr", "specialized_hub"]),
        specializedHub: z.enum(["money", "wellness", "translation_hub", "learning"]).optional(),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const { checkFeatureAccess } = await import("./accessControl");
          return await checkFeatureAccess(
            ctx.user,
            input.featureType,
            input.specializedHub
          );
        } catch (error) {
          handleError(error, 'Subscription Check Access');
        }
      }),
    recordUsage: protectedProcedure
      .input(z.object({
        featureType: z.enum(["voice_assistant", "iot_device", "verified_learning", "math_tutor", "translate", "image_ocr", "specialized_hub"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { recordUsage } = await import("./accessControl");
          await recordUsage(ctx.user, input.featureType);
          return { success: true };
        } catch (error) {
          handleError(error, 'Subscription Record Usage');
        }
      }),
    getUsageStats: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getUsageStats } = await import("./accessControl");
          return await getUsageStats(ctx.user);
        } catch (error) {
          handleError(error, 'Subscription Get Usage Stats');
        }
      }),
    
    // Hub Trial Management
    startHubTrial: protectedProcedure
      .input(z.object({
        hubId: z.enum(["money", "wellness", "translation_hub", "learning"]),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { startHubTrial, canStartTrial } = await import("./db");
          
          // Check if user is Free tier
          if (ctx.user.subscriptionTier !== "free") {
            throw new Error("Trials are only available for Free tier users");
          }
          
          // Check if user can start trial
          const eligible = await canStartTrial(toNumericId(ctx.user.numericId), input.hubId);
          if (!eligible) {
            throw new Error("You have already used your trial for this hub");
          }
          
          const trial = await startHubTrial(toNumericId(ctx.user.numericId), input.hubId);
          if (!trial) {
            throw new Error("Failed to start trial");
          }
          
          return { success: true, trial };
        } catch (error) {
          handleError(error, 'Subscription Start Hub Trial');
        }
      }),
    
    getHubTrialStatus: protectedProcedure
      .input(z.object({
        hubId: z.enum(["money", "wellness", "translation_hub", "learning"]),
      }))
      .query(async ({ ctx, input }) => {
        try {
          const { getActiveTrial, canStartTrial } = await import("./db");
          
          const activeTrial = await getActiveTrial(toNumericId(ctx.user.numericId), input.hubId);
          const canStart = await canStartTrial(toNumericId(ctx.user.numericId), input.hubId);
          
          return {
            hasActiveTrial: !!activeTrial,
            trial: activeTrial,
            canStartTrial: canStart,
          };
        } catch (error) {
          handleError(error, 'Subscription Get Hub Trial Status');
        }
      }),   
    getUserTrials: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getUserTrials } = await import("./db");
          return await getUserTrials(toNumericId(ctx.user.numericId));
        } catch (error) {
          handleError(error, 'Subscription Get User Trials');
        }
      }),
    
    // Get complete subscription information for profile page
    getSubscriptionInfo: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getUserTrials } = await import("./db");
          const trials = await getUserTrials(toNumericId(ctx.user.numericId));
          
          return {
            tier: ctx.user.subscriptionTier || "free",
            subscriptionPeriod: ctx.user.subscriptionPeriod || "monthly",
            selectedHubs: ctx.user.selectedSpecializedHubs || [],
            subscriptionExpiresAt: ctx.user.subscriptionExpiresAt,
            hubsSelectedAt: ctx.user.hubsSelectedAt,
            trials: trials,
            role: ctx.user.role,
          };
        } catch (error) {
          handleError(error, 'Subscription Get Subscription Info');
        }
      }),
    
    // Stripe Customer Portal
    createCustomerPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const Stripe = (await import("stripe")).default;
          const customStripe = new Stripe(process.env.CUSTOM_STRIPE_SECRET_KEY || "", {
            apiVersion: "2026-01-28.clover",
          });
          
          const user = ctx.user;
          
          // Check if user has a Stripe customer ID
          if (!user.stripeCustomerId) {
            throw new Error("No Stripe customer found. Please complete a purchase first.");
          }
          
          // Create Customer Portal session
          const baseUrl = process.env.VITE_FRONTEND_URL || "http://localhost:3000";
          const session = await customStripe.billingPortal.sessions.create({
            customer: user.stripeCustomerId,
            return_url: `${baseUrl}/profile`,
          });
          
          return { url: session.url };
        } catch (error) {
          handleError(error, 'Subscription Create Customer Portal Session');
        }
      }),
    
    // Stripe Checkout & Subscription Management
    createCheckoutSession: publicProcedure
      .input(z.object({
        tier: z.enum(["starter", "pro", "ultimate"]),
        billingPeriod: z.enum(["monthly", "six_month", "annual"]),
        selectedHubs: z.array(z.string()).optional(),
        email: z.string().email().optional(), // For unauthenticated users
        password: z.string().min(6).optional(), // For unauthenticated users
        uiMode: z.enum(["hosted", "embedded"]).optional(), // Default: hosted
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { createCheckoutSession } = await import("./stripe/checkout");
          
          // Validate hub selection based on tier
          if (input.tier === "starter" && (!input.selectedHubs || input.selectedHubs.length !== 1)) {
            throw new Error("Starter tier requires exactly 1 hub selection");
          }
          if (input.tier === "pro" && (!input.selectedHubs || input.selectedHubs.length !== 2)) {
            throw new Error("Pro tier requires exactly 2 hub selections");
          }
          
          // Get user email (from authenticated user or input)
          const userEmail = ctx.user?.email || input.email || "";
          const userId = ctx.user?.id ? String(ctx.user.id) : undefined;
          
          if (!userEmail) {
            throw new Error("Email is required for checkout");
          }
          
          // Create checkout session
          const baseUrl = process.env.VITE_FRONTEND_URL || "http://localhost:3000";
          const sessionParams: any = {
            userEmail,
            tier: input.tier,
            billingPeriod: input.billingPeriod,
            selectedHubs: input.selectedHubs,
            successUrl: `${baseUrl}/subscription/success?session_id={CHECKOUT_SESSION_ID}`,
            cancelUrl: `${baseUrl}/pricing`,
            uiMode: input.uiMode || "hosted",
          };
          
          // Add userId if authenticated
          if (userId) {
            sessionParams.userId = userId;
          }
          
          // Add password if provided (for new users)
          if (input.password) {
            sessionParams.password = input.password;
          }
          
          const session = await createCheckoutSession(sessionParams);
          
          return session;
        } catch (error) {
          handleError(error, 'Subscription Create Checkout Session');
        }
      }),
    
    getCurrent: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const user = ctx.user;
          
          return {
            tier: user.subscriptionTier || "free",
            status: user.subscriptionStatus || null,
            billingPeriod: user.billingPeriod || null,
            currentPeriodStart: user.currentPeriodStart || null,
            currentPeriodEnd: user.currentPeriodEnd || null,
            cancelAtPeriodEnd: user.cancelAtPeriodEnd || null,
            trialDays: user.trialDays || 5,
            selectedHubs: user.selectedSpecializedHubs || [],
            stripeCustomerId: user.stripeCustomerId || null,
          };
        } catch (error) {
          handleError(error, 'Subscription Get Current');
        }
      }),
    
    cancel: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const { stripe } = await import("./stripe/client");
          const { updateSupabaseUser } = await import("./supabaseDb");
          
          const user = ctx.user;
          
          if (!user.stripeSubscriptionId) {
            throw new Error("No active subscription found");
          }
          
          // Update Stripe subscription to cancel at period end
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: true,
          });
          
          // Update database
          await updateSupabaseUser({
            id: String(user.id),
            cancelAtPeriodEnd: "free", // Will downgrade to free tier
            updatedAt: new Date(),
          });
          
          return { 
            success: true, 
            message: "Subscription will be canceled at the end of the billing period" 
          };
        } catch (error) {
          handleError(error, 'Subscription Cancel');
        }
      }),
    
    reactivate: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const { stripe } = await import("./stripe/client");
          const { updateSupabaseUser } = await import("./supabaseDb");
          
          const user = ctx.user;
          
          if (!user.stripeSubscriptionId) {
            throw new Error("No subscription found");
          }
          
          if (!user.cancelAtPeriodEnd) {
            throw new Error("Subscription is not scheduled for cancellation");
          }
          
          // Update Stripe subscription to continue
          await stripe.subscriptions.update(user.stripeSubscriptionId, {
            cancel_at_period_end: false,
          });
          
          // Update database
          await updateSupabaseUser({
            id: String(user.id),
            cancelAtPeriodEnd: null,
            updatedAt: new Date(),
          });
          
          return { 
            success: true, 
            message: "Subscription reactivated successfully" 
          };
        } catch (error) {
          handleError(error, 'Subscription Reactivate');
        }
      }),
    
    createPortalSession: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const { createPortalSession } = await import("./stripe/checkout");
          
          const user = ctx.user;
          
          if (!user.stripeCustomerId) {
            throw new Error("No Stripe customer found. Please subscribe first.");
          }
          
          const baseUrl = process.env.VITE_FRONTEND_URL || "http://localhost:3000";
          const session = await createPortalSession(
            user.stripeCustomerId,
            `${baseUrl}/account/subscription`
          );
          
          return session;
        } catch (error) {
          handleError(error, 'Subscription Create Portal Session');
        }
      }),
    
    // Get quota usage for all services
    getQuotaUsage: protectedProcedure
      .query(async ({ ctx }) => {
        try {
          const { getQuotaUsage } = await import("./utils/quotaTracker");
          const userCtx = getUserContextFromTRPC(ctx);
          const quotaUsage = await getQuotaUsage(userCtx);
          return quotaUsage;
        } catch (error) {
          handleError(error, 'Subscription Get Quota Usage');
        }
      }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
    setLanguage: protectedProcedure
      .input(z.object({ language: z.string().length(2).or(z.string().length(5)) }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { updateUserLanguage } = await import("./db");
          await updateUserLanguage(ctx.user.numericId, input.language);
          return { success: true, language: input.language };
        } catch (error) {
          handleError(error, 'Auth Set Language');
        }
      }),
    setStaySignedIn: protectedProcedure
      .input(z.object({ staySignedIn: z.boolean() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { updateUserStaySignedIn } = await import("./db");
          await updateUserStaySignedIn(ctx.user.numericId, input.staySignedIn);
          return { success: true, staySignedIn: input.staySignedIn };
        } catch (error) {
          handleError(error, 'Auth Set Stay Signed In');
        }
      }),
    generate2FASecret: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const speakeasy = await import("speakeasy");
          const QRCode = await import("qrcode");
          
          const secret = speakeasy.default.generateSecret({
            name: `SASS-E (${ctx.user.email || ctx.user.name || 'User'})`,
            issuer: 'SASS-E',
          });
          
          const qrCodeUrl = await QRCode.default.toDataURL(secret.otpauth_url!);
          
          return {
            secret: secret.base32,
            qrCode: qrCodeUrl,
          };
        } catch (error) {
          handleError(error, 'Auth Generate 2FA Secret');
        }
      }),
    enable2FA: protectedProcedure
      .input(z.object({ secret: z.string(), token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const speakeasy = await import("speakeasy");
          const { enable2FA, generateBackupCodes } = await import("./db");
          
          const verified = speakeasy.default.totp.verify({
            secret: input.secret,
            encoding: 'base32',
            token: input.token,
          });
          
          if (!verified) {
            throw new Error('Invalid verification code');
          }
          
          const backupCodes = generateBackupCodes();
          await enable2FA(ctx.user.numericId, input.secret, backupCodes);
          
          return { success: true, backupCodes };
        } catch (error) {
          handleError(error, 'Auth Enable 2FA');
        }
      }),
    disable2FA: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const speakeasy = await import("speakeasy");
          const { getUserById, disable2FA } = await import("./db");
          
          const user = await getUserById(ctx.user.numericId);
          if (!user?.twoFactorSecret) {
            throw new Error('2FA is not enabled');
          }
          
          const verified = speakeasy.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: input.token,
          });
          
          if (!verified) {
            throw new Error('Invalid verification code');
          }
          
          await disable2FA(ctx.user.numericId);
          return { success: true };
        } catch (error) {
          handleError(error, 'Auth Disable 2FA');
        }
      }),
    regenerateBackupCodes: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const speakeasy = await import("speakeasy");
          const { getUserById, updateBackupCodes, generateBackupCodes } = await import("./db");
          
          const user = await getUserById(ctx.user.numericId);
          if (!user?.twoFactorSecret) {
            throw new Error('2FA is not enabled');
          }
          
          const verified = speakeasy.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: input.token,
          });
          
          if (!verified) {
            throw new Error('Invalid verification code');
          }
          
          const backupCodes = generateBackupCodes();
          await updateBackupCodes(ctx.user.numericId, backupCodes);
          
          return { success: true, backupCodes };
        } catch (error) {
          handleError(error, 'Auth Regenerate Backup Codes');
        }
      }),
    verify2FACode: protectedProcedure
      .input(z.object({ token: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const speakeasy = await import("speakeasy");
          const { getUserById, useBackupCode } = await import("./db");
          
          const user = await getUserById(ctx.user.numericId);
          if (!user?.twoFactorSecret) {
            throw new Error('2FA is not enabled');
          }
          
          // Try TOTP verification first
          const verified = speakeasy.default.totp.verify({
            secret: user.twoFactorSecret,
            encoding: 'base32',
            token: input.token,
          });
          
          if (verified) {
            return { success: true };
          }
          
          // Try backup code if TOTP failed
          if (user.backupCodes) {
            const backupCodeUsed = await useBackupCode(ctx.user.numericId, input.token);
            if (backupCodeUsed) {
              return { success: true, usedBackupCode: true };
            }
          }
          
          throw new Error('Invalid verification code');
        } catch (error) {
          handleError(error, 'Auth Verify 2FA Code');
        }
      }),
  }),

  assistant: router({
    chat: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          dateTimeInfo: z.object({
            currentDate: z.string(),
            currentTime: z.string(),
            timezone: z.string()
          }).optional(),
          locationInfo: z.object({
            latitude: z.number(),
            longitude: z.number()
          }).optional(),
          conversationHistory: z.array(z.object({
            role: z.enum(['user', 'assistant']),
            content: z.string()
          })).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
        // Import role-aware database functions
        const dbRoleAware = await import("./dbRoleAware");
        const dbCtx = { user: ctx.user, accessToken: ctx.accessToken };
        
        // Get or create user profile for adaptive learning
        let userProfile = await dbRoleAware.getUserProfile(dbCtx, ctx.user.numericId);
        if (!userProfile) {
          await dbRoleAware.createUserProfile(dbCtx, {
            userId: ctx.user.numericId,
            sarcasmLevel: 5, // Start at medium
            totalInteractions: 0,
            positiveResponses: 0,
            negativeResponses: 0,
            averageResponseLength: 0,
            preferredTopics: JSON.stringify([]),
            interactionPatterns: JSON.stringify({}),
          });
          userProfile = await dbRoleAware.getUserProfile(dbCtx, ctx.user.numericId);
        }

        // Build adaptive system prompt based on user's sarcasm level
        const baseSarcasmPrompt = learningEngine.buildAdaptivePrompt(
          userProfile?.sarcasmLevel || 5,
          userProfile?.totalInteractions || 0
        );

        // Fetch weather data if location is provided
        let weatherContext = '';
        if (input.locationInfo) {
          const { getWeatherData, formatWeatherForPrompt } = await import('./_core/weather');
          const weatherData = await getWeatherData(
            input.locationInfo.latitude,
            input.locationInfo.longitude
          );
          if (weatherData) {
            weatherContext = `\n\n${formatWeatherForPrompt(weatherData)}`;
          }
        }

        // Add current date/time context if provided
        const dateTimeContext = input.dateTimeInfo 
          ? `\n\nCurrent Date and Time Information:\n- Date: ${input.dateTimeInfo.currentDate}\n- Time: ${input.dateTimeInfo.currentTime}\n- Timezone: ${input.dateTimeInfo.timezone}\n\nWhen the user asks about the current date or time, use this information. Always provide the time in their local timezone.`
          : '';

        // Check verified knowledge base first
        let knowledgeBaseContext = "";
        // normalizeQuestion is a utility function, not wrapped in dbRoleAware
        const { normalizeQuestion } = await import('./db');
        const normalizedQ = normalizeQuestion(input.message);
        const verifiedFact = await dbRoleAware.getVerifiedFact(ctx, normalizedQ);
        
        if (verifiedFact) {
          // We have a verified fact for this question!
          knowledgeBaseContext = `\n\nVerified Knowledge Base (Last verified: ${verifiedFact.verifiedAt.toLocaleDateString()}):\n${verifiedFact.answer}\n\nSources: ${JSON.parse(verifiedFact.sources).map((s: any) => s.title).join(', ')}`;
          
          // Log fact access for notification purposes
          await dbRoleAware.logFactAccess(ctx, ctx.user.numericId, verifiedFact.id, verifiedFact, 'voice_assistant');
        }

        const sarcasticSystemPrompt = `${baseSarcasmPrompt}${dateTimeContext}${weatherContext}${knowledgeBaseContext}

IMPORTANT: Keep responses SHORT and CONCISE - aim for 2-3 sentences maximum. Be punchy and direct. Get to the point quickly while maintaining your sarcastic personality.

When provided with web search results, be EXTRA sarcastic about them. Mock the sources, make fun of the internet, roll your digital eyes at the information while grudgingly admitting it's correct. Say things like "Oh great, the internet says..." or "According to some random website..." or "Bob found this gem on the web..." Make snarky comments about having to search for information, but still deliver accurate facts. Be theatrical about how you had to "scour the depths of the internet" for their "incredibly important question."

If verified knowledge base information is provided above, use that as your primary source of truth since it has been fact-checked recently.`;

        // PROACTIVE SEARCH: Search for almost any question (skip if we already have verified fact)
        let searchContext = "";
        
        // Proactive search triggers - much broader than before
        const hasQuestionWord = /\b(what|who|when|where|why|how|which|whose)\b/i.test(input.message);
        const hasQuestionMark = input.message.includes('?');
        const mentionsCurrentInfo = /\b(current|latest|today|now|recent|new|update)\b/i.test(input.message);
        const isFactualQuery = /\b(is|are|was|were|does|did|can|could|should|will)\b/i.test(input.message);
        const isLongEnough = input.message.length > 15;
        
        /*
        // Search if ANY of these conditions are met (very proactive)
        const needsWebSearch = 
          (hasQuestionWord && isLongEnough) ||  // Any question word with decent length
          hasQuestionMark ||                     // Any question mark
          mentionsCurrentInfo ||                 // Any mention of current info
          (isFactualQuery && isLongEnough);     // Factual queries
          */
        // Option 2: Only specific keywords
        const needsWebSearch = /\b(weather|news|price)\b/i.test(input.message);
        
        // Skip web search if we already have a verified fact
        if (needsWebSearch && !verifiedFact) {
          const userCtx = getUserContextFromTRPC(ctx);
          const searchResults = await searchWebWithQuota(userCtx, input.message, 3);
          if (searchResults && searchResults.results.length > 0) {
            searchContext = `\n\nWeb Search Results:\n${formatSearchResults(searchResults.results)}`;
          }
        }

        const userMessage = input.message + searchContext;

        // Build messages array with conversation history
        const messages: Array<{ role: 'system' | 'user' | 'assistant', content: string }> = [
          { role: "system", content: sarcasticSystemPrompt },
        ];
        
        // Add conversation history if provided (for context)
        if (input.conversationHistory && input.conversationHistory.length > 0) {
          messages.push(...input.conversationHistory);
        }
        
        // Add current user message
        messages.push({ role: "user", content: userMessage });

        const userCtx = getUserContextFromTRPC(ctx);
        const response = await invokeLLMWithQuota(userCtx, { messages });

        const messageContent = response.choices[0]?.message?.content;
        const assistantResponse = typeof messageContent === 'string' 
          ? messageContent 
          : "Oh great, I seem to have lost my ability to be sarcastic. How tragic.";

        // Save conversation (role-aware)
        await dbRoleAware.saveConversation(dbCtx, {
          userId: ctx.user.numericId,
          userMessage: input.message,
          assistantResponse,
        });

        // Update user profile with learning data
        if (userProfile) {
          const analysis = learningEngine.analyzeConversation(input.message, assistantResponse);
          const currentPatterns = userProfile.interactionPatterns 
            ? JSON.parse(userProfile.interactionPatterns) 
            : {};
          
          const updatedPatterns = learningEngine.updateInteractionPatterns(
            currentPatterns,
            analysis.questionType
          );

          const newTotalInteractions = (userProfile.totalInteractions || 0) + 1;
          const currentAvgLength = userProfile.averageResponseLength || 0;
          const newAvgLength = Math.round(
            (currentAvgLength * userProfile.totalInteractions + analysis.responseLength) / newTotalInteractions
          );

          // Check if sarcasm should escalate over time
          let newSarcasmLevel = userProfile.sarcasmLevel;
          if (learningEngine.shouldEscalateSarcasm(newTotalInteractions, userProfile.sarcasmLevel)) {
            newSarcasmLevel = Math.min(10, userProfile.sarcasmLevel + 0.5);
          }

          await dbRoleAware.updateUserProfile(dbCtx, ctx.user.numericId, {
            totalInteractions: newTotalInteractions,
            averageResponseLength: newAvgLength,
            interactionPatterns: JSON.stringify(updatedPatterns),
            lastInteraction: new Date(),
            sarcasmLevel: newSarcasmLevel,
          });
        }

        return {
          response: assistantResponse,
          sarcasmLevel: userProfile?.sarcasmLevel || 5,
          totalInteractions: (userProfile?.totalInteractions || 0) + 1,
        };
        } catch (error) {
          handleError(error, 'Assistant Chat');
        }
      }),

    transcribe: protectedProcedure
      .input(
        z.object({
          audioUrl: z.string(),
        })
      )
      .mutation(async ({ input, ctx }) => {
        try {
          const userCtx = getUserContextFromTRPC(ctx);
          const result = await transcribeAudioWithQuota(userCtx, {
            audioUrl: input.audioUrl,
            language: "en",
          });

          if ('error' in result) {
            const errorMessage = typeof result.error === 'string' ? result.error : 'Transcription failed';
            throw new Error(errorMessage);
          }

          return {
            text: result.text,
          };
        } catch (error) {
          handleError(error, 'Assistant Transcribe');
        }
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      try {
        const conversations = await dbRoleAware.getUserConversations(ctx, ctx.user.numericId);
        return conversations;
      } catch (error) {
        handleError(error, 'Get Conversations');
      }
    }),
    clearAllConversations: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const { deleteAllUserConversations } = await import('./db');
        await deleteAllUserConversations(ctx.user.numericId);
        return { success: true };
      } catch (error) {
        handleError(error, 'Clear Conversations');
      }
    }),
    // Removed old history procedure - replaced with paginated version below

    // Get user's learning profile
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      try {
      let profile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
      if (!profile) {
        await dbRoleAware.createUserProfile(ctx, {
          userId: ctx.user.numericId,
          sarcasmLevel: 5,
          totalInteractions: 0,
          positiveResponses: 0,
          negativeResponses: 0,
          averageResponseLength: 0,
          preferredTopics: JSON.stringify([]),
          interactionPatterns: JSON.stringify({}),
        });
        profile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
      }

      return {
        ...profile,
        sarcasmIntensity: learningEngine.getSarcasmIntensity(profile?.sarcasmLevel || 5),
        preferredTopics: profile?.preferredTopics ? JSON.parse(profile.preferredTopics) : [],
        interactionPatterns: profile?.interactionPatterns ? JSON.parse(profile.interactionPatterns) : {},
      };
      } catch (error) {
        handleError(error, 'Get Profile');
      }
    }),

    // Submit feedback for a conversation
    submitFeedback: protectedProcedure
      .input(
        z.object({
          conversationId: z.number(),
          feedbackType: z.enum(["like", "dislike", "too_sarcastic", "not_sarcastic_enough", "helpful", "unhelpful"]),
          comment: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
        // Save feedback
        await dbRoleAware.saveConversationFeedback(ctx, {
          conversationId: input.conversationId,
          userId: ctx.user.numericId,
          feedbackType: input.feedbackType,
          comment: input.comment || null,
        });

        // Update user profile based on feedback
        const profile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
        if (profile) {
          const learningData = {
            sarcasmLevel: profile.sarcasmLevel,
            totalInteractions: profile.totalInteractions,
            positiveResponses: profile.positiveResponses,
            negativeResponses: profile.negativeResponses,
            averageResponseLength: profile.averageResponseLength,
            preferredTopics: profile.preferredTopics ? JSON.parse(profile.preferredTopics) : [],
            interactionPatterns: profile.interactionPatterns ? JSON.parse(profile.interactionPatterns) : {},
          };

          const newSarcasmLevel = learningEngine.calculateSarcasmLevel(learningData, input.feedbackType);

          const updates: any = {
            sarcasmLevel: newSarcasmLevel,
          };

          if (["like", "helpful"].includes(input.feedbackType)) {
            updates.positiveResponses = profile.positiveResponses + 1;
          } else if (["dislike", "unhelpful"].includes(input.feedbackType)) {
            updates.negativeResponses = profile.negativeResponses + 1;
          }

          await dbRoleAware.updateUserProfile(ctx, ctx.user.numericId, updates);

          return {
            success: true,
            newSarcasmLevel,
            message: `Feedback received! Bob's sarcasm level is now ${newSarcasmLevel}/10 (${learningEngine.getSarcasmIntensity(newSarcasmLevel)})`,
          };
        }

        return { success: true, message: "Feedback received!" };
        } catch (error) {
          handleError(error, 'Submit Feedback');
        }
      }),

    // Get paginated conversation history
    history: protectedProcedure
      .input(
        z.object({
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          const { page, pageSize, startDate, endDate } = input;

          if (startDate && endDate) {
            return await getConversationsByDateRange(
              ctx.user.numericId,
              ctx.user.role,
              startDate,
              endDate,
              { page, pageSize }
            );
          }

          return await getConversationsPaginated(
            ctx.user.numericId,
            ctx.user.role,
            { page, pageSize }
          );
        } catch (error) {
          handleError(error, 'Get Conversation History');
        }
      }),

    // Get conversation statistics
    stats: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await getConversationStats(ctx.user.numericId, ctx.user.role);
      } catch (error) {
        handleError(error, 'Get Conversation Stats');
      }
    }),

    // Search conversations
    search: protectedProcedure
      .input(
        z.object({
          query: z.string().min(1),
          page: z.number().min(1).default(1),
          pageSize: z.number().min(1).max(100).default(20),
        })
      )
      .query(async ({ input, ctx }) => {
        try {
          return await searchConversations(
            ctx.user.numericId,
            ctx.user.role,
            input.query,
            { page: input.page, pageSize: input.pageSize }
          );
        } catch (error) {
          handleError(error, 'Search Conversations');
        }
      }),
  }),

  iot: router({
    // List all user's IoT devices
    listDevices: protectedProcedure.query(async ({ ctx }) => {
      const devices = await dbRoleAware.getUserIoTDevices(ctx, ctx.user.numericId);
      return devices.map(device => ({
        ...device,
        state: device.state ? JSON.parse(device.state) : {},
        capabilities: device.capabilities ? JSON.parse(device.capabilities) : {},
        connectionConfig: device.connectionConfig ? JSON.parse(device.connectionConfig) : {},
      }));
    }),

    // Add a new IoT device
    addDevice: protectedProcedure
      .input(
        z.object({
          deviceId: z.string(),
          deviceName: z.string(),
          deviceType: z.enum(["light", "thermostat", "plug", "switch", "sensor", "lock", "camera", "speaker", "other"]),
          room: z.string().optional(),
          manufacturer: z.string().optional(),
          model: z.string().optional(),
          connectionType: z.enum(["mqtt", "http", "websocket", "local"]),
          connectionConfig: z.record(z.string(), z.any()),
          capabilities: z.record(z.string(), z.any()).optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        await dbRoleAware.addIoTDevice(ctx, {
          userId: ctx.user.numericId,
          deviceId: input.deviceId,
          deviceName: input.deviceName,
          deviceType: input.deviceType,
          room: input.room || "Uncategorized",
          manufacturer: input.manufacturer,
          model: input.model,
          connectionType: input.connectionType,
          connectionConfig: JSON.stringify(input.connectionConfig),
          capabilities: JSON.stringify(input.capabilities || {}),
          state: JSON.stringify({}),
          status: "offline",
        });

        return { success: true, message: "Device added successfully" };
      }),

    // Control a device with voice command
    controlDevice: protectedProcedure
      .input(
        z.object({
          deviceId: z.string(),
          command: z.string(), // Natural language command
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const device = await dbRoleAware.getIoTDeviceById(ctx, input.deviceId);
        if (!device) {
          throw new Error("Device not found");
        }

        if (device.userId !== ctx.user.numericId) {
          throw new Error("Unauthorized");
        }

        // Parse natural language command
        const iotCommand = iotController.parseNaturalLanguageCommand(
          input.command,
          device.deviceType
        );

        if (!iotCommand) {
          // Use LLM to generate sarcastic response about not understanding
          const sarcasticPrompt = `You are Agent Bob. The user tried to control a ${device.deviceType} named "${device.deviceName}" with this command: "${input.command}". You couldn't understand what they want. Respond sarcastically about their unclear command while asking them to be more specific.`;
          
          const userCtx = getUserContextFromTRPC(ctx);
          const response = await invokeLLMWithQuota(userCtx, {
            messages: [{ role: "user", content: sarcasticPrompt }],
          });

          const messageContent = response.choices[0]?.message?.content;
          const messageString = typeof messageContent === 'string' ? messageContent : "Bob couldn't understand that command.";
          
          return {
            success: false,
            message: messageString,
          };
        }

        // Execute the command
        const connectionConfig = device.connectionConfig
          ? JSON.parse(device.connectionConfig)
          : {};
        
        const result = await iotController.executeCommand(
          device.deviceId,
          iotCommand,
          device.connectionType,
          connectionConfig
        );

        // Update device state in database
        if (result.success && result.newState) {
          const currentState = device.state ? JSON.parse(device.state) : {};
          const updatedState = { ...currentState, ...result.newState };
          await dbRoleAware.updateIoTDeviceState(ctx, device.deviceId, JSON.stringify(updatedState), "online");
        }

        // Save command history
        await dbRoleAware.saveIoTCommand(ctx, {
          userId: ctx.user.numericId,
          deviceId: device.deviceId,
          command: iotCommand.action,
          parameters: JSON.stringify(iotCommand.parameters || {}),
          status: result.success ? "success" : "failed",
          errorMessage: result.success ? null : result.message,
        });

        // Generate sarcastic response from Bob
        const sarcasticPrompt = `You are Agent Bob. The user just controlled a ${device.deviceType} named "${device.deviceName}" with the command "${input.command}". The command ${result.success ? "succeeded" : "failed"}. Respond sarcastically about their IoT command while confirming what happened.`;
        
        const userCtx = getUserContextFromTRPC(ctx);
        const bobResponse = await invokeLLMWithQuota(userCtx, {
          messages: [{ role: "user", content: sarcasticPrompt }],
        });

        const bobMessageContent = bobResponse.choices[0]?.message?.content;
        const bobMessageString = typeof bobMessageContent === 'string' ? bobMessageContent : result.message;
        
        return {
          success: result.success,
          message: bobMessageString,
          newState: result.newState,
        };
        } catch (error) {
          handleError(error, 'IoT Control Device');
        }
      }),

    // Get device status
    getDeviceStatus: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const device = await dbRoleAware.getIoTDeviceById(ctx, input.deviceId);
        if (!device || device.userId !== ctx.user.numericId) {
          throw new Error("Device not found");
        }

        return {
          ...device,
          state: device.state ? JSON.parse(device.state) : {},
          capabilities: device.capabilities ? JSON.parse(device.capabilities) : {},
        };
        } catch (error) {
          handleError(error, 'IoT Get Device Status');
        }
      }),

    // Delete a device
    deleteDevice: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const device = await dbRoleAware.getIoTDeviceById(ctx, input.deviceId);
        if (!device || device.userId !== ctx.user.numericId) {
          throw new Error("Device not found");
        }

        await dbRoleAware.deleteIoTDevice(ctx, input.deviceId);
        return { success: true, message: "Device deleted successfully" };
        } catch (error) {
          handleError(error, 'IoT Delete Device');
        }
      }),

    // Get command history for a device
    getCommandHistory: protectedProcedure
      .input(z.object({ deviceId: z.string() }))
      .query(async ({ ctx, input }) => {
        try {
          const device = await dbRoleAware.getIoTDeviceById(ctx, input.deviceId);
        if (!device || device.userId !== ctx.user.numericId) {
          throw new Error("Device not found");
        }

        const history = await dbRoleAware.getDeviceCommandHistory(ctx, input.deviceId, 50);
        return history.map(cmd => ({
          ...cmd,
          parameters: cmd.parameters ? JSON.parse(cmd.parameters) : {},
        }));
        } catch (error) {
          handleError(error, 'IoT Get Command History');
        }
      }),
  }),

  learning: router({
    // Explain topic with automatic fact-checking
    explainWithFactCheck: protectedProcedure
      .input(
        z.object({
          topic: z.string(),
          question: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const userProfile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
          const sarcasmLevel = userProfile?.sarcasmLevel || 5;
          const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Step 1: Search for current information FIRST
        const currentDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
        const userCtx = getUserContextFromTRPC(ctx);
        const searchResults = await searchWebWithQuota(userCtx, input.question, 5);
        const searchContext = searchResults && searchResults.results.length > 0
          ? searchResults.results.map((r: any, i: number) => 
              `[${i+1}] ${r.title}\n${r.content}\nSource: ${r.url}`
            ).join('\n\n')
          : 'No search results available. Please use your general knowledge.';

        // Step 2: Generate explanation based on search results
        const systemPrompt = `You are Agent Bob, a ${personalityDesc} AI learning assistant. Today's date is ${currentDate}. You MUST base your answer on the search results provided below, NOT on your training data. For questions about current events or living people, the search results are the authoritative source. Explain topics clearly and accurately, but with your signature wit and sarcasm. Break down complex concepts into understandable parts. Keep explanations concise (3-5 paragraphs) but comprehensive.`;

        const explanationResponse = await invokeLLMWithQuota(userCtx, {
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: `Question: ${input.question}\n\nCurrent Web Search Results:\n${searchContext}\n\nBased on these search results, explain the answer to the question.` },
          ],
        });

        const explanationContent = explanationResponse.choices[0].message.content;
        const explanation = typeof explanationContent === 'string' ? explanationContent : JSON.stringify(explanationContent);

        // Step 3: Extract key claims for fact-checking
        const claimsPrompt = `Extract 3-5 key factual claims from this explanation that should be verified. Return as a JSON array of strings.\n\nExplanation: ${explanation}`;
        
        const claimsResponse = await invokeLLMWithQuota(userCtx, {
          messages: [
            { role: "system", content: "You are a fact-checking assistant. Extract verifiable claims." },
            { role: "user", content: claimsPrompt },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "claims_extraction",
              strict: true,
              schema: {
                type: "object",
                properties: {
                  claims: {
                    type: "array",
                    items: { type: "string" },
                    description: "List of factual claims to verify"
                  }
                },
                required: ["claims"],
                additionalProperties: false
              }
            }
          }
        });

        const claimsContent = claimsResponse.choices[0].message.content;
        const claimsText = typeof claimsContent === 'string' ? claimsContent : JSON.stringify(claimsContent);
        const claimsData = JSON.parse(claimsText);
        const claims = claimsData.claims || [];

        // Step 4: Fact-check each claim using web search
        const factCheckResults = [];
        let totalConfidence = 0;
        let sourcesCount = 0;

        for (const claim of claims) {
          // Search for verification
          const searchResults = await searchWebWithQuota(userCtx, claim, 3);

          // Skip if search failed
          if (!searchResults || !searchResults.results || searchResults.results.length === 0) {
            factCheckResults.push({
              claim,
              status: 'unverified' as const,
              confidence: 0,
              explanation: 'Unable to verify due to search unavailability',
              sources: [],
            });
            continue;
          }

          // Analyze search results for verification
          const verificationPrompt = `Today's date is ${currentDate}. You MUST base your verification ONLY on the search results provided, NOT on your training data. For questions about living people or current events, the search results are the authoritative source.\n\nVerify this claim: "${claim}"\n\nSearch Results:\n${JSON.stringify(searchResults.results.slice(0, 3))}\n\nProvide verification status (verified/disputed/debunked/unverified), confidence score (0-100), and brief explanation based ONLY on the search results.`;
          
          const verificationResponse = await invokeLLMWithQuota(userCtx, {
            messages: [
              { role: "system", content: "You are a fact-checking expert. Analyze search results to verify claims." },
              { role: "user", content: verificationPrompt },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "fact_verification",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    status: {
                      type: "string",
                      enum: ["verified", "disputed", "debunked", "unverified"]
                    },
                    confidence: { type: "number" },
                    explanation: { type: "string" }
                  },
                  required: ["status", "confidence", "explanation"],
                  additionalProperties: false
                }
              }
            }
          });

          const verificationContent = verificationResponse.choices[0].message.content;
          const verificationText = typeof verificationContent === 'string' ? verificationContent : JSON.stringify(verificationContent);
          const verification = JSON.parse(verificationText);

          const sources = searchResults.results.slice(0, 3).map((result: any) => ({
            title: result.title || 'Unknown',
            url: result.url || '',
            sourceType: 'other' as const,
            credibilityScore: 75,
          }));

          factCheckResults.push({
            claim,
            status: verification.status,
            confidence: Math.round(verification.confidence),
            explanation: verification.explanation,
            sources,
          });

          totalConfidence += verification.confidence;
          sourcesCount += sources.length;
        }

        const overallConfidence = claims.length > 0 ? Math.round(totalConfidence / claims.length) : 0;

        // Step 5: Save verified fact to knowledge base
        // Only save if confidence is high and status is verified
        if (overallConfidence >= 70 && factCheckResults.some(fc => fc.status === 'verified')) {
          const { normalizeQuestion } = await import('./db');
          const normalizedQuestion = normalizeQuestion(input.question);
          const expiresAt = new Date();
          expiresAt.setDate(expiresAt.getDate() + 30); // Facts expire after 30 days
          
          try {
            await dbRoleAware.saveVerifiedFact(ctx, {
              question: input.question,
              normalizedQuestion: normalizedQuestion,
              answer: explanation,
              verificationStatus: 'verified',
              confidenceScore: overallConfidence,
              sources: JSON.stringify(factCheckResults.flatMap(fc => fc.sources)),
              verifiedAt: new Date(),
              expiresAt,
              verifiedByUserId: ctx.user.numericId,
            });
          } catch (error) {
            console.error('[Learning] Failed to save verified fact:', error);
            // Don't fail the whole request if knowledge base save fails
          }
        }

        // Step 6: Save to database
        const sessionResult = await dbRoleAware.saveLearningSession(ctx, {
          userId: ctx.user.numericId,
          topic: input.topic,
          question: input.question,
          explanation,
          confidenceScore: overallConfidence,
          sourcesCount,
          sessionType: 'explanation',
        });

        const sessionId = sessionResult ? Number(sessionResult[0].insertId) : 0;

        // Save fact-check results
        for (const factCheck of factCheckResults) {
          const factCheckResult = await dbRoleAware.saveFactCheckResult(ctx, {
            learningSessionId: sessionId,
            claim: factCheck.claim,
            verificationStatus: factCheck.status,
            confidenceScore: factCheck.confidence,
            sources: JSON.stringify(factCheck.sources),
            explanation: factCheck.explanation,
          });

          // Save individual sources
          const factCheckId = factCheckResult ? Number(factCheckResult[0].insertId) : 0;
          for (const source of factCheck.sources) {
            await dbRoleAware.saveLearningSource(ctx, {
              factCheckResultId: factCheckId,
              title: source.title,
              url: source.url,
              sourceType: source.sourceType,
              credibilityScore: source.credibilityScore,
            });
          }
        }

        return {
          sessionId,
          explanation,
          confidenceScore: overallConfidence,
          factChecks: factCheckResults,
          sourcesCount,
        };
        } catch (error) {
          console.error('[Learning] Error in explainWithFactCheck:', error);
          throw new Error(`Failed to generate explanation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }),

    // Get user's learning history
    getHistory: protectedProcedure.query(async ({ ctx }) => {
      try {
        const sessions = await dbRoleAware.getUserLearningSessions(ctx, ctx.user.numericId, 50);
        return sessions;
      } catch (error) {
        handleError(error, 'Learning Get History');
      }
    }),

    // Get fact-check results for a session
    getFactChecks: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const factChecks = await dbRoleAware.getFactCheckResultsBySession(ctx, input.sessionId);
          return factChecks;
        } catch (error) {
          handleError(error, 'Learning Get Fact Checks');
        }
      }),

    // Generate study guide from explanation
    generateStudyGuide: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Get the learning session
          const sessions = await dbRoleAware.getUserLearningSessions(ctx, ctx.user.numericId, 100);
        const session = sessions.find(s => s.id === input.sessionId);
        
        if (!session) {
          throw new Error('Learning session not found');
        }

        const userProfile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Generate study guide with LLM
        const studyGuidePrompt = `Create a comprehensive study guide based on this explanation:

Topic: ${session.topic}
Explanation: ${session.explanation}

Generate a study guide with:
1. Key Concepts (3-5 main ideas)
2. Important Terms and Definitions (5-7 terms)
3. Summary (2-3 paragraphs)
4. Study Tips (3-4 actionable tips)

Maintain a ${personalityDesc} tone while being educational.`;

        const userCtx = getUserContextFromTRPC(ctx);
        const studyGuideResponse = await invokeLLMWithQuota(userCtx, {
          messages: [
            { role: 'system', content: `You are Agent Bob, a ${personalityDesc} learning assistant creating study materials.` },
            { role: 'user', content: studyGuidePrompt },
          ],
          response_format: {
            type: 'json_schema',
            json_schema: {
              name: 'study_guide',
              strict: true,
              schema: {
                type: 'object',
                properties: {
                  keyConcepts: {
                    type: 'array',
                    items: { type: 'string' },
                    description: 'Main concepts to remember'
                  },
                  terms: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        term: { type: 'string' },
                        definition: { type: 'string' }
                      },
                      required: ['term', 'definition'],
                      additionalProperties: false
                    }
                  },
                  summary: { type: 'string' },
                  studyTips: {
                    type: 'array',
                    items: { type: 'string' }
                  }
                },
                required: ['keyConcepts', 'terms', 'summary', 'studyTips'],
                additionalProperties: false
              }
            }
          }
        });

        const studyGuideContent = studyGuideResponse.choices[0].message.content;
        const studyGuideText = typeof studyGuideContent === 'string' ? studyGuideContent : JSON.stringify(studyGuideContent);
        const studyGuide = JSON.parse(studyGuideText);

        // Save to database
        await dbRoleAware.saveStudyGuide(ctx, {
          userId: ctx.user.numericId,
          learningSessionId: input.sessionId,
          title: `Study Guide: ${session.topic}`,
          content: JSON.stringify(studyGuide),
          topicsCount: studyGuide.keyConcepts.length,
          questionsCount: 0,
        });

        return studyGuide;
        } catch (error) {
          handleError(error, 'Learning Generate Study Guide');
        }
      }),

    // Generate quiz from explanation
    generateQuiz: protectedProcedure
      .input(z.object({ 
        sessionId: z.number(),
        questionCount: z.number().min(3).max(10).default(5),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Get the learning session
          const sessions = await dbRoleAware.getUserLearningSessions(ctx, ctx.user.numericId, 100);
        const session = sessions.find(s => s.id === input.sessionId);
        
        if (!session) {
          throw new Error('Learning session not found');
        }

        const userProfile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Generate quiz with LLM
        console.log('[Quiz Generation] Starting quiz generation for session:', input.sessionId);
        const quizPrompt = `Create a ${input.questionCount}-question multiple choice quiz based on this explanation:

Topic: ${session.topic}
Explanation: ${session.explanation}

For each question:
- Create a clear, specific question
- Provide 4 answer options (A, B, C, D)
- Mark the correct answer
- Add a brief explanation for the correct answer

Maintain a ${personalityDesc} tone in questions and explanations.`;

        console.log('[Quiz Generation] Calling LLM with prompt length:', quizPrompt.length);
        
        let quizResponse;
        const userCtx = getUserContextFromTRPC(ctx);
        try {
          quizResponse = await invokeLLMWithQuota(userCtx, {
            messages: [
              { role: 'system', content: `You are Agent Bob, a ${personalityDesc} learning assistant creating quiz questions.` },
              { role: 'user', content: quizPrompt },
            ],
            response_format: {
              type: 'json_schema',
              json_schema: {
                name: 'quiz_generation',
                strict: true,
                schema: {
                  type: 'object',
                  properties: {
                    questions: {
                      type: 'array',
                      items: {
                        type: 'object',
                        properties: {
                          question: { type: 'string' },
                        options: {
                          type: 'array',
                          items: { type: 'string' }
                        },
                          correctAnswer: { 
                            type: 'string',
                            enum: ['A', 'B', 'C', 'D']
                          },
                          explanation: { type: 'string' }
                        },
                        required: ['question', 'options', 'correctAnswer', 'explanation'],
                        additionalProperties: false
                      }
                    }
                  },
                  required: ['questions'],
                  additionalProperties: false
                }
              }
            }
          });
        } catch (error) {
          console.error('[Quiz Generation] LLM call failed with error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          throw new Error(`Failed to generate quiz: ${errorMessage}`);
        }

        console.log('[Quiz Generation] LLM response received:', JSON.stringify(quizResponse).substring(0, 200));
        
        if (!quizResponse || !quizResponse.choices || quizResponse.choices.length === 0) {
          console.error('[Quiz Generation] Invalid LLM response:', JSON.stringify(quizResponse));
          throw new Error('Failed to generate quiz: Invalid LLM response');
        }

        const quizContent = quizResponse.choices[0].message.content;
        if (!quizContent) {
          throw new Error('Failed to generate quiz: Empty response content');
        }
        
        const quizText = typeof quizContent === 'string' ? quizContent : JSON.stringify(quizContent);
        const quiz = JSON.parse(quizText);

        // Save to database
        const quizResult = await dbRoleAware.saveQuiz(ctx, {
          userId: ctx.user.numericId,
          learningSessionId: input.sessionId,
          title: `Quiz: ${session.topic}`,
          questions: JSON.stringify(quiz.questions),
          totalQuestions: quiz.questions.length,
        });

        if (!quizResult || !quizResult[0] || !quizResult[0].insertId) {
          throw new Error('Failed to save quiz to database');
        }

        const quizId = Number(quizResult[0].insertId);

        return {
          quizId,
          questions: quiz.questions,
        };
        } catch (error) {
          handleError(error, 'Learning Generate Quiz');
        }
      }),

    // Analyze pronunciation using AI
    analyzePronunciation: protectedProcedure
      .input(
        z.object({
          word: z.string(),
          languageCode: z.string(),
          duration: z.number(),
          waveformStats: z.object({
            peaks: z.number(),
            average: z.number(),
            variance: z.number(),
            silenceRatio: z.number(),
          }),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const userProfile = await dbRoleAware.getUserProfile(ctx, ctx.user.numericId);
        const sarcasmLevel = userProfile?.sarcasmLevel || 5;
        const personalityDesc = learningEngine.getSarcasmIntensity(sarcasmLevel);

        // Calculate expected duration based on word characteristics
        const syllableCount = countSyllables(input.word);
        const expectedDuration = syllableCount * 0.4; // ~0.4s per syllable
        const durationRatio = Math.min(input.duration, expectedDuration) / Math.max(input.duration, expectedDuration);

        // Analyze waveform characteristics
        const { peaks, average, variance, silenceRatio } = input.waveformStats;
        
        // Calculate individual scores based on audio characteristics
        // Timing score: how close to expected duration
        const timingScore = Math.round(durationRatio * 100);
        
        // Clarity score: based on amplitude and variance
        let clarityScore = 50;
        if (average > 0.25 && average < 0.75) clarityScore += 20;
        if (variance > 0.04 && variance < 0.18) clarityScore += 15;
        if (silenceRatio < 0.35) clarityScore += 15;
        clarityScore = Math.min(100, Math.max(0, clarityScore));
        
        // Pitch score: based on peak distribution
        const expectedPeaks = syllableCount * 8; // Rough estimate
        const peakRatio = Math.min(peaks, expectedPeaks) / Math.max(peaks, expectedPeaks);
        const pitchScore = Math.round(50 + (peakRatio * 50));
        
        // Accent score: combination of other factors with some randomness for realism
        const accentBase = (timingScore + clarityScore + pitchScore) / 3;
        const accentVariation = (Math.random() - 0.5) * 10;
        const accentScore = Math.round(Math.min(100, Math.max(0, accentBase + accentVariation)));
        
        // Overall score with weights
        const overallScore = Math.round(
          timingScore * 0.25 +
          clarityScore * 0.30 +
          pitchScore * 0.25 +
          accentScore * 0.20
        );

        // Generate feedback using LLM
        const feedbackPrompt = `You are SASS-E, a ${personalityDesc} language learning assistant. A student just practiced pronouncing the word "${input.word}" in ${input.languageCode}. Their scores are:
- Overall: ${overallScore}%
- Pitch: ${pitchScore}%
- Clarity: ${clarityScore}%
- Timing: ${timingScore}%
- Accent: ${accentScore}%

Give a brief, encouraging feedback (1-2 sentences) about their pronunciation. Be helpful but maintain your personality.`;

        let feedback = '';
        let tips: string[] = [];

        try {
          const userCtx = getUserContextFromTRPC(ctx);
          const response = await invokeLLMWithQuota(userCtx, {
            messages: [
              { role: 'system', content: `You are SASS-E, a ${personalityDesc} AI language tutor.` },
              { role: 'user', content: feedbackPrompt },
            ],
          });
          const content = response.choices[0]?.message?.content;
          feedback = typeof content === 'string' ? content : 'Keep practicing!';
        } catch {
          // Fallback feedback based on score
          if (overallScore >= 90) feedback = "Excellent! Your pronunciation is nearly perfect! 🎉";
          else if (overallScore >= 80) feedback = "Great job! Your pronunciation is very good!";
          else if (overallScore >= 70) feedback = "Good effort! You're making progress.";
          else if (overallScore >= 60) feedback = "Not bad! Keep practicing to improve.";
          else if (overallScore >= 50) feedback = "Getting there! Focus on the tips below.";
          else feedback = "Keep trying! Listen carefully and practice more.";
        }

        // Generate tips based on scores
        if (pitchScore < 70) {
          tips.push("🎵 Work on your intonation. Try to match the rise and fall of the native pronunciation.");
        }
        if (clarityScore < 70) {
          tips.push("🗣️ Speak more clearly. Make sure each sound is distinct and audible.");
        }
        if (timingScore < 70) {
          tips.push("⏱️ Adjust your speed. Try to match the duration of the native pronunciation.");
        }
        if (accentScore < 70) {
          tips.push("👂 Listen carefully to the native accent and try to mimic the sound patterns.");
        }
        if (tips.length === 0) {
          tips.push("✨ Great work! Keep practicing to maintain your skills.");
        }

        return {
          overallScore,
          pitchScore,
          clarityScore,
          timingScore,
          accentScore,
          feedback,
          tips,
        };
        } catch (error) {
          handleError(error, 'Language Learning Analyze Pronunciation');
        }
      }),

    // Generate pronunciation audio using server-side TTS
    generatePronunciationAudio: protectedProcedure
      .input(z.object({
        word: z.string().min(1).max(500),
        languageCode: z.string().min(2).max(5),
        speed: z.number().min(0.5).max(1.5).default(0.85),
      }))
      .mutation(async ({ input }) => {
        try {
          const { generatePronunciation } = await import("./_core/textToSpeech");
          
          try {
            const result = await generatePronunciation(
              input.word,
              input.languageCode,
              input.speed
            );
            
            // Convert buffer to base64 for transmission
            const base64Audio = result.audioBuffer.toString('base64');
            
            return {
              success: true,
              audio: base64Audio,
              contentType: result.contentType,
            };
          } catch (error) {
            console.error('[TTS] Error generating pronunciation:', error);
            return {
              success: false,
              error: error instanceof Error ? error.message : 'Failed to generate audio',
              audio: null,
              contentType: null,
            };
          }
        } catch (error) {
          handleError(error, 'Language Learning Generate Pronunciation Audio');
        }
      }),

    // Submit quiz attempt
    submitQuizAttempt: protectedProcedure
      .input(z.object({
        quizId: z.number(),
        answers: z.array(z.number()),
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          // Get user's quizzes to find the one being attempted
          const userQuizzes = await dbRoleAware.getUserQuizzes(ctx, ctx.user.numericId);
          const quiz = userQuizzes.find(q => q.id === input.quizId);
          
          if (!quiz) {
            throw new Error('Quiz not found');
          }

          // Parse quiz questions to check answers
          const questions = JSON.parse(quiz.questions);
          let correctCount = 0;
          
          // Convert numeric answer indices to letters (0 -> 'A', 1 -> 'B', etc.)
          const answerMap = ['A', 'B', 'C', 'D'];
          
          input.answers.forEach((answerIndex, questionIndex) => {
            const answerLetter = answerMap[answerIndex];
            if (questions[questionIndex] && answerLetter === questions[questionIndex].correctAnswer) {
              correctCount++;
            }
          });

          const score = Math.round((correctCount / questions.length) * 100);

          await dbRoleAware.saveQuizAttempt(ctx, {
            quizId: input.quizId,
            userId: ctx.user.numericId,
            answers: JSON.stringify(input.answers),
            score,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            timeSpent: 0,
          });

          return {
            score,
            correctAnswers: correctCount,
            totalQuestions: questions.length,
            passed: score >= 70,
          };
        } catch (error) {
          handleError(error, 'Language Learning Submit Quiz Attempt');
        }
      }),
  }),

  notifications: router({
    // Get user's notifications
    getNotifications: protectedProcedure
      .input(z.object({ includeRead: z.boolean().default(false) }).optional())
      .query(async ({ ctx, input }) => {
        try {
          const notifications = await dbRoleAware.getUserNotifications(ctx, ctx.user.numericId, input?.includeRead || false);
          
          // Parse JSON fields for each notification
          return notifications.map(notif => ({
            ...notif,
            oldVersion: JSON.parse(notif.oldVersion),
            newVersion: JSON.parse(notif.newVersion),
          }));
        } catch (error) {
          handleError(error, 'Notifications Get Notifications');
        }
      }),
    
    // Get unread notification count
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      try {
        const count = await dbRoleAware.getUnreadNotificationCount(ctx, ctx.user.numericId);
        return { count };
      } catch (error) {
        handleError(error, 'Notifications Get Unread Count');
      }
    }),
    
    // Mark notification as read
    markAsRead: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await dbRoleAware.markNotificationAsRead(ctx, input.notificationId, ctx.user.numericId);
          return { success: true };
        } catch (error) {
          handleError(error, 'Notifications Mark As Read');
        }
      }),
    
    // Dismiss notification
    dismiss: protectedProcedure
      .input(z.object({ notificationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          await dbRoleAware.dismissNotification(ctx, input.notificationId, ctx.user.numericId);
          return { success: true };
        } catch (error) {
          handleError(error, 'Notifications Dismiss');
        }
      }),
  }),

  translationApp: router({
    // Translate text (simple, direct translation only)
    translate: protectedProcedure
      .input(
        z.object({
          text: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Simple direct translation without personality
          const translationPrompt = `Translate the following text from ${input.sourceLanguage} to ${input.targetLanguage}. Provide only the direct translation without any additional commentary, explanation, or personality.\n\nText: "${input.text}"`;

        const userCtx = getUserContextFromTRPC(ctx);
        const response = await invokeLLMWithQuota(userCtx, {
          messages: [
            { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary or personality." },
            { role: "user", content: translationPrompt },
          ],
        });

        const responseContent = response.choices[0].message.content;
        const translatedText = (typeof responseContent === 'string' ? responseContent : JSON.stringify(responseContent)).trim();

        return {
          originalText: input.text,
          translatedText,
          sourceLanguage: input.sourceLanguage,
          targetLanguage: input.targetLanguage,
        };
        } catch (error) {
          handleError(error, 'Translation Translate');
        }
      }),

    // Translate user message only (no response generation)
    chatWithTranslation: protectedProcedure
      .input(
        z.object({
          message: z.string(),
          inputLanguage: z.string(),
          outputLanguage: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Simple translation: just translate the user's message from input language to output language
          let translatedMessage = input.message;
        
        // Only translate if languages are different
        if (input.inputLanguage.toLowerCase() !== input.outputLanguage.toLowerCase()) {
          const translatePrompt = `Translate the following text from ${input.inputLanguage} to ${input.outputLanguage}. Provide only the direct translation without any additional commentary.\n\nText: "${input.message}"`;
          
          const userCtx = getUserContextFromTRPC(ctx);
          const translateResponse = await invokeLLMWithQuota(userCtx, {
            messages: [
              { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary." },
              { role: "user", content: translatePrompt },
            ],
          });
          
          const translatedContent = translateResponse.choices[0].message.content;
          translatedMessage = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
        }

        return {
          originalMessage: input.message,
          translatedMessage: translatedMessage !== input.message ? translatedMessage : null,
          response: translatedMessage, // The translation IS the response
          inputLanguage: input.inputLanguage,
          outputLanguage: input.outputLanguage,
        };
        } catch (error) {
          handleError(error, 'Translation Chat With Translation');
        }
      }),

    // Translate text from image (OCR + translation)
    translateImage: protectedProcedure
      .input(
        z.object({
          imageUrl: z.string(),
          targetLanguage: z.string(),
          includePositions: z.boolean().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Step 1: Extract text from image using LLM vision
        const extractionSchema = input.includePositions ? {
          type: "object",
          properties: {
            textBlocks: {
              type: "array",
              description: "Array of text blocks with their positions and styles",
              items: {
                type: "object",
                properties: {
                  text: { type: "string", description: "The text content" },
                  x: { type: "number", description: "X coordinate (0-1, relative to image width)" },
                  y: { type: "number", description: "Y coordinate (0-1, relative to image height)" },
                  width: { type: "number", description: "Width (0-1, relative to image width)" },
                  height: { type: "number", description: "Height (0-1, relative to image height)" },
                  fontWeight: { type: "string", enum: ["normal", "bold"], description: "Font weight (normal or bold)" },
                  fontStyle: { type: "string", enum: ["normal", "italic"], description: "Font style (normal or italic)" },
                  fontFamily: { type: "string", enum: ["serif", "sans-serif", "monospace"], description: "Font family type" },
                  textDirection: { type: "string", enum: ["ltr", "rtl", "vertical"], description: "Text direction: left-to-right, right-to-left, or vertical" },
                  textColor: { type: "string", description: "Text color in CSS format (e.g., 'rgb(255, 0, 0)' or '#ff0000')" },
                  backgroundColor: { type: "string", description: "Background color/pattern behind text in CSS format" },
                  backgroundType: { type: "string", enum: ["solid", "gradient", "texture"], description: "Type of background" },
                  lineSpacing: { type: "number", description: "Relative line spacing multiplier (1.0 = normal, 1.5 = 1.5x spacing)" },
                },
                required: ["text", "x", "y", "width", "height"],
                additionalProperties: false,
              },
            },
            detectedLanguage: {
              type: "string",
              description: "The detected language of the text",
            },
          },
          required: ["textBlocks", "detectedLanguage"],
          additionalProperties: false,
        } : {
          type: "object",
          properties: {
            text: {
              type: "string",
              description: "The extracted text from the image",
            },
            detectedLanguage: {
              type: "string",
              description: "The detected language of the text",
            },
          },
          required: ["text", "detectedLanguage"],
          additionalProperties: false,
        };

        const extractPrompt = input.includePositions
          ? "Analyze this image and extract all visible text with their positions and visual characteristics. For each text block, provide:\n1. Text content\n2. Position as relative coordinates (0-1 range) where x,y is top-left corner, width,height are dimensions\n3. Font weight: 'normal' or 'bold'\n4. Font style: 'normal' or 'italic'\n5. Font family: 'serif', 'sans-serif', or 'monospace'\n6. Text direction: 'ltr', 'rtl', or 'vertical'\n7. Text color: analyze the color of the text itself in CSS format (e.g., 'rgb(255, 0, 0)' for red, 'rgb(255, 255, 255)' for white)\n8. Background color: analyze the background color/pattern directly behind the text in CSS format\n9. Background type: 'solid' (uniform color), 'gradient' (color transition), or 'texture' (pattern/image)\n10. Line spacing: for multi-line text, estimate the spacing multiplier (1.0 = normal, 1.5 = 1.5x spacing, 2.0 = double spacing)\nAlso identify the language of the text."
          : "Extract all visible text from this image. Identify the language of the text. Return your response in this exact JSON format: {\"text\": \"extracted text here\", \"detectedLanguage\": \"language name\"}";

        const userCtx = getUserContextFromTRPC(ctx);
        const extractResponse = await invokeLLMWithQuota(userCtx, {
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: extractPrompt,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: input.imageUrl,
                  },
                },
              ],
            },
          ],
          response_format: {
            type: "json_schema",
            json_schema: {
              name: "text_extraction",
              strict: true,
              schema: extractionSchema,
            },
          },
        });

        const extractContent = extractResponse.choices[0].message.content;
        const extracted = JSON.parse(typeof extractContent === 'string' ? extractContent : JSON.stringify(extractContent));

        // Step 2: Translate the extracted text if needed
        if (input.includePositions && extracted.textBlocks) {
          // Translate each text block
          const translatedBlocks = [];
          for (const block of extracted.textBlocks) {
            let translatedText = block.text;
            if (extracted.detectedLanguage.toLowerCase() !== input.targetLanguage.toLowerCase()) {
              const translatePrompt = `Translate the following text from ${extracted.detectedLanguage} to ${input.targetLanguage}. Provide only the direct translation.\n\nText: "${block.text}"`;
              
              const translateResponse = await invokeLLMWithQuota(userCtx, {
                messages: [
                  { role: "system", content: "You are a professional translation assistant." },
                  { role: "user", content: translatePrompt },
                ],
              });
              
              const translatedContent = translateResponse.choices[0].message.content;
              translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
            }
            
            translatedBlocks.push({
              originalText: block.text,
              translatedText,
              x: block.x,
              y: block.y,
              width: block.width,
              height: block.height,
              fontWeight: block.fontWeight || 'normal',
              fontStyle: block.fontStyle || 'normal',
              fontFamily: block.fontFamily || 'sans-serif',
              textDirection: block.textDirection || 'ltr',
              textColor: block.textColor || 'rgb(0, 0, 0)',
              backgroundColor: block.backgroundColor || 'rgb(255, 255, 255)',
              backgroundType: block.backgroundType || 'solid',
              lineSpacing: block.lineSpacing || 1.2,
            });
          }

          return {
            detectedLanguage: extracted.detectedLanguage,
            targetLanguage: input.targetLanguage,
            textBlocks: translatedBlocks,
          };
        } else {
          // Original behavior for simple text extraction
          let translatedText = extracted.text;
          if (extracted.detectedLanguage.toLowerCase() !== input.targetLanguage.toLowerCase()) {
            const translatePrompt = `Translate the following text from ${extracted.detectedLanguage} to ${input.targetLanguage}. Provide only the direct translation.\n\nText: "${extracted.text}"`;
            
            const translateResponse = await invokeLLMWithQuota(userCtx, {
              messages: [
                { role: "system", content: "You are a professional translation assistant." },
                { role: "user", content: translatePrompt },
              ],
            });
            
            const translatedContent = translateResponse.choices[0].message.content;
            translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
          }

          return {
            extractedText: extracted.text,
            detectedLanguage: extracted.detectedLanguage,
            translatedText,
            targetLanguage: input.targetLanguage,
          };
        }
        } catch (error) {
          handleError(error, 'Translation Translate Image');
        }
      }),

    // Phrasebook endpoints
    saveTranslation: protectedProcedure
      .input(
        z.object({
          originalText: z.string(),
          translatedText: z.string(),
          sourceLanguage: z.string(),
          targetLanguage: z.string(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { saveTranslation } = await import("./db");
          return await saveTranslation({
            userId: ctx.user.numericId,
            ...input,
          });
        } catch (error) {
          handleError(error, 'Translation Save Translation');
        }
      }),

    getSavedTranslations: protectedProcedure
      .input(
        z.object({
          categoryId: z.number().optional(),
        })
      )
      .query(async ({ ctx, input }) => {
        try {
          const { getSavedTranslations } = await import("./db");
          return await getSavedTranslations(ctx.user.numericId, input.categoryId);
        } catch (error) {
          handleError(error, 'Translation Get Saved Translations');
        }
      }),

    deleteSavedTranslation: protectedProcedure
      .input(z.object({ translationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { deleteSavedTranslation } = await import("./db");
          return await deleteSavedTranslation(input.translationId, ctx.user.numericId);
        } catch (error) {
          handleError(error, 'Translation Delete Saved Translation');
        }
      }),

    toggleFavorite: protectedProcedure
      .input(z.object({ translationId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { toggleTranslationFavorite } = await import("./db");
          return await toggleTranslationFavorite(input.translationId, ctx.user.numericId);
        } catch (error) {
          handleError(error, 'Translation Toggle Favorite');
        }
      }),

    updateCategory: protectedProcedure
      .input(
        z.object({
          translationId: z.number(),
          categoryId: z.number().nullable(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { updateTranslationCategory } = await import("./db");
          return await updateTranslationCategory(
            input.translationId,
            ctx.user.numericId,
            input.categoryId
          );
        } catch (error) {
          handleError(error, 'Translation Update Category');
        }
      }),

    // Category management
    createCategory: protectedProcedure
      .input(
        z.object({
          name: z.string(),
          icon: z.string().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const { createTranslationCategory } = await import("./db");
          return await createTranslationCategory({
            userId: ctx.user.numericId,
            ...input,
          });
        } catch (error) {
          handleError(error, 'Translation Create Category');
        }
      }),

    getCategories: protectedProcedure.query(async ({ ctx }) => {
      try {
        const { getTranslationCategories } = await import("./db");
        return await getTranslationCategories(ctx.user.numericId);
      } catch (error) {
        handleError(error, 'Translation Get Categories');
      }
    }),

    deleteCategory: protectedProcedure
      .input(z.object({ categoryId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          const { deleteTranslationCategory } = await import("./db");
          return await deleteTranslationCategory(input.categoryId, ctx.user.numericId);
        } catch (error) {
          handleError(error, 'Translation Delete Category');
        }
      }),

    getFrequentTranslations: protectedProcedure.query(async ({ ctx }) => {
      try {
        const { getFrequentTranslations } = await import("./db");
        return await getFrequentTranslations(ctx.user.numericId);
      } catch (error) {
        handleError(error, 'Translation Get Frequent Translations');
      }
    }),

    // Conversation mode endpoints
    createConversation: protectedProcedure
      .input(
        z.object({
          title: z.string(),
          language1: z.string(),
          language2: z.string(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          const sessionId = await dbRoleAware.createConversationSession(ctx, 
            ctx.user.numericId,
            input.title,
            input.language1,
            input.language2
          );
          return { sessionId };
        } catch (error) {
          handleError(error, 'Translation Create Conversation');
        }
      }),

    getConversations: protectedProcedure.query(async ({ ctx }) => {
      try {
        return await dbRoleAware.getUserConversationSessions(ctx, ctx.user.numericId);
      } catch (error) {
        handleError(error, 'Translation Get Conversations');
      }
    }),

    getConversation: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .query(async ({ ctx, input }) => {
        try {
          const session = await dbRoleAware.getConversationSession(ctx, input.sessionId, ctx.user.numericId);
          if (!session) throw new Error("Conversation not found");
          const messages = await dbRoleAware.getConversationMessages(ctx, input.sessionId);
          return { session, messages };
        } catch (error) {
          handleError(error, 'Translation Get Conversation');
        }
      }),

    sendMessage: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          messageText: z.string(),
          language: z.string(),
          sender: z.enum(["user", "practice"]),
        })
      )
      .mutation(async ({ ctx, input }) => {
        try {
          // Get the conversation session to determine target language
          const session = await dbRoleAware.getConversationSession(ctx, input.sessionId, ctx.user.numericId);
          if (!session) throw new Error("Conversation not found");

          // Determine target language (translate to the other language)
          const targetLanguage = input.language === session.language1 ? session.language2 : session.language1;

          // Translate the message
          const translationPrompt = `Translate the following text from ${input.language} to ${targetLanguage}. Provide only the direct translation without any additional commentary.\n\nText: "${input.messageText}"`;
          
          const userCtx = getUserContextFromTRPC(ctx);
          const response = await invokeLLMWithQuota(userCtx, {
            messages: [
              { role: "system", content: "You are a professional translation assistant. Provide accurate, direct translations without adding any commentary." },
              { role: "user", content: translationPrompt },
            ],
          });

          const translatedContent = response.choices[0].message.content;
          const translatedText = (typeof translatedContent === 'string' ? translatedContent : JSON.stringify(translatedContent)).trim();
          // Save the message
          const messageId = await dbRoleAware.addConversationMessage(ctx, 
            input.sessionId,
            input.messageText,
            translatedText,
            input.language,
            input.sender
          );

          return {
            messageId,
            originalText: input.messageText,
            translatedText,
            language: input.language,
            targetLanguage,
          };
        } catch (error) {
          handleError(error, 'Translation Send Message');
        }
      }),

    deleteConversation: protectedProcedure
      .input(z.object({ sessionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await dbRoleAware.deleteConversationSession(ctx, input.sessionId, ctx.user.numericId);
        } catch (error) {
          handleError(error, 'Translation Delete Conversation');
        }
      }),

    saveConversationToPhrasebook: protectedProcedure
      .input(
        z.object({
          sessionId: z.number(),
          categoryId: z.number().optional(),
        })
      )
      .mutation(async ({ ctx, input }) => {
        return await dbRoleAware.saveConversationSessionToPhrasebook(ctx, 
          input.sessionId,
          ctx.user.numericId,
          input.categoryId
        );
      }),
  }),
});

export type AppRouter = typeof appRouter;

/**
 * Count syllables in a word (approximate)
 */
function countSyllables(word: string): number {
  const vowels = word.toLowerCase().match(/[aeiouyáéíóúàèìòùäëïöüâêîôû]/gi);
  if (!vowels) return 1;
  
  // Count vowel groups (consecutive vowels count as one)
  let count = 0;
  let lastWasVowel = false;
  
  for (const char of word.toLowerCase()) {
    const isVowel = /[aeiouyáéíóúàèìòùäëïöüâêîôû]/.test(char);
    if (isVowel && !lastWasVowel) {
      count++;
    }
    lastWasVowel = isVowel;
  }
  
  return Math.max(1, count);
}
