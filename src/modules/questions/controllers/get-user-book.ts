import { FastifyReply, FastifyRequest } from "fastify";
import { makeGetUserBookUseCase } from "../use-cases/factories/make-get-user-book-use-case";

export async function GetUserBookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.sub;

  if (!userId) {
    return reply.status(401).send({ message: "User not authenticated" });
  }

  const getUserBookUseCase = makeGetUserBookUseCase();
  const result = await getUserBookUseCase.execute(userId);

  if (!result) {
    return reply.status(404).send({ message: "No active session found" });
  }

  return reply.status(200).send({
    session: result.session,
    questions: result.questions,
  });
}
