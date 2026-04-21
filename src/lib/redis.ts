import { Redis } from '@upstash/redis';

// Initialize Redis single instance safely
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;
const isDev = process.env.NODE_ENV === 'development';
const enableLocalRedis = process.env.ENABLE_REDIS_LOCAL === 'true';

// Detecting the Next.js build phase to prevent "Dynamic server usage" errors during SSG
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build';

/**
 * PRODUCTION ROBUSTNESS:
 * We initialize the client only if credentials exist.
 * We also disable it in development by default and during the BUILD PHASE
 * to prevent Next.js from throwing "Dynamic server usage" errors.
 */
export const redis = (redisUrl && redisToken && !isBuildPhase && (!isDev || enableLocalRedis)) ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

// Only warn if we are in production, not building, and missing initialization
if (!redis && !isDev && !isBuildPhase && (redisUrl || redisToken)) {
  console.warn("⚠️ [Redis] Production initialization skipped. Ensure environment variables are correct.");
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
  // 1. FAIL-SAFE: Skip if no redis instance
  if (!redis) {
    return queryFn();
  }

  try {
    // 2. ATTEMPT CACHE RETRIEVAL
    // Increased timeout to 5s for better tolerance in varied network conditions
    const cachedValue = await Promise.race([
      redis.get(key),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000))
    ]) as T | null;

    if (cachedValue) {
      if (isDev) console.log(`[Redis] Hit: ${key}`);
      return cachedValue;
    }
  } catch (err) {
    // Suppress heavy logs in development unless explicitly debugging
    if (!isDev) {
      console.warn(`[Redis] Skip Read [${key}]: ${err instanceof Error ? err.message : 'Unknown'}`);
    }
  }

  // 3. FALLBACK TO DATABASE
  const data = await queryFn();

  // 4. BACKGROUND CACHE UPDATE (ASYNCHRONOUS)
  if (data !== undefined && data !== null) {
    try {
      // Ensure clean POJO
      const cleanData = JSON.parse(JSON.stringify(data));
      
      // Fire and forget
      redis.set(key, cleanData, { ex: ttlSeconds }).catch((e) => {
        if (!isDev) console.warn(`[Redis] Skip Write [${key}]: ${e instanceof Error ? e.message : 'Internal'}`);
      });
    } catch {
      // Ignored
    }
  }

  return data;
}
