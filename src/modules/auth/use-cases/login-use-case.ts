import { HashProvider } from "../../../shared/cryptography/hash-provider";
import { HashRefreshTokenProvider } from "../../../shared/cryptography/hash-refresh-token";
import { OpaqueTokenProvider } from "../../../shared/cryptography/opaque-token-provider";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { addDays } from "../../../shared/date/add-days";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { EmailNotVerifiedError } from "../../../shared/errors/email-not-verified-error";
import { UserRepository } from "../../users/repositories/user-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";
import crypto from "node:crypto";

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
    private tokenProvider: TokenProvider,
    private opaqueTokenProvider: OpaqueTokenProvider
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

    if (!user.emailVerifiedAt) {
      throw new EmailNotVerifiedError();
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

    const refreshToken = this.opaqueTokenProvider.generateOpaqueToken(48);
    const sessionId = crypto.randomUUID();
    const newTokenId = crypto.randomUUID();
    const hashRefreshToken = this.hashRefreshTokenProvider.hash(refreshToken);

    await this.refreshTokenRepository.revokeAllAndCreate({
      userId: user.id,
      revokedAt: new Date(),
      token: {
        id: newTokenId,
        sessionId: sessionId,
        tokenHash: hashRefreshToken,
        expiresAt: addDays(new Date(), 7),
        ipAddress: ipAddress,
      },
    });

    return {
      accessToken,
      refreshToken,
    };
  }
}
