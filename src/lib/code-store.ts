// ---------------------------------------------------------------------------
// Verification code store — swappable backend for auth codes
// ---------------------------------------------------------------------------
// Dev (default):  in-memory Map with TTL, single-process
// Production:     Redis via REDIS_URL, survives restarts & scales horizontally
//
// To activate Redis: set CODE_STORE=redis and REDIS_URL=<connection string>
// ---------------------------------------------------------------------------

import Redis from 'ioredis';

export interface CodeStore {
  set(key: string, value: string, ttlSeconds: number): Promise<void>;
  get(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// ---------------------------------------------------------------------------
// In-memory store (dev + fallback)
// ---------------------------------------------------------------------------

class MemoryCodeStore implements CodeStore {
  private store = new Map<string, { value: string; expiresAt: number }>();

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async get(key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async delete(key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(key: string): Promise<boolean> {
    const v = await this.get(key);
    return v !== null;
  }
}

// ---------------------------------------------------------------------------
// Redis store (production)
// ---------------------------------------------------------------------------

class RedisCodeStore implements CodeStore {
  private client: Redis;

  constructor() {
    const url = process.env.REDIS_URL;
    if (!url) {
      throw new Error(
        'REDIS_URL is required when CODE_STORE=redis'
      );
    }
    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: false,
    });
    this.client.on('error', (err) => {
      console.error('[RedisCodeStore] Redis connection error:', err.message);
    });
  }

  async set(key: string, value: string, ttlSeconds: number): Promise<void> {
    await this.client.setex(`code:${key}`, ttlSeconds, value);
  }

  async get(key: string): Promise<string | null> {
    return await this.client.get(`code:${key}`);
  }

  async delete(key: string): Promise<void> {
    await this.client.del(`code:${key}`);
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(`code:${key}`);
    return result === 1;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

let cachedStore: CodeStore | null = null;

export function getCodeStore(): CodeStore {
  if (cachedStore) return cachedStore;

  if (process.env.CODE_STORE === 'redis') {
    cachedStore = new RedisCodeStore();
  } else {
    cachedStore = new MemoryCodeStore();
  }

  return cachedStore;
}
