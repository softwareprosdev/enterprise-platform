import Redis from 'ioredis';

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

export const redis = new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    if (times > 3) {
      console.error('Redis connection failed after 3 retries');
      return null;
    }
    return Math.min(times * 100, 3000);
  },
  lazyConnect: true,
});

redis.on('connect', () => {
  // Connection established - logged at debug level by ioredis internally
});

redis.on('error', (err) => {
  console.error('Redis error:', err.message);
});

// Session storage helpers
export const sessionStore = {
  async get(sessionId: string): Promise<string | null> {
    return redis.get(`session:${sessionId}`);
  },

  async set(sessionId: string, data: string, ttlSeconds: number): Promise<void> {
    await redis.setex(`session:${sessionId}`, ttlSeconds, data);
  },

  async delete(sessionId: string): Promise<void> {
    await redis.del(`session:${sessionId}`);
  },

  async extend(sessionId: string, ttlSeconds: number): Promise<void> {
    await redis.expire(`session:${sessionId}`, ttlSeconds);
  },
};

// Rate limiter helpers
export const rateLimiter = {
  async increment(key: string, windowSeconds: number): Promise<number> {
    const multi = redis.multi();
    multi.incr(`ratelimit:${key}`);
    multi.expire(`ratelimit:${key}`, windowSeconds);
    const results = await multi.exec();
    return (results?.[0]?.[1] as number) || 0;
  },

  async get(key: string): Promise<number> {
    const count = await redis.get(`ratelimit:${key}`);
    return count ? parseInt(count, 10) : 0;
  },
};

// Cache helpers
export const cache = {
  async get<T>(key: string): Promise<T | null> {
    const data = await redis.get(`cache:${key}`);
    if (!data) return null;
    return JSON.parse(data) as T;
  },

  async set<T>(key: string, data: T, ttlSeconds: number): Promise<void> {
    await redis.setex(`cache:${key}`, ttlSeconds, JSON.stringify(data));
  },

  async delete(key: string): Promise<void> {
    await redis.del(`cache:${key}`);
  },

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await redis.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redis.del(...keys);
    }
  },
};

// Onboarding state helpers
export const onboardingStore = {
  async get(tenantId: string): Promise<Record<string, unknown> | null> {
    const data = await redis.get(`onboarding:${tenantId}`);
    if (!data) return null;
    return JSON.parse(data) as Record<string, unknown>;
  },

  async set(tenantId: string, data: Record<string, unknown>): Promise<void> {
    // Store onboarding state for 7 days
    await redis.setex(`onboarding:${tenantId}`, 7 * 24 * 60 * 60, JSON.stringify(data));
  },

  async update(tenantId: string, data: Record<string, unknown>): Promise<void> {
    const existing = await this.get(tenantId);
    await this.set(tenantId, { ...existing, ...data });
  },

  async delete(tenantId: string): Promise<void> {
    await redis.del(`onboarding:${tenantId}`);
  },
};
