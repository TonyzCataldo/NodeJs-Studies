import { BcryptHashProvider } from "../../../../infra/cryptography/bcrypt-hash-provider";
import { PrismaUserRepository } from "../../repositories/implementations/prisma-user-repository";
import { CreateUserUseCase } from "../create-user-use-case";
import { NodemailerMailProvider } from "../../../../infra/providers/mail/nodemailer-mail-provider";

export function makeCreateUserUseCase() {
  const userRepository = new PrismaUserRepository();
  const hashProvider = new BcryptHashProvider();
  const mailProvider = new NodemailerMailProvider();

  const useCase = new CreateUserUseCase(
    userRepository,
    hashProvider,
    mailProvider
  );

  return useCase;
}
