import { HashRefreshTokenProvider } from "../../../shared/cryptography/hash-refresh-token";
import { OpaqueTokenProvider } from "../../../shared/cryptography/opaque-token-provider";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { addDays } from "../../../shared/date/add-days";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { UserRepository } from "../../users/repositories/user-repository";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";

interface RefreshTokenInput {
  refreshToken: string;
  ipAddress: string;
}

interface RefreshTokenOutput {
  accessToken: string;
  refreshToken: string;
}

export class RefreshTokenUseCase {
  constructor(
    private userRepository: UserRepository,
    private refreshTokenRepository: RefreshTokenRepository,
    private tokenProvider: TokenProvider,
    private hashRefreshTokenProvider: HashRefreshTokenProvider,
    private opaqueTokenProvider: OpaqueTokenProvider
  ) {}

  async execute(input: RefreshTokenInput): Promise<RefreshTokenOutput> {
    const tokenHash = this.hashRefreshTokenProvider.hash(input.refreshToken);
    const stored = await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) throw new AuthenticationError();
    if (stored.revokedAt) throw new AuthenticationError();
    if (stored.expiresAt.getTime() <= Date.now()) {
      await this.refreshTokenRepository.revoke(stored.id, new Date());

      throw new AuthenticationError();
    }
    const user = await this.userRepository.findById(stored.userId);
    if (!user) {
      throw new AuthenticationError();
    }

    const accessToken = await this.tokenProvider.sign({
      subject: user.id,
      type: "access",
      payload: { role: user.role ?? null },
    });

    const refreshToken = this.opaqueTokenProvider.generateOpaqueToken(48);
    const hashRefreshToken = this.hashRefreshTokenProvider.hash(refreshToken);
    const sessionId = stored.sessionId;
    const newId = crypto.randomUUID();

    await this.refreshTokenRepository.rotate({
      oldId: stored.id,
      newId: newId,
      revokedAt: new Date(),
      newToken: {
        userId: user.id,
        sessionId: sessionId,
        tokenHash: hashRefreshToken,
        expiresAt: addDays(new Date(), 7),
        ipAddress: input.ipAddress,
      },
    });
    return { accessToken, refreshToken };
  }
}
