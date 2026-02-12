import { getDb } from '../db';
import { getSupabaseAdminClient } from '../supabaseClient';
import { conversations, cleanupLogs, type InsertCleanupLog } from '../../drizzle/schema';
import { type InsertSupabaseCleanupLog } from '../supabaseDb';
import { lt, and, isNotNull, asc, eq } from 'drizzle-orm';
import { S3Client, DeleteObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import cron from 'node-cron';

// Environment configuration
const AUDIO_RETENTION_DAYS = parseInt(process.env.AUDIO_RETENTION_DAYS || '7', 10);
const AUDIO_MAX_STORAGE_MB = parseInt(process.env.AUDIO_MAX_STORAGE_MB || '1000', 10);

// S3 configuration (from storage.ts)
const S3_REGION = process.env.S3_REGION || 'us-east-1';
const S3_BUCKET = process.env.S3_BUCKET || '';
const S3_ACCESS_KEY = process.env.S3_ACCESS_KEY_ID || '';
const S3_SECRET_KEY = process.env.S3_SECRET_ACCESS_KEY || '';

// Initialize S3 client
const s3Client = new S3Client({
  region: S3_REGION,
  credentials: {
    accessKeyId: S3_ACCESS_KEY,
    secretAccessKey: S3_SECRET_KEY,
  },
});

interface CleanupResult {
  filesDeleted: number;
  spaceFreedMB: number;
  errors: string[];
  executionTimeMs: number;
}

/**
 * Extract S3 key from full S3 URL
 * Example: https://bucket.s3.region.amazonaws.com/path/to/file.webm → path/to/file.webm
 */
function extractS3Key(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Remove leading slash from pathname
    return urlObj.pathname.substring(1);
  } catch (error) {
    console.error(`[Audio Cleanup] Invalid URL: ${url}`, error);
    return null;
  }
}

/**
 * Get file size from S3 (in MB)
 */
async function getS3FileSize(key: string): Promise<number> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: key,
      MaxKeys: 1,
    });
    
    const response = await s3Client.send(command);
    const file = response.Contents?.[0];
    
    if (!file || !file.Size) {
      return 0;
    }
    
    return file.Size / (1024 * 1024); // Convert bytes to MB
  } catch (error) {
    console.error(`[Audio Cleanup] Failed to get file size for ${key}:`, error);
    return 0;
  }
}

/**
 * Delete file from S3
 */
async function deleteFromS3(key: string): Promise<boolean> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: S3_BUCKET,
      Key: key,
    });
    
    await s3Client.send(command);
    return true;
  } catch (error) {
    console.error(`[Audio Cleanup] Failed to delete ${key} from S3:`, error);
    return false;
  }
}

/**
 * Clean up old audio files based on age (both Manus and Supabase databases)
 */
export async function cleanupOldAudioFiles(triggeredBy?: number | string): Promise<CleanupResult> {
  const startTime = Date.now();
  const result: CleanupResult = {
    filesDeleted: 0,
    spaceFreedMB: 0,
    errors: [],
    executionTimeMs: 0,
  };

  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - AUDIO_RETENTION_DAYS);

    // Clean up from Manus database (admin conversations)
    const manusDb = await getDb();
    if (manusDb) {
      try {
        const oldConversations = await manusDb
          .select()
          .from(conversations)
          .where(
            and(
              lt(conversations.createdAt, cutoffDate),
              isNotNull(conversations.audioUrl)
            )
          );

        for (const conv of oldConversations) {
          if (!conv.audioUrl) continue;
          
          const s3Key = extractS3Key(conv.audioUrl);
          if (!s3Key) {
            result.errors.push(`Invalid URL format: ${conv.audioUrl}`);
            continue;
          }

          // Get file size before deletion
          const fileSizeMB = await getS3FileSize(s3Key);

          // Delete from S3
          const deleted = await deleteFromS3(s3Key);
          if (!deleted) {
            result.errors.push(`Failed to delete S3 file: ${s3Key}`);
            continue;
          }

          // Update database (set audioUrl to null)
          await manusDb
            .update(conversations)
            .set({ audioUrl: null })
            .where(eq(conversations.id, conv.id));

          result.filesDeleted++;
          result.spaceFreedMB += fileSizeMB;
        }
      } catch (error: any) {
        result.errors.push(`Manus DB cleanup error: ${error.message}`);
      }
    }

    // Clean up from Supabase database (regular user conversations)
    const supabase = getSupabaseAdminClient();
    if (supabase) {
      try {
        const { data: oldConversations, error } = await supabase
          .from('conversations')
          .select('*')
          .lt('created_at', cutoffDate.toISOString())
          .not('audio_url', 'is', null);

        if (error) {
          result.errors.push(`Supabase query error: ${error.message}`);
        } else if (oldConversations) {
          for (const conv of oldConversations) {
            if (!conv.audio_url) continue;

            const s3Key = extractS3Key(conv.audio_url);
            if (!s3Key) {
              result.errors.push(`Invalid URL format: ${conv.audio_url}`);
              continue;
            }

            // Get file size before deletion
            const fileSizeMB = await getS3FileSize(s3Key);

            // Delete from S3
            const deleted = await deleteFromS3(s3Key);
            if (!deleted) {
              result.errors.push(`Failed to delete S3 file: ${s3Key}`);
              continue;
            }

            // Update database (set audio_url to null)
            await supabase
              .from('conversations')
              .update({ audio_url: null })
              .eq('id', conv.id);

            result.filesDeleted++;
            result.spaceFreedMB += fileSizeMB;
          }
        }
      } catch (error: any) {
        result.errors.push(`Supabase cleanup error: ${error.message}`);
      }
    }

    result.executionTimeMs = Date.now() - startTime;

    // Log cleanup to database
    await logCleanup('age_based', result, triggeredBy);

    console.log(`[Audio Cleanup] Age-based cleanup complete: ${result.filesDeleted} files deleted, ${result.spaceFreedMB.toFixed(2)}MB freed`);

  } catch (error: any) {
    console.error('[Audio Cleanup] Age-based cleanup failed:', error);
    result.errors.push(`Cleanup error: ${error.message}`);
    result.executionTimeMs = Date.now() - startTime;
  }

  return result;
}

/**
 * Clean up audio files when storage limit is exceeded
 */
export async function cleanupByStorageLimit(triggeredBy?: number | string): Promise<CleanupResult> {
  const startTime = Date.now();
  const result: CleanupResult = {
    filesDeleted: 0,
    spaceFreedMB: 0,
    errors: [],
    executionTimeMs: 0,
  };

  try {
    // Calculate total storage used by listing all audio files in S3
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: 'audio/', // Assuming audio files are stored under 'audio/' prefix
    });

    const listResponse = await s3Client.send(listCommand);
    let totalSizeMB = 0;

    if (listResponse.Contents) {
      for (const file of listResponse.Contents) {
        totalSizeMB += (file.Size || 0) / (1024 * 1024);
      }
    }

    console.log(`[Audio Cleanup] Current storage: ${totalSizeMB.toFixed(2)}MB / ${AUDIO_MAX_STORAGE_MB}MB`);

    if (totalSizeMB <= AUDIO_MAX_STORAGE_MB) {
      result.executionTimeMs = Date.now() - startTime;
      return result; // Under limit, no cleanup needed
    }

    // Delete oldest files until under limit (80% to leave buffer)
    const targetSizeMB = AUDIO_MAX_STORAGE_MB * 0.8;

    // Get oldest conversations from Manus DB
    const manusDb = await getDb();
    if (manusDb) {
      const oldConversations = await manusDb
        .select()
        .from(conversations)
        .where(isNotNull(conversations.audioUrl))
        .orderBy(asc(conversations.createdAt));

      for (const conv of oldConversations) {
        if (totalSizeMB <= targetSizeMB) break;
        if (!conv.audioUrl) continue;

        const s3Key = extractS3Key(conv.audioUrl);
        if (!s3Key) continue;

        const fileSizeMB = await getS3FileSize(s3Key);
        const deleted = await deleteFromS3(s3Key);

        if (deleted) {
          await manusDb
            .update(conversations)
            .set({ audioUrl: null })
            .where(eq(conversations.id, conv.id));

          totalSizeMB -= fileSizeMB;
          result.filesDeleted++;
          result.spaceFreedMB += fileSizeMB;
        }
      }
    }

    // Get oldest conversations from Supabase DB
    const supabase = getSupabaseAdminClient();
    if (supabase && totalSizeMB > targetSizeMB) {
      const { data: oldConversations } = await supabase
        .from('conversations')
        .select('*')
        .not('audio_url', 'is', null)
        .order('created_at', { ascending: true });

      if (oldConversations) {
        for (const conv of oldConversations) {
          if (totalSizeMB <= targetSizeMB) break;
          if (!conv.audio_url) continue;

          const s3Key = extractS3Key(conv.audio_url);
          if (!s3Key) continue;

          const fileSizeMB = await getS3FileSize(s3Key);
          const deleted = await deleteFromS3(s3Key);

          if (deleted) {
            await supabase
              .from('conversations')
              .update({ audio_url: null })
              .eq('id', conv.id);

            totalSizeMB -= fileSizeMB;
            result.filesDeleted++;
            result.spaceFreedMB += fileSizeMB;
          }
        }
      }
    }

    result.executionTimeMs = Date.now() - startTime;

    // Log cleanup to database
    await logCleanup('storage_based', result, triggeredBy);

    console.log(`[Audio Cleanup] Storage-based cleanup complete: ${result.filesDeleted} files deleted, ${result.spaceFreedMB.toFixed(2)}MB freed`);

  } catch (error: any) {
    console.error('[Audio Cleanup] Storage-based cleanup failed:', error);
    result.errors.push(`Cleanup error: ${error.message}`);
    result.executionTimeMs = Date.now() - startTime;
  }

  return result;
}

/**
 * Get storage statistics
 */
export async function getStorageStats(): Promise<{
  totalFiles: number;
  totalSizeMB: number;
  maxSizeMB: number;
  percentUsed: number;
}> {
  try {
    const listCommand = new ListObjectsV2Command({
      Bucket: S3_BUCKET,
      Prefix: 'audio/',
    });

    const listResponse = await s3Client.send(listCommand);
    let totalSize = 0;
    let totalFiles = 0;

    if (listResponse.Contents) {
      totalFiles = listResponse.Contents.length;
      for (const file of listResponse.Contents) {
        totalSize += file.Size || 0;
      }
    }

    const totalSizeMB = totalSize / (1024 * 1024);
    const percentUsed = (totalSizeMB / AUDIO_MAX_STORAGE_MB) * 100;

    return {
      totalFiles,
      totalSizeMB: parseFloat(totalSizeMB.toFixed(2)),
      maxSizeMB: AUDIO_MAX_STORAGE_MB,
      percentUsed: parseFloat(percentUsed.toFixed(2)),
    };
  } catch (error) {
    console.error('[Audio Cleanup] Failed to get storage stats:', error);
    return {
      totalFiles: 0,
      totalSizeMB: 0,
      maxSizeMB: AUDIO_MAX_STORAGE_MB,
      percentUsed: 0,
    };
  }
}

/**
 * Log cleanup operation to database (both Manus and Supabase)
 */
async function logCleanup(
  cleanupType: 'age_based' | 'storage_based' | 'manual',
  result: CleanupResult,
  triggeredBy?: number | string
): Promise<void> {
  const status = result.errors.length === 0 ? 'success' : result.filesDeleted > 0 ? 'partial' : 'failed';

  // Log to Manus DB
  const manusDb = await getDb();
  if (manusDb) {
    try {
      const logEntry: InsertCleanupLog = {
        cleanupType,
        filesDeleted: result.filesDeleted,
        spaceFreedMB: result.spaceFreedMB.toFixed(2),
        errors: result.errors.length > 0 ? JSON.stringify(result.errors) : null,
        triggeredBy: typeof triggeredBy === 'number' ? triggeredBy : null,
        status,
        executionTimeMs: result.executionTimeMs,
      };

      await manusDb.insert(cleanupLogs).values(logEntry);
    } catch (error) {
      console.error('[Audio Cleanup] Failed to log to Manus DB:', error);
    }
  }

  // Log to Supabase DB
  const supabase = getSupabaseAdminClient();
  if (supabase) {
    try {
      const logEntry: InsertSupabaseCleanupLog = {
        cleanupType,
        filesDeleted: result.filesDeleted,
        spaceFreedMB: result.spaceFreedMB.toFixed(2),
        errors: result.errors.length > 0 ? result.errors : null,
        triggeredBy: typeof triggeredBy === 'string' ? triggeredBy : null,
        status,
        executionTimeMs: result.executionTimeMs,
      };

      await supabase.from('cleanup_logs').insert(logEntry);
    } catch (error) {
      console.error('[Audio Cleanup] Failed to log to Supabase:', error);
    }
  }
}

/**
 * Start automated cleanup scheduler
 * Runs daily at 2 AM
 */
export function startCleanupScheduler(): void {
  // Run daily at 2 AM
  cron.schedule('0 2 * * *', async () => {
    console.log('[Audio Cleanup] Running scheduled cleanup...');

    const ageResult = await cleanupOldAudioFiles();
    const storageResult = await cleanupByStorageLimit();

    console.log('[Audio Cleanup] Scheduled cleanup complete');
    console.log('  Age-based:', ageResult);
    console.log('  Storage-based:', storageResult);
  });

  console.log('[Audio Cleanup] Scheduler started (runs daily at 2 AM)');
}
