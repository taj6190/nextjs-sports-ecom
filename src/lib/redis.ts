import { Redis } from '@upstash/redis';

// Initialize Redis single instance safely
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

/**
 * PRODUCTION ROBUSTNESS:
 * We initialize the client only if credentials exist.
 * We also wrap all operations in try-catch to ensure that Redis failures
 * NEVER break the production user experience.
 */
export const redis = (redisUrl && redisToken) ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

if (!redis) {
  if (process.env.NODE_ENV === 'production') {
    console.warn("⚠️ [Redis] Production credentials missing. Caching is disabled.");
  }
}

/**
 * Enhanced fetch to cache responses safely gracefully degrading.
 * Optimized for resilience against connection drops or invalid data.
 */
export async function cacheOrQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  // 1. FAIL-SAFE: If no redis instance or we're in a limited environment
  if (!redis) {
    return queryFn();
  }

  try {
    // 2. ATTEMPT CACHE RETRIEVAL
    // We use a timeout to prevent slow Redis from hanging the user request
    const cachedValue = await Promise.race([
      redis.get(key),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Redis Timeout")), 2000))
    ]) as string | null;

    if (cachedValue) {
      // Data from Upstash is already deserialized if passed as object, 
      // but we ensure POJO consistency here.
      return cachedValue as T;
    }
  } catch (err) {
    // Fail silently: log and move to DB
    console.warn(`[Redis] Skip Read [${key}]: ${err instanceof Error ? err.message : 'Unknown error'}`);
  }

  // 3. FALLBACK TO DATABASE
  const data = await queryFn();

  // 4. BACKGROUND CACHE UPDATE (ASYNCHRONOUS)
  if (data !== undefined && data !== null) {
    // Ensure we are working with clean JSON (no Mongoose internal state, Dates as strings)
    const cleanData = JSON.parse(JSON.stringify(data));
    
    // Fire and forget - do not await to keep response time low
    redis.set(key, cleanData, { ex: ttlSeconds }).catch((e) => {
      console.warn(`[Redis] Skip Write [${key}]: ${e instanceof Error ? e.message : 'Internal error'}`);
    });
  }

  return data;
}
