import { PrismaQuestionsRepository } from "../../repositories/implementations/prisma-questions-repository";
import { PrismaUserBookRepository } from "../../repositories/implementations/prisma-user-book-repository";
import { AnswerQuestionUseCase } from "../answer-question-use-case";

export function makeAnswerQuestionUseCase() {
  const questionsRepository = new PrismaQuestionsRepository();
  const userBookRepository = new PrismaUserBookRepository();
  const useCase = new AnswerQuestionUseCase(
    questionsRepository,
    userBookRepository
  );

  return useCase;
}
