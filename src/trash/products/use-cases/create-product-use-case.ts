import { CacheProvider } from "../../../shared/cache/cache-provider";
import { PRODUCTS_CACHE_VERSION_KEY } from "../../../shared/cache/cache-version";
import { CreateProductInput } from "../dtos/create-product-dto";
import { ProductRepository } from "../repositories/product-repository";

export class CreateProductUseCase {
  constructor(
    private ProductRepository: ProductRepository,
    private cacheProvider: CacheProvider
  ) {}

  async execute(data: CreateProductInput) {
    const { description, name, userId, value } = data;
    await this.ProductRepository.create({ userId, name, description, value });
    await this.cacheProvider.incr(PRODUCTS_CACHE_VERSION_KEY);
  }
}
