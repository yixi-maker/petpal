/* eslint-disable @typescript-eslint/no-unused-vars */
// ---------------------------------------------------------------------------
// Verification code store — swappable backend for auth codes
// ---------------------------------------------------------------------------
// Dev (default):  in-memory Map with TTL, single-process
// Production:     Redis via REDIS_URL, survives restarts & scales horizontally
//
// To activate Redis: set CODE_STORE=redis and REDIS_URL=<connection string>
// ---------------------------------------------------------------------------

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
 

  async set(_key: string, _value: string, _ttlSeconds: number): Promise<void> {
    this.store.set(key, {
      value,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });
  }

  async get(_key: string): Promise<string | null> {
    const entry = this.store.get(key);
    if (!entry || Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.value;
  }

  async delete(_key: string): Promise<void> {
    this.store.delete(key);
  }

  async exists(_key: string): Promise<boolean> {
    const v = await this.get(key);
    return v !== null;
  }
}

// ---------------------------------------------------------------------------
// Redis store (production)
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-unused-vars */
class RedisCodeStore implements CodeStore {
  private getClient(): unknown {
    if (!process.env.REDIS_URL) {
      throw new Error(
        'Redis not configured. Set REDIS_URL env var for production code store.'
      );
    }
    // TODO: return new Redis(process.env.REDIS_URL)
    // Install ioredis:  npm install ioredis
    // Then uncomment:
    //   import Redis from 'ioredis';
    //   private client: Redis;
    //   constructor() { this.client = new Redis(process.env.REDIS_URL!); }
    //   private getClient(): Redis { return this.client; }
    throw new Error(
      'Redis client not yet implemented. Install ioredis and uncomment.'
    );
  }

  async set(_key: string, _value: string, _ttlSeconds: number): Promise<void> {
    // const client = this.getClient() as any;
    // await client.setex(key, ttlSeconds, value);
  }

  async get(_key: string): Promise<string | null> {
    // const client = this.getClient() as any;
    // return await client.get(key);
    return null;
  }

  async delete(_key: string): Promise<void> {
    // const client = this.getClient() as any;
    // await client.del(key);
  }

  async exists(_key: string): Promise<boolean> {
    // const client = this.getClient() as any;
    // return (await client.exists(key)) === 1;
    return false;
  }
}

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

export function getCodeStore(): CodeStore {
  if (process.env.CODE_STORE === 'redis') return new RedisCodeStore();
  return new MemoryCodeStore();
}
