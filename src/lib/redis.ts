import { Redis } from '@upstash/redis';

// Initialize Redis single instance safely
const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

// Throw only in production if missing, so CI/local builds don't fail immediately without envs
if (!redisUrl || !redisToken) {
  console.warn("Upstash Redis credentials are not defined in Environment Variables. Caching will be disabled.");
}

export const redis = (redisUrl && redisToken) ? new Redis({
  url: redisUrl,
  token: redisToken,
}) : null;

/**
 * Enhanced fetch to cache responses safely gracefully degrading.
 */
export async function cacheOrQuery<T>(
  key: string,
  queryFn: () => Promise<T>,
  ttlSeconds: number = 3600
): Promise<T> {
  if (!redis) return queryFn();

  try {
    const cached = await redis.get<T>(key);
    if (cached) {
      return cached;
    }
  } catch (err) {
    console.error(`[Redis] Cache read error for ${key}:`, err);
  }

  // Fetch the data from the reliable source (DB typically)
  const data = await queryFn();

  // If successful, save back to cache in background
  try {
    // Fire and forget to not block the request
    redis.setex(key, ttlSeconds, data).catch((e) => {
      console.error(`[Redis] Cache writing error for ${key}:`, e);
    });
  } catch (err) {
    console.error(`[Redis] Cache write error for ${key}:`, err);
  }

  return data;
}
