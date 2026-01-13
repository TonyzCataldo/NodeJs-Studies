import { PrismaUserRepository } from "../../repositories/implementations/prisma-user-repository";
import { VerifyEmailUseCase } from "../verify-email-use-case";

export function makeVerifyEmailUseCase() {
  const userRepository = new PrismaUserRepository();
  const useCase = new VerifyEmailUseCase(userRepository);

  return useCase;
}
