import { FastifyReply, FastifyRequest } from "fastify";
import { makeFinishUserBookUseCase } from "../use-cases/factories/make-finish-user-book-use-case";

export async function FinishUserBookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.sub;

  if (!userId) {
    return reply.status(401).send({ message: "User not authenticated" });
  }

  const finishUserBookUseCase = makeFinishUserBookUseCase();

  try {
    const result = await finishUserBookUseCase.execute({
      userId,
    });

    return reply.status(200).send(result);
  } catch (err: any) {
    if (err.message === "Session not found") {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}
