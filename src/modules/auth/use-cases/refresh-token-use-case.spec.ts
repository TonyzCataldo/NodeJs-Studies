import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { InMemoryRefreshTokenRepository } from "../repositories/implementations/in-memory-refresh-token-repository";
import { TokenProvider } from "../../../shared/cryptography/token-provider";
import { FakeHashRefreshToken } from "../../../shared/cryptography/fakes/fake-hash-refresh-token";
import { addDays } from "../../../shared/date/add-days";
import { RefreshTokenUseCase } from "./refresh-token-use-case";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import { InMemoryUserRepository } from "../../users/repositories/implementations/in-memory-user-repository";
import { FakeOpaqueTokenProvider } from "../../../shared/cryptography/fakes/fake-opaque-token-provider";
import { RefreshTokenEntity } from "../entities/refresh-token-entity";

let userRepository: InMemoryUserRepository;
let refreshTokenRepository: InMemoryRefreshTokenRepository;
let tokenProvider: TokenProvider;
let hashRefreshTokenProvider: FakeHashRefreshToken;
let opaqueTokenProvider: FakeOpaqueTokenProvider;
let sut: RefreshTokenUseCase;

describe("Refresh Token Use Case", () => {
  const NOW = new Date("2026-01-02T12:00:00.000Z");
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);

    userRepository = new InMemoryUserRepository();
    refreshTokenRepository = new InMemoryRefreshTokenRepository();
    tokenProvider = { sign: vi.fn(), verify: vi.fn() };
    hashRefreshTokenProvider = new FakeHashRefreshToken();
    opaqueTokenProvider = new FakeOpaqueTokenProvider();
    sut = new RefreshTokenUseCase(
      userRepository,
      refreshTokenRepository,
      tokenProvider,
      hashRefreshTokenProvider,
      opaqueTokenProvider
    );
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("should validate refresh token, find in repository, rotate refresh token and create new access token", async () => {
    const token = "refreshtoken";
    const ip = "ip1";
    userRepository.items.push({
      id: "userid1",
      createdAt: NOW,
      email: "user@email.com",
      name: "username",
      updatedAt: NOW,
      role: "user",
      password_hash: "hashed-password123",
    });

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: NOW,
      expiresAt: addDays(NOW, 7),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    (tokenProvider.sign as any).mockResolvedValueOnce("access-token");

    const uuidSpy = vi
      .spyOn(crypto, "randomUUID")
      .mockReturnValue("new-id-123-456-789");

    const { accessToken, refreshToken } = await sut.execute({
      ipAddress: ip,
      refreshToken: token,
    });

    const oldToken = refreshTokenRepository.items.find(
      (token) => token.id === "randomid1"
    );
    expect(accessToken).toBe("access-token");
    expect(refreshToken).toBe("refresh-token");

    expect(oldToken?.replacedByTokenId).toBe("new-id-123-456-789");
    expect(oldToken?.revokedAt).not.toBeNull();
    expect(
      refreshTokenRepository.items.find((token) => token.revokedAt === null)
    ).toEqual({
      id: "new-id-123-456-789",
      createdAt: NOW,
      expiresAt: addDays(NOW, 7),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refresh-token",
      userId: "userid1",
    });
  });

  it("Should not return a access token and return AuthError if the refresh token dont exists in db", async () => {
    const token = "non-existent-token";
    const ip = "ip2";

    userRepository.items.push({
      id: "userid1",
      createdAt: NOW,
      email: "user@email.com",
      name: "username",
      updatedAt: NOW,
      role: "user",
      password_hash: "hashed-password123",
    });

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: NOW,
      expiresAt: addDays(NOW, 7),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    await expect(
      sut.execute({ refreshToken: token, ipAddress: ip })
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(tokenProvider.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.items.length).toBe(1);
  });

  it("Should not return a access token and return AuthError if the refresh token is revoked", async () => {
    const token = "refreshtoken";
    const ip = "ip2";

    userRepository.items.push({
      id: "userid1",
      createdAt: NOW,
      email: "user@email.com",
      name: "username",
      updatedAt: NOW,
      role: "user",
      password_hash: "hashed-password123",
    });

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: addDays(NOW, -2),
      expiresAt: addDays(NOW, 5),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: addDays(NOW, -1),
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    const oldToken = refreshTokenRepository.items.find(
      (token) => token.id === "randomid1"
    );

    await expect(
      sut.execute({ refreshToken: token, ipAddress: ip })
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(tokenProvider.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.items.length).toBe(1);
    expect(oldToken?.replacedByTokenId).toBeNull();
  });

  it("Should not return a access token and return AuthError if the refresh token is expired", async () => {
    const token = "refreshtoken";
    const ip = "ip2";

    userRepository.items.push({
      id: "userid1",
      createdAt: NOW,
      email: "user@email.com",
      name: "username",
      updatedAt: NOW,
      role: "user",
      password_hash: "hashed-password123",
    });

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: addDays(NOW, -7),
      expiresAt: NOW,
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    const oldToken = refreshTokenRepository.items.find(
      (token) => token.id === "randomid1"
    );

    await expect(
      sut.execute({ refreshToken: token, ipAddress: ip })
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(tokenProvider.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.items.length).toBe(1);
    expect(oldToken?.revokedAt).toEqual(NOW);
    expect(oldToken?.replacedByTokenId).toBeNull();
  });

  it("Should not return a access token and return AuthError if user dont exists in db", async () => {
    const token = "refreshtoken";
    const ip = "ip2";

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: NOW,
      expiresAt: addDays(NOW, 7),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    const oldToken = refreshTokenRepository.items.find(
      (token) => token.id === "randomid1"
    );

    await expect(
      sut.execute({ refreshToken: token, ipAddress: ip })
    ).rejects.toBeInstanceOf(AuthenticationError);

    expect(tokenProvider.sign).not.toHaveBeenCalled();
    expect(refreshTokenRepository.items.length).toBe(1);
    expect(oldToken?.replacedByTokenId).toBeNull();
    expect(oldToken?.revokedAt).toBeNull();
  });

  it("Should not return a access token and throw error if tokenProvider fails", async () => {
    const token = "refreshtoken";
    const ip = "ip2";

    userRepository.items.push({
      id: "userid1",
      createdAt: NOW,
      email: "user@email.com",
      name: "username",
      updatedAt: NOW,
      role: "user",
      password_hash: "hashed-password123",
    });

    refreshTokenRepository.items.push({
      id: "randomid1",
      createdAt: NOW,
      expiresAt: addDays(NOW, 7),
      ipAddress: "ip1",
      replacedByTokenId: null,
      revokedAt: null,
      sessionId: "session1",
      tokenHash: "hashed-refreshtoken",
      userId: "userid1",
    });

    const oldToken = refreshTokenRepository.items.find(
      (token) => token.id === "randomid1"
    );
    (tokenProvider.sign as any).mockRejectedValue(new Error());

    await expect(
      sut.execute({ refreshToken: token, ipAddress: ip })
    ).rejects.toThrow(Error);

    expect(refreshTokenRepository.items.length).toBe(1);
    expect(oldToken?.replacedByTokenId).toBeNull();
    expect(oldToken?.revokedAt).toBeNull();
  });
});
