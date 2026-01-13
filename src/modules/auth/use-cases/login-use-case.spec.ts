import { beforeEach, describe, expect, it, vi } from "vitest";
import { LoginUseCase } from "./login-use-case";
import { InMemoryUserRepository } from "../../users/repositories/implementations/in-memory-user-repository";
import { InMemoryRefreshTokenRepository } from "../repositories/implementations/in-memory-refresh-token-repository";
import { FakeHashProvider } from "../../../shared/cryptography/fakes/fake-hash-provider";
import { FakeHashRefreshToken } from "../../../shared/cryptography/fakes/fake-hash-refresh-token";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { FakeOpaqueTokenProvider } from "../../../shared/cryptography/fakes/fake-opaque-token-provider";
import { addDays } from "../../../shared/date/add-days";

let userRepository: InMemoryUserRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let hashProvider: FakeHashProvider;
// tokenProvider is going to be mocked
let tokenProvider: TokenProvider;
let hashRefreshTokenProvider: FakeHashRefreshToken;
let OpaqueTokenProvider: FakeOpaqueTokenProvider;

let sut: LoginUseCase;

describe("Login use case unit tests", () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    hashProvider = new FakeHashProvider();
    // mocking tokenProvider functions
    tokenProvider = {
      sign: vi.fn(),
      verify: vi.fn(),
    };
    hashRefreshTokenProvider = new FakeHashRefreshToken();
    OpaqueTokenProvider = new FakeOpaqueTokenProvider();
    sut = new LoginUseCase(
      userRepository,
      refreshTokenRepository,
      hashProvider,
      hashRefreshTokenProvider,
      tokenProvider,
      OpaqueTokenProvider
    );
  });

  it("should login a user registered and return access token and refresh token", async () => {
    userRepository.items.push({
      id: "444444", // ficctional id to verify the rightness userId from stored refreshtoken
      email: "user@email.com",
      name: "user",
      password_hash: "hashed-123456",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerifiedAt: new Date(),
    });

    //criação de refreshtokens do mesmo usuario para testar invalidação deles
    refreshTokenRepository.items.push({
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      id: crypto.randomUUID(),
      ipAddress: "ip",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "sessao1",
      tokenHash: "hashed-refresh-token",
      userId: "444444",
    });
    refreshTokenRepository.items.push({
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      id: crypto.randomUUID(),
      ipAddress: "ip2",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "sessao2",
      tokenHash: "hashed-refresh-token",
      userId: "444444",
    });
    refreshTokenRepository.items.push({
      createdAt: new Date(),
      expiresAt: addDays(new Date(), 7),
      id: crypto.randomUUID(),
      ipAddress: "ip2",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "sessao2",
      tokenHash: "hashed-refresh-token",
      userId: "444444",
    });

    (tokenProvider.sign as any).mockResolvedValueOnce("access-token");

    const { accessToken, refreshToken } = await sut.execute({
      email: "user@email.com",
      password: "123456",
      ipAddress: "ip",
    });

    expect(
      refreshTokenRepository.items.filter((token) => token.revokedAt === null)
        .length
    ).toBe(1);

    const savedRefreshToken = refreshTokenRepository.items.filter(
      (token) => token.revokedAt === null
    )[0];
    expect(tokenProvider.sign).toHaveBeenNthCalledWith(1, {
      subject: userRepository.items[0]?.id,
      type: "access",
      payload: {
        role: userRepository.items[0]?.role ?? null,
      },
    });

    expect(savedRefreshToken?.userId).toBe("444444");
    expect(savedRefreshToken?.tokenHash).toBe("hashed-refresh-token");
    expect(savedRefreshToken?.ipAddress).toBe("ip");
    expect(accessToken).toBe("access-token");
    expect(refreshToken).toBe("refresh-token");
  });

  it("should not login a user if email is wrong", async () => {
    await expect(
      sut.execute({
        email: "user@email.com",
        password: "123456",
        ipAddress: "ip",
      })
    ).rejects.toBeInstanceOf(AuthenticationError);
    expect(refreshTokenRepository.items.length).toBe(0);
    expect(tokenProvider.sign).not.toHaveBeenCalled();
  });

  it("should not login a user if password is wrong", async () => {
    userRepository.items.push({
      id: "444444", // ficctional id to verify the rightness userId from stored refreshtoken
      email: "user@email.com",
      name: "user",
      password_hash: "hashed-123456",
      createdAt: new Date(),
      updatedAt: new Date(),
      emailVerifiedAt: new Date(),
    });

    await expect(
      sut.execute({
        email: "user@email.com",
        password: "1234567",
        ipAddress: "ip",
      })
    ).rejects.toBeInstanceOf(AuthenticationError);
    expect(refreshTokenRepository.items.length).toBe(0);
    expect(tokenProvider.sign).not.toHaveBeenCalled();
  });
});
