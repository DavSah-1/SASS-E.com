import Redis from 'ioredis';
import crypto from 'crypto';

// Use Redis if available, otherwise in-memory cache
let redis: Redis | null = null;

// Only initialize Redis if REDIS_URL is provided
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    redis.on('error', (err) => {
      console.error('[Cache] Redis connection error:', err);
      redis = null; // Fallback to in-memory
    });
    redis.on('connect', () => {
      console.log('[Cache] Redis connected successfully');
    });
  } catch (error) {
    console.error('[Cache] Failed to initialize Redis:', error);
    redis = null;
  }
}

// In-memory fallback
const memoryCache = new Map<string, { data: any; expiresAt: number }>();

// Performance metrics tracking
const cacheMetrics = {
  hits: 0,
  misses: 0,
  totalRequests: 0,
};

interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string;
}

/**
 * Get value from cache
 * Note: Key should already include prefix (e.g., "search:hash")
 */
export async function cacheGet<T>(key: string): Promise<T | null> {
  cacheMetrics.totalRequests++;
  
  if (redis) {
    try {
      const data = await redis.get(key);
      const result = data ? JSON.parse(data) : null;
      if (result) {
        cacheMetrics.hits++;
      } else {
        cacheMetrics.misses++;
      }
      return result;
    } catch (error) {
      console.error('[Cache] Redis get error:', error);
      cacheMetrics.misses++;
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  const cached = memoryCache.get(key);
  if (!cached) {
    cacheMetrics.misses++;
    return null;
  }

  if (Date.now() > cached.expiresAt) {
    memoryCache.delete(key);
    cacheMetrics.misses++;
    return null;
  }

  cacheMetrics.hits++;
  return cached.data;
}

/**
 * Set value in cache
 * Note: Key should already include prefix (e.g., "search:hash")
 */
export async function cacheSet<T>(
  key: string,
  value: T,
  options: CacheOptions = {}
): Promise<void> {
  const { ttl = 3600 } = options;

  if (redis) {
    try {
      await redis.setex(key, ttl, JSON.stringify(value));
      return;
    } catch (error) {
      console.error('[Cache] Redis set error:', error);
      // Fallback to in-memory
    }
  }

  // In-memory fallback
  memoryCache.set(key, {
    data: value,
    expiresAt: Date.now() + ttl * 1000,
  });
}

/**
 * Delete value from cache
 */
export async function cacheDelete(key: string): Promise<void> {
  if (redis) {
    try {
      await redis.del(key);
      return;
    } catch (error) {
      console.error('[Cache] Redis delete error:', error);
    }
  }

  memoryCache.delete(key);
}

/**
 * Clear cache (all keys or by pattern)
 */
export async function cacheClear(pattern?: string): Promise<void> {
  if (redis) {
    try {
      if (pattern) {
        const keys = await redis.keys(pattern);
        if (keys.length > 0) {
          await redis.del(...keys);
        }
      } else {
        await redis.flushdb();
      }
      return;
    } catch (error) {
      console.error('[Cache] Redis clear error:', error);
    }
  }

  // In-memory fallback
  if (pattern) {
    const keysToDelete = Array.from(memoryCache.keys()).filter(key => key.includes(pattern));
    keysToDelete.forEach(key => memoryCache.delete(key));
  } else {
    memoryCache.clear();
  }
}

/**
 * Generate cache key from query
 */
export function generateCacheKey(query: string, prefix?: string): string {
  const hash = crypto.createHash('md5').update(query.toLowerCase().trim()).digest('hex');
  return prefix ? `${prefix}:${hash}` : hash;
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  const hitRate = cacheMetrics.totalRequests > 0
    ? (cacheMetrics.hits / cacheMetrics.totalRequests) * 100
    : 0;

  if (redis) {
    try {
      const keys = await redis.keys('search:*');
      return {
        enabled: true,
        type: 'redis' as const,
        entries: keys.length,
        hits: cacheMetrics.hits,
        misses: cacheMetrics.misses,
        totalRequests: cacheMetrics.totalRequests,
        hitRate: parseFloat(hitRate.toFixed(2)),
      };
    } catch (error) {
      console.error('[Cache] Redis stats error:', error);
    }
  }

  return {
    enabled: true,
    type: 'in-memory' as const,
    entries: memoryCache.size,
    hits: cacheMetrics.hits,
    misses: cacheMetrics.misses,
    totalRequests: cacheMetrics.totalRequests,
    hitRate: parseFloat(hitRate.toFixed(2)),
  };
}

// Cleanup expired in-memory cache entries
if (!redis) {
  console.log('[Cache] Using in-memory cache (Redis not configured)');
  setInterval(() => {
    const now = Date.now();
    let cleaned = 0;
    const entries = Array.from(memoryCache.entries());
    for (const [key, value] of entries) {
      if (now > value.expiresAt) {
        memoryCache.delete(key);
        cleaned++;
      }
    }
    if (cleaned > 0) {
      console.log(`[Cache] Cleaned ${cleaned} expired entries from in-memory cache`);
    }
  }, 60000); // Run every minute
}
