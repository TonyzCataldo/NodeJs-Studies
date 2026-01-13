import { PrismaUserBookRepository } from "../../repositories/implementations/prisma-user-book-repository";
import { PrismaQuestionsRepository } from "../../repositories/implementations/prisma-questions-repository";
import { GetUserBookUseCase } from "../get-user-book-use-case";

export function makeGetUserBookUseCase() {
  const questionsRepository = new PrismaQuestionsRepository();
  const userBookRepository = new PrismaUserBookRepository();

  const useCase = new GetUserBookUseCase(
    questionsRepository,
    userBookRepository
  );

  return useCase;
}
