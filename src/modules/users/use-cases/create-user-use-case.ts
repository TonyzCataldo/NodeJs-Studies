import { UserRepository } from "../repositories/user-repository";
import { UserAlreadyExistsError } from "../../../shared/errors/user-already-exists-error";
import { HashProvider } from "../../../shared/cryptography/hash-provider";
import { UserEntity } from "../entities/user-entity";
import { IMailProvider } from "../../../shared/providers/mail-provider";
import { randomUUID } from "node:crypto";
import { getVerificationEmailTemplate } from "../../../shared/templates/verification-email-template";

interface CreateUserUseCaseInput {
  name: string;
  email: string;
  password: string;
}

interface CreateUserUseCaseOutput {
  user: Omit<UserEntity, "password_hash">;
}

export class CreateUserUseCase {
  constructor(
    private userRepository: UserRepository,
    private hashProvider: HashProvider,
    private mailProvider: IMailProvider
  ) {}

  async execute({
    name,
    email,
    password,
  }: CreateUserUseCaseInput): Promise<CreateUserUseCaseOutput> {
    const existingUser = await this.userRepository.findByEmail(email);

    if (existingUser) {
      throw new UserAlreadyExistsError();
    }

    const password_hash = await this.hashProvider.hash(password);
    const verificationToken = randomUUID();

    const user = await this.userRepository.create({
      name,
      email,
      password_hash,
      verificationToken,
    });

    const verificationLink = `${
      process.env.APP_URL || "http://localhost:3000"
    }/verify?token=${verificationToken}`;
    const emailBody = getVerificationEmailTemplate({ name, verificationLink });

    await this.mailProvider.sendMail(
      email,
      "Verifique seu email - Tático Questões",
      emailBody
    );

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
