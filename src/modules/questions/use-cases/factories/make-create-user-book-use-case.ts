import { PrismaUserBookRepository } from "../../repositories/implementations/prisma-user-book-repository";
import { PrismaQuestionsRepository } from "../../repositories/implementations/prisma-questions-repository";
import { CreateUserBookUseCase } from "../create-user-book-use-case";

export function makeCreateUserBookUseCase() {
  const questionsRepository = new PrismaQuestionsRepository();
  const userBookRepository = new PrismaUserBookRepository();

  const useCase = new CreateUserBookUseCase(
    questionsRepository,
    userBookRepository
  );

  return useCase;
}
