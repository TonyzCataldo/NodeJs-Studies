import { CryptoOpaqueTokenProvider } from "../../../../infra/cryptography/crypto-opaque-token-provider";
import { JwtTokenProvider } from "../../../../infra/cryptography/jwt-token-provider";
import { Sha256HashProvider } from "../../../../infra/cryptography/sha256-hash-provider";
import { PrismaUserRepository } from "../../../users/repositories/implementations/prisma-user-repository";
import { PrismaRefreshTokenRepository } from "../../repositories/implementations/prisma-refresh-token-repository";
import { RefreshTokenUseCase } from "../refresh-token-use-case";

export function MakeRefreshTokenUseCase() {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();
  const tokenProvider = new JwtTokenProvider();
  const hashRefreshTokenProvider = new Sha256HashProvider();
  const opaqueTokenProvider = new CryptoOpaqueTokenProvider();

  const useCase = new RefreshTokenUseCase(
    userRepository,
    refreshTokenRepository,
    tokenProvider,
    hashRefreshTokenProvider,
    opaqueTokenProvider
  );
  return useCase;
}
