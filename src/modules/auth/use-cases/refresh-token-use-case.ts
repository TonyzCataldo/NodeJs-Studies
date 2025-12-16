import { HashRefreshTokenProvider } from "../../../shared/cryptography/hash-refresh-token";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { RefreshTokenRepository } from "../repositories/refresh-token-repository";

export class RefreshTokenUseCase {
  constructor(
    private RefreshTokenRepository: RefreshTokenRepository,
    private tokenProvider: TokenProvider,
    private HashRefreshTokenProvider: HashRefreshTokenProvider
  ) {}

  async execute(input: { refreshToken: string }) {
    const decoded = await this.tokenProvider.verify(
      input.refreshToken,
      "refresh"
    );

    if (decoded.type !== "refresh") {
      throw new AuthenticationError();
    }

    const userId = decoded.sub;

    const tokenHash = this.HashRefreshTokenProvider.hash(input.refreshToken);
    const stored = await this.RefreshTokenRepository.findByTokenHash(tokenHash);

    if (!stored) throw new AuthenticationError();
    if (stored.revokedAt) throw new AuthenticationError();
    if (stored.expiresAt.getTime() < Date.now())
      throw new AuthenticationError();

    const accessToken = await this.tokenProvider.sign({
      subject: userId,
      type: "access",
      payload: decoded.payload,
    });

    return { accessToken };
  }
}
