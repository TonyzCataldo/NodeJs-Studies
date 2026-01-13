import type { FastifyInstance } from "fastify";
import { RedisCacheProvider } from "./redis-cache-provider";
import { NoopCacheProvider } from "./noop-cache-provider";

export function makeCacheProvider(app: FastifyInstance) {
  return app.redis
    ? new RedisCacheProvider(app.redis)
    : new NoopCacheProvider();
}
