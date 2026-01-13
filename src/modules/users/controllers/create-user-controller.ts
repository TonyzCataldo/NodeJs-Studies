import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { makeCreateUserUseCase } from "../use-cases/factories/make-create-user-use-case";
import { UserAlreadyExistsError } from "../../../shared/errors/user-already-exists-error";

const createUserBodySchema = z.object({
  name: z.string().min(1),
  email: z.email(),
  password: z.string().min(6),
});

export async function createUserController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { name, email, password } = createUserBodySchema.parse(request.body);

  const createUserUseCase = makeCreateUserUseCase();

  try {
    await createUserUseCase.execute({ name, email, password });
  } catch (error) {
    if (error instanceof UserAlreadyExistsError) {
      return reply
        .header("Cache-Control", "no-store")
        .code(409)
        .send({ message: error.message });
    }
    throw error;
  }
  return reply.header("Cache-Control", "no-store").code(201).send();
}
