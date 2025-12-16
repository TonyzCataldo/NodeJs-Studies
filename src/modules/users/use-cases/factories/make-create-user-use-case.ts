import { BcryptHashProvider } from "../../../../infra/cryptography/bcrypt-hash-provider";
import { PrismaUserRepository } from "../../repositories/implementations/prisma-user-repository";
import { CreateUserUseCase } from "../create-user-use-case";

export function makeCreateUserUseCase() {
  const userRepository = new PrismaUserRepository();
  const hashProvider = new BcryptHashProvider();
  const useCase = new CreateUserUseCase(userRepository, hashProvider);

  return useCase;
}
