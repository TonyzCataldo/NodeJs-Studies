import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MakeCreateProductUseCase } from "../use-cases/factories/make-create-product-use-case";

const CreateProductBodySchema = z.object({
  name: z.string().min(4),
  description: z.string().min(4),
  value: z.number(),
});

export async function CreateProductController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, description, value } = CreateProductBodySchema.parse(
    request.body
  );
  const userId = request.user?.sub;
  if (!userId) {
    return reply.status(403).send({ message: "Forbidden" });
  }
  const createProductUseCase = MakeCreateProductUseCase(request.server);

  try {
    await createProductUseCase.execute({ userId, name, description, value });
    return reply.header("Cache-Control", "no-store").code(201).send();
  } catch (error) {
    throw error;
  }
}
