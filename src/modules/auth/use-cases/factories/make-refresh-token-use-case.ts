import { JwtTokenProvider } from "../../../../infra/cryptography/jwt-token-provider";
import { Sha256HashProvider } from "../../../../infra/cryptography/sha256-hash-provider";
import { PrismaRefreshTokenRepository } from "../../repositories/implementations/prisma-refresh-token-repository";
import { RefreshTokenUseCase } from "../refresh-token-use-case";

export function MakeRefreshTokenUseCase() {
  const RefreshTokenRepository = new PrismaRefreshTokenRepository();
  const tokenProvider = new JwtTokenProvider();
  const hashRefreshTokenProvider = new Sha256HashProvider();

  const useCase = new RefreshTokenUseCase(
    RefreshTokenRepository,
    tokenProvider,
    hashRefreshTokenProvider
  );
  return useCase;
}
