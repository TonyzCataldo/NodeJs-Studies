import { UserRepository } from "../repositories/user-repository";
import { UserAlreadyExistsError } from "../../../shared/errors/user-already-exists-error";
import { HashProvider } from "../../../shared/cryptography/hash-provider";
import { UserEntity } from "../entities/user-entity";

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
    private hashProvider: HashProvider
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

    const user = await this.userRepository.create({
      name,
      email,
      password_hash,
    });

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
