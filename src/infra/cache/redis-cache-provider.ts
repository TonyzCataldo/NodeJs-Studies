import { RedisClientType } from "redis";
import { CacheProvider } from "../../shared/cache/cache-provider";

export class RedisCacheProvider implements CacheProvider {
  constructor(private readonly redis: RedisClientType) {}
  async get<T>(key: string): Promise<T | null> {
    try {
      const raw = await this.redis.get(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), {
        expiration: {
          type: "EX",
          value: ttlSeconds,
        },
      });
    } catch {}
  }
  async del(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {}
  }
  async incr(key: string): Promise<number> {
    try {
      return await this.redis.incr(key);
    } catch {
      return 0;
    }
  }
}
