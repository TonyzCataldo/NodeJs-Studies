import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";

const CreateUserBookBodySchema = z.object({
  courseId: z.uuid(),
  subjectId: z.uuid(),
  done: z.boolean().optional(),
  correct: z.boolean().optional(),
  limit: z.number().min(1).default(10),
});

import { makeCreateUserBookUseCase } from "../use-cases/factories/make-create-user-book-use-case";

export async function CreateUserBookController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { courseId, subjectId, done, correct, limit } =
    CreateUserBookBodySchema.parse(request.body);

  const userId = request.user?.sub;

  if (!userId) {
    return reply.status(401).send({ message: "User not authenticated" });
  }

  const createUserBookUseCase = makeCreateUserBookUseCase();

  const { questionsCount, sessionData } = await createUserBookUseCase.execute({
    userId,
    courseId,
    subjectId,
    limit,
    onlyAnswered: done,
    onlyCorrect: correct,
  });

  return reply.status(201).send({
    message: "Session created successfully",
    total: questionsCount,
    session: sessionData,
  });
}
