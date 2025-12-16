import { BcryptHashProvider } from "../../../../infra/cryptography/bcrypt-hash-provider";
import { JwtTokenProvider } from "../../../../infra/cryptography/jwt-token-provider";
import { Sha256HashProvider } from "../../../../infra/cryptography/sha256-hash-provider";
import { PrismaUserRepository } from "../../../users/repositories/implementations/prisma-user-repository";
import { PrismaRefreshTokenRepository } from "../../repositories/implementations/prisma-refresh-token-repository";
import { LoginUseCase } from "../login-use-case";

export function MakeLoginUseCase() {
  const userRepository = new PrismaUserRepository();
  const refreshTokenRepository = new PrismaRefreshTokenRepository();
  const hashProvider = new BcryptHashProvider();
  const tokenProvider = new JwtTokenProvider();
  const hashRefreshTokenProvider = new Sha256HashProvider();
  const useCase = new LoginUseCase(
    userRepository,
    refreshTokenRepository,
    hashProvider,
    hashRefreshTokenProvider,
    tokenProvider
  );

  return useCase;
}
