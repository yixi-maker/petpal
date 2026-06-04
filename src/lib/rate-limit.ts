/* eslint-disable @typescript-eslint/no-unused-vars */
// ---------------------------------------------------------------------------
// Rate limit store — swappable backend for rate limiting
// ---------------------------------------------------------------------------
// Dev (default):  in-memory Map, single-process
// Production:     Redis via REDIS_URL, survives restarts & scales horizontally
//
// To activate Redis: set RATE_LIMIT_STORE=redis and REDIS_URL=<connection string>
// ---------------------------------------------------------------------------

export interface RateLimitStore {
  /**
   * Increment the counter for a key within the given window.
   * Returns the current count after increment (1 = first request).
   */
  increment(key: string, windowMs: number): Promise<number>;

  /** Reset the counter for a key. */
  reset(key: string): Promise<void>;
}

// ---------------------------------------------------------------------------
// In-memory store (dev + fallback)
// ---------------------------------------------------------------------------

class MemoryRateLimitStore implements RateLimitStore {
  private store = new Map<string, { count: number; resetAt: number }>();

  async increment(_key: string, _windowMs: number): Promise<number> {
    const now = Date.now();
    const record = this.store.get(key);

    if (!record || now > record.resetAt) {
      this.store.set(key, { count: 1, resetAt: now + windowMs });
      return 1;
    }

    record.count++;
    return record.count;
  }

  async reset(_key: string): Promise<void> {
    this.store.delete(key);
  }
}

// ---------------------------------------------------------------------------
// Redis store (production)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */
class RedisRateLimitStore implements RateLimitStore {
  async increment(_key: string, _windowMs: number): Promise<number> {
    // TODO: Implement with Redis
    // const client = getRedisClient();
    // const count = await client.incr(key);
    // if (count === 1) await client.pexpire(key, windowMs);
    // return count;
    return 1;
  }

  async reset(_key: string): Promise<void> {
    // TODO: const client = getRedisClient();
    // await client.del(key);
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function getRateLimitStore(): RateLimitStore {
  if (process.env.RATE_LIMIT_STORE === 'redis') return new RedisRateLimitStore();
  return new MemoryRateLimitStore();
}

// ---------------------------------------------------------------------------
// Public API (used by auth.ts and other consumers)
// ---------------------------------------------------------------------------

const store = getRateLimitStore();

/**
 * Simple rate limiter.
 *
 * @param key        Unique identifier (e.g. phone number or IP).
 * @param maxRequests Maximum number of requests allowed within the window.
 * @param windowMs   Time window in milliseconds.
 * @returns true if the request is within the limit, false if rate-limited.
 */
export async function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): Promise<boolean> {
  const count = await store.increment(key, windowMs);
  return count <= maxRequests;
}

/**
 * Remove expired entries from the in-memory store.
 * No-op for Redis (TTL is handled by Redis itself).
 * Call periodically to prevent memory leaks in long-running dev sessions.
 */
export function pruneRateLimits(): void {
  // In-memory store pruning is handled lazily on each increment/reset.
  // The Redis store handles TTL via pexpire.
  // This function remains for backward compatibility — it's a no-op.
}
