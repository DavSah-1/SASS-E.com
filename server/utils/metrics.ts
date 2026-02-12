import { getDb } from '../db';
import { performanceMetrics, apiUsageLogs, errorLogs } from '../../drizzle/schema';
import { sql, and, gte, eq } from 'drizzle-orm';

interface Metric {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
  userId?: number;
}

/**
 * Metrics Collector
 * Stores performance metrics in database for persistence
 */
class MetricsCollector {
  /**
   * Record a performance metric
   */
  async record(name: string, value: number, tags?: Record<string, string>, userId?: number) {
    try {
      const db = await getDb();
      if (!db) return;

      await db.insert(performanceMetrics).values({
        name,
        value,
        tags: tags ? JSON.stringify(tags) : null,
        userId: userId || null,
      });
    } catch (error) {
      console.error('Failed to record metric:', error);
    }
  }

  /**
   * Get metrics from database
   */
  async getMetrics(name?: string, since?: Date): Promise<Metric[]> {
    try {
      const db = await getDb();
      if (!db) return [];

      const conditions = [];
      if (name) {
        conditions.push(eq(performanceMetrics.name, name));
      }
      if (since) {
        conditions.push(gte(performanceMetrics.timestamp, since));
      }

      const results = await db
        .select()
        .from(performanceMetrics)
        .where(conditions.length > 0 ? and(...conditions) : undefined)
        .orderBy(performanceMetrics.timestamp)
        .limit(10000);

      return results.map(r => ({
        name: r.name,
        value: r.value,
        timestamp: r.timestamp,
        tags: r.tags ? JSON.parse(r.tags) : undefined,
        userId: r.userId || undefined,
      }));
    } catch (error) {
      console.error('Failed to get metrics:', error);
      return [];
    }
  }

  /**
   * Get statistical analysis of metrics
   */
  async getStats(name: string, since?: Date) {
    try {
      const metrics = await this.getMetrics(name, since);
      const values = metrics.map((m) => m.value);

      if (values.length === 0) {
        return null;
      }

      const sum = values.reduce((a, b) => a + b, 0);
      const avg = sum / values.length;
      const sorted = [...values].sort((a, b) => a - b);
      const p50 = sorted[Math.floor(sorted.length * 0.5)];
      const p95 = sorted[Math.floor(sorted.length * 0.95)];
      const p99 = sorted[Math.floor(sorted.length * 0.99)];

      return {
        count: values.length,
        sum,
        avg: Math.round(avg * 100) / 100,
        min: Math.min(...values),
        max: Math.max(...values),
        p50,
        p95,
        p99,
      };
    } catch (error) {
      console.error('Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Clear old metrics (older than specified days)
   */
  async clearOldMetrics(daysToKeep: number = 30) {
    try {
      const db = await getDb();
      if (!db) return 0;

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

      await db
        .delete(performanceMetrics)
        .where(sql`${performanceMetrics.timestamp} < ${cutoffDate}`);

      return 0; // Return 0 as we can't easily get affected rows count
    } catch (error) {
      console.error('Failed to clear old metrics:', error);
      return 0;
    }
  }
}

export const metrics = new MetricsCollector();

/**
 * Helper to measure async function execution time
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>,
  tags?: Record<string, string>,
  userId?: number
): Promise<T> {
  const start = Date.now();
  try {
    const result = await fn();
    const duration = Date.now() - start;
    await metrics.record(name, duration, { ...tags, status: 'success' }, userId);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    await metrics.record(name, duration, { ...tags, status: 'error' }, userId);
    throw error;
  }
}

/**
 * Measure sync function execution time
 */
export function measure<T>(
  name: string,
  fn: () => T,
  tags?: Record<string, string>,
  userId?: number
): T {
  const start = Date.now();
  try {
    const result = fn();
    const duration = Date.now() - start;
    metrics.record(name, duration, { ...tags, status: 'success' }, userId);
    return result;
  } catch (error) {
    const duration = Date.now() - start;
    metrics.record(name, duration, { ...tags, status: 'error' }, userId);
    throw error;
  }
}

/**
 * Log API usage to database
 */
export async function logApiUsage(params: {
  apiName: string;
  endpoint?: string;
  method?: string;
  statusCode?: number;
  duration?: number;
  quotaUsed?: number;
  userId?: number;
  success: boolean;
  errorMessage?: string;
}) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(apiUsageLogs).values({
      apiName: params.apiName,
      endpoint: params.endpoint || null,
      method: params.method || null,
      statusCode: params.statusCode || null,
      duration: params.duration || null,
      quotaUsed: params.quotaUsed || 1,
      userId: params.userId || null,
      success: params.success,
      errorMessage: params.errorMessage || null,
    });
  } catch (error) {
    console.error('Failed to log API usage:', error);
  }
}

/**
 * Log error to database
 */
export async function logError(params: {
  errorType: string;
  message: string;
  stack?: string;
  context?: string;
  metadata?: Record<string, any>;
  userId?: number;
}) {
  try {
    const db = await getDb();
    if (!db) return;

    await db.insert(errorLogs).values({
      errorType: params.errorType,
      message: params.message,
      stack: params.stack || null,
      context: params.context || null,
      metadata: params.metadata ? JSON.stringify(params.metadata) : null,
      userId: params.userId || null,
      resolved: false,
    });
  } catch (error) {
    console.error('Failed to log error:', error);
  }
}
