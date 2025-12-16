import { HashProvider } from "../../../shared/cryptography/hash-provider";
import { HashRefreshTokenProvider } from "../../../shared/cryptography/hash-refresh-token";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { addDays } from "../../../shared/date/add-days";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { UserRepository } from "../../users/repositories/user-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";

interface LoginUseCaseInput {
  email: string;
  password: string;
  ipAddress: string;
}

interface LoginUseCaseOutput {
  accessToken: string;
  refreshToken: string;
}

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private hashProvider: HashProvider,
    private hashRefreshTokenProvider: HashRefreshTokenProvider,
    private tokenProvider: TokenProvider
  ) {}

  async execute({
    email,
    password,
    ipAddress,
  }: LoginUseCaseInput): Promise<LoginUseCaseOutput> {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new AuthenticationError();
    }
    const compare = await this.hashProvider.compare(
      password,
      user.password_hash
    );
    if (!compare) {
      throw new AuthenticationError();
    }

    const accessToken = await this.tokenProvider.sign({
      subject: user.id,
      type: "access",
      payload: {
        role: user.role ?? null,
      },
    });

    const refreshToken = await this.tokenProvider.sign({
      subject: user.id,
      type: "refresh",
      payload: {
        role: user.role ?? null,
      },
    });

    await this.refreshTokenRepository.create({
      userId: user.id,
      expiresAt: addDays(new Date(), 7),
      tokenHash: this.hashRefreshTokenProvider.hash(refreshToken),
      ipAddress,
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
