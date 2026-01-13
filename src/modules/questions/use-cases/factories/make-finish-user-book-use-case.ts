import { PrismaUserBookRepository } from "../../repositories/implementations/prisma-user-book-repository";
import { FinishUserBookUseCase } from "../finish-user-book-use-case";

export function makeFinishUserBookUseCase() {
  const userBookRepository = new PrismaUserBookRepository();
  const useCase = new FinishUserBookUseCase(userBookRepository);
  return useCase;
}
