import { CreateProductInput } from "../dtos/create-product-dto";
import { GetProductParams } from "../dtos/get-product-params";
import { ProductEntity } from "../entities/product-entity";

export interface ProductRepository {
  create(data: CreateProductInput): Promise<void>;
  search(params: GetProductParams): Promise<ProductEntity[]>;
}
