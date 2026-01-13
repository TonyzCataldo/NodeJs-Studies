import { FastifyInstance } from "fastify";
import { makeCacheProvider } from "../cache/make-cache-provider";
import { HttpCache } from "./http-cache";

export function makeHttpCache(app: FastifyInstance) {
  const cacheProvider = makeCacheProvider(app);
  return new HttpCache(cacheProvider);
}
