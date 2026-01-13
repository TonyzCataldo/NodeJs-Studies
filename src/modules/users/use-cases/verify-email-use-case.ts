import { ResourceNotFoundError } from "../../../shared/errors/resource-not-found-error";
import { UserRepository } from "../repositories/user-repository";

interface VerifyEmailUseCaseInput {
  token: string;
}

export class VerifyEmailUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute({ token }: VerifyEmailUseCaseInput): Promise<void> {
    const user = await this.userRepository.findByVerificationToken(token);

    if (!user) {
      throw new ResourceNotFoundError();
    }

    user.emailVerifiedAt = new Date();
    user.verificationToken = null;

    await this.userRepository.save(user);
  }
}
