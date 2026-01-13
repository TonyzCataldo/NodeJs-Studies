import { prisma } from "../../../../infra/db/prisma";
import { Prisma } from "../../../../infra/generated/client";
import { CreateProductInput } from "../../dtos/create-product-dto";
import { GetProductParams } from "../../dtos/get-product-params";
import { ProductEntity } from "../../entities/product-entity";
import { ProductRepository } from "../product-repository";

export class PrismaProductRepository implements ProductRepository {
  async create(data: CreateProductInput): Promise<void> {
    await prisma.product.create({ data });
  }
  async search(params: GetProductParams): Promise<ProductEntity[]> {
    const { q, page, limit, sort, min, max } = params;
    return await prisma.product.findMany({
      where: {
        AND: [
          // 1) Busca por texto (q) — só entra se q existir
          ...(q
            ? [
                {
                  OR: [
                    {
                      name: { contains: q, mode: Prisma.QueryMode.insensitive },
                    },
                    {
                      description: {
                        contains: q,
                        mode: Prisma.QueryMode.insensitive,
                      },
                    },
                  ],
                },
              ]
            : []),

          // 2) Range no value (min/max) — só entra se tiver min ou max
          ...(min !== undefined || max !== undefined
            ? [
                {
                  value: {
                    ...(min !== undefined ? { gte: min } : {}),
                    ...(max !== undefined ? { lte: max } : {}),
                  },
                },
              ]
            : []),
        ],
      },

      // 3) Ordenação
      orderBy:
        sort === "value_asc"
          ? { value: "asc" }
          : sort === "value_desc"
          ? { value: "desc" }
          : { createdAt: "desc" }, // newest

      // 4) Paginação
      skip: (page - 1) * limit,
      take: limit,
    });
  }
}
