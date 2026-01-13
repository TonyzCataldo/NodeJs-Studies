import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeAnswerQuestionUseCase } from "../use-cases/factories/make-answer-question-use-case";

const answerQuestionBodySchema = z.object({
  questionId: z.string().uuid(),
  chosenOptionId: z.string(),
});

export async function AnswerQuestionController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const userId = request.user?.sub;

  if (!userId) {
    return reply.status(401).send({ message: "User not authenticated" });
  }

  const { questionId, chosenOptionId } = answerQuestionBodySchema.parse(
    request.body
  );

  const answerQuestionUseCase = makeAnswerQuestionUseCase();

  try {
    const result = await answerQuestionUseCase.execute({
      userId,
      questionId,
      chosenOptionId,
    });

    return reply.status(201).send(result);
  } catch (err: any) {
    if (err.message === "Question not found") {
      return reply.status(404).send({ message: err.message });
    }
    throw err;
  }
}
