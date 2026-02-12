import { getDb } from '../db';
import { getSupabaseAdminClient } from '../supabaseClient';
import { conversations, cleanupLogs, type InsertCleanupLog } from '../../drizzle/schema';
import { type InsertSupabaseCleanupLog } from '../supabaseDb';
import { lt, and, isNotNull, asc, eq } from 'drizzle-orm';
import cron from 'node-cron';

// Environment configuration
const AUDIO_RETENTION_DAYS = parseInt(process.env.AUDIO_RETENTION_DAYS || '7', 10);
const AUDIO_MAX_STORAGE_MB = parseInt(process.env.AUDIO_MAX_STORAGE_MB || '1000', 10);
const STORAGE_BUCKET = 'audio-files'; // Supabase storage bucket name

interface CleanupResult {
  filesDeleted: number;
  spaceFreedMB: number;
  errors: string[];
  executionTimeMs: number;
}

/**
 * Extract storage path from Supabase Storage URL
 * Example: https://xxx.supabase.co/storage/v1/object/public/audio-files/path/to/file.webm → path/to/file.webm
 */
function extractStoragePath(url: string): string | null {
  try {
    const urlObj = new URL(url);
    // Extract path after /storage/v1/object/public/{bucket}/
    const match = urlObj.pathname.match(/\/storage\/v1\/object\/public\/[^\/]+\/(.+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error(`[Audio Cleanup] Invalid URL: ${url}`, error);
    return null;
  }
}

/**
 * Get file size from Supabase Storage (in MB)
 */
async function getStorageFileSize(path: string): Promise<number> {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return 0;

    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list(path.substring(0, path.lastIndexOf('/')), {
        search: path.substring(path.lastIndexOf('/') + 1),
      });

    if (error || !data || data.length === 0) {
      return 0;
    }

    const file = data[0];
    return (file.metadata?.size || 0) / (1024 * 1024); // Convert bytes to MB
  } catch (error) {
    console.error(`[Audio Cleanup] Failed to get file size for ${path}:`, error);
    return 0;
  }
}

/**
 * Delete file from Supabase Storage
 */
async function deleteFromStorage(path: string): Promise<boolean> {
  try {
    const supabase = getSupabaseAdminClient();
    if (!supabase) return false;

    const { error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .remove([path]);

    if (error) {
      console.error(`[Audio Cleanup] Failed to delete ${path}:`, error);
      return false;
    }

    return true;
  } catch (error) {
    console.error(`[Audio Cleanup] Failed to delete ${path} from storage:`, error);
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
          
          const storagePath = extractStoragePath(conv.audioUrl);
          if (!storagePath) {
            result.errors.push(`Invalid URL format: ${conv.audioUrl}`);
            continue;
          }

          // Get file size before deletion
          const fileSizeMB = await getStorageFileSize(storagePath);

          // Delete from Supabase Storage
          const deleted = await deleteFromStorage(storagePath);
          if (!deleted) {
            result.errors.push(`Failed to delete storage file: ${storagePath}`);
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

            const storagePath = extractStoragePath(conv.audio_url);
            if (!storagePath) {
              result.errors.push(`Invalid URL format: ${conv.audio_url}`);
              continue;
            }

            // Get file size before deletion
            const fileSizeMB = await getStorageFileSize(storagePath);

            // Delete from Supabase Storage
            const deleted = await deleteFromStorage(storagePath);
            if (!deleted) {
              result.errors.push(`Failed to delete storage file: ${storagePath}`);
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
    // Calculate total storage used by listing all audio files in Supabase Storage
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      result.errors.push('Supabase client not available');
      return result;
    }

    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list();

    let totalSizeMB = 0;
    if (files && !error) {
      for (const file of files) {
        totalSizeMB += (file.metadata?.size || 0) / (1024 * 1024);
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

        const storagePath = extractStoragePath(conv.audioUrl);
        if (!storagePath) continue;

        const fileSizeMB = await getStorageFileSize(storagePath);
        const deleted = await deleteFromStorage(storagePath);

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

          const storagePath = extractStoragePath(conv.audio_url);
          if (!storagePath) continue;

          const fileSizeMB = await getStorageFileSize(storagePath);
          const deleted = await deleteFromStorage(storagePath);

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
    const supabase = getSupabaseAdminClient();
    if (!supabase) {
      return {
        totalFiles: 0,
        totalSizeMB: 0,
        maxSizeMB: AUDIO_MAX_STORAGE_MB,
        percentUsed: 0,
      };
    }

    const { data: files, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .list();

    let totalSize = 0;
    let totalFiles = 0;

    if (files && !error) {
      totalFiles = files.length;
      for (const file of files) {
        totalSize += file.metadata?.size || 0;
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
