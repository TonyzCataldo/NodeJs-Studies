import { FastifyInstance } from "fastify";
import { RedisCacheProvider } from "../../../../infra/cache/redis-cache-provider";
import { PrismaProductRepository } from "../../repositories/implementations/prisma-product-repository";
import { GetProductUseCase } from "../get-product-use-case";
import { NoopCacheProvider } from "../../../../infra/cache/noop-cache-provider";
import { makeCacheProvider } from "../../../../infra/cache/make-cache-provider";

export function MakeGetProductUseCase(app: FastifyInstance) {
  const productRepository = new PrismaProductRepository();
  const cacheProvider = makeCacheProvider(app);

  const useCase = new GetProductUseCase(productRepository, cacheProvider);
  return useCase;
}
