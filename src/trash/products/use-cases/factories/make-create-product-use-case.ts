import { FastifyInstance } from "fastify";
import { PrismaProductRepository } from "../../repositories/implementations/prisma-product-repository";
import { CreateProductUseCase } from "../create-product-use-case";
import { RedisCacheProvider } from "../../../../infra/cache/redis-cache-provider";
import { NoopCacheProvider } from "../../../../infra/cache/noop-cache-provider";
import { makeCacheProvider } from "../../../../infra/cache/make-cache-provider";

export function MakeCreateProductUseCase(app: FastifyInstance) {
  const productRepository = new PrismaProductRepository();
  const cacheProvider = makeCacheProvider(app);
  const useCase = new CreateProductUseCase(productRepository, cacheProvider);
  return useCase;
}
