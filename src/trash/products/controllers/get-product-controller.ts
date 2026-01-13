import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MakeGetProductUseCase } from "../use-cases/factories/make-get-product-use-case";
import { makeHttpCache } from "../../../infra/http-cache/make-http-cache";
import { PRODUCTS_CACHE_VERSION_KEY } from "../../../shared/cache/cache-version";

const GetProductQuerySchema = z.object({
  q: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  sort: z.enum(["value_asc", "value_desc", "newest"]).default("newest"),

  min: z.coerce.number().optional(),
  max: z.coerce.number().optional(),
});

export async function GetProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const parsed = GetProductQuerySchema.parse(request.query);
  const httpCache = makeHttpCache(request.server);

  const { ended } = await httpCache.handle(request, reply, {
    versionKey: PRODUCTS_CACHE_VERSION_KEY,
    visibility: "public",
    scope: "products",
    query: parsed,
    maxAge: 60,
    sMaxAge: 300,
    staleWhileRevalidate: 600,
    mustRevalidate: true,
  });
  if (ended) return;

  const getProductUseCase = MakeGetProductUseCase(request.server);

  try {
    const products = await getProductUseCase.execute(parsed);
    return reply.code(200).send({ products: products });
  } catch (error) {
    throw error;
  }
}
