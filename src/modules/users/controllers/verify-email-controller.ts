import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeVerifyEmailUseCase } from "../use-cases/factories/make-verify-email-use-case";
import { ResourceNotFoundError } from "../../../shared/errors/resource-not-found-error";

export async function verifyEmailController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const verifyEmailBodySchema = z.object({
    token: z.string(),
  });

  const { token } = verifyEmailBodySchema.parse(request.body);

  const verifyEmailUseCase = makeVerifyEmailUseCase();

  try {
    await verifyEmailUseCase.execute({ token });
  } catch (error) {
    if (error instanceof ResourceNotFoundError) {
      return reply
        .header("Cache-Control", "no-store")
        .code(404)
        .send({ message: "Resource not found." });
    }
    throw error;
  }

  return reply
    .header("Cache-Control", "no-store")
    .code(200)
    .send({ message: "Email verified successfully" });
}
