const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Simple in-memory rate limiter.
 *
 * @param key        Unique identifier (e.g. phone number or IP).
 * @param maxRequests Maximum number of requests allowed within the window.
 * @param windowMs   Time window in milliseconds.
 * @returns true if the request is within the limit, false if rate-limited.
 */
export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): boolean {
  const now = Date.now();
  const record = store.get(key);

  if (!record || now > record.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (record.count >= maxRequests) {
    return false;
  }

  record.count++;
  return true;
}

/**
 * Remove expired entries. Call periodically to prevent memory leaks
 * in long-running dev sessions.
 */
export function pruneRateLimits(): void {
  const now = Date.now();
  for (const [key, record] of store) {
    if (now > record.resetAt) {
      store.delete(key);
    }
  }
}
