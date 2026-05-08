import redis from "@/lib/redis";

const CACHE_PREFIX = "watchlayer";

export function cacheKey(...parts: Array<string | number | boolean | null | undefined>) {
  return [CACHE_PREFIX, ...parts.filter((part) => part !== null && part !== undefined)]
    .map((part) => String(part))
    .join(":");
}

export async function getCached<T>(key: string): Promise<T | null> {
  try {
    const value = await redis.get<unknown>(key);

    if (!value) return null;
    return typeof value === "string" ? (JSON.parse(value) as T) : (value as T);
  } catch (error) {
    console.error(`Redis cache read failed for ${key}:`, error);
    return null;
  }
}

export async function setCached<T>(key: string, value: T, ttlSeconds = 60) {
  try {
    await redis.set(key, JSON.stringify(value), { ex: ttlSeconds });
  } catch (error) {
    console.error(`Redis cache write failed for ${key}:`, error);
  }
}

export async function deleteCached(...keys: string[]) {
  if (keys.length === 0) return;
  
  try {
    await redis.del(...keys);
  } catch (error) {
    console.error("Redis cache delete failed:", error);
  }
}

export async function deleteCachedPattern(pattern: string) {
  try {
    const keys: string[] = [];
    let cursor = "0";

    do {
      const [nextCursor, scannedKeys] = await redis.scan(cursor, {
        match: pattern,
        count: 100,
      });
      cursor = nextCursor;
      keys.push(...scannedKeys);
    } while (cursor !== "0");

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  } catch (error) {
    console.error(`Redis cache pattern delete failed for ${pattern}:`, error);
  }
}
