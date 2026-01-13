import { cacheKey } from "../../../shared/cache/cache-keys";
import { CacheProvider } from "../../../shared/cache/cache-provider";
import { PRODUCTS_CACHE_VERSION_KEY } from "../../../shared/cache/cache-version";
import { GetProductParams } from "../dtos/get-product-params";
import { ProductEntity } from "../entities/product-entity";
import { ProductRepository } from "../repositories/product-repository";

export class GetProductUseCase {
  constructor(
    private productRepository: ProductRepository,
    private cacheProvider: CacheProvider
  ) {}
  async execute(data: GetProductParams) {
    const version =
      (await this.cacheProvider.get<string>(PRODUCTS_CACHE_VERSION_KEY)) ?? "1";
    const key = cacheKey(`products:v${version}:search`, data);
    const cached = await this.cacheProvider.get<ProductEntity[]>(key);
    if (cached !== null) {
      return cached;
    }

    const products = await this.productRepository.search(data);
    await this.cacheProvider.set(key, products, 60 * 5);

    return products;
  }
}
