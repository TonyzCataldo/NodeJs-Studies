import { RefreshTokenRepository } from "../refresh-token-repository";
import { RefreshTokenEntity } from "../../entities/refresh-token-entity";
import { addDays } from "../../../../shared/date/add-days";

export class InMemoryRefreshTokenRepository implements RefreshTokenRepository {
  public items: RefreshTokenEntity[] = [];
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
    sessionId: string;
    revokedAt: Date | null;
  }): Promise<void> {
    const refreshToken: RefreshTokenEntity = {
      id: crypto.randomUUID(),
      createdAt: new Date(),
      tokenHash: data.tokenHash,
      sessionId: crypto.randomUUID(),
      replacedByTokenId: null,
      userId: data.userId,
      ipAddress: data.ipAddress,
      expiresAt: data.expiresAt,
      revokedAt: null,
    };
    this.items.push(refreshToken);
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
    const token = this.items.find((item) => item.tokenHash === tokenHash);
    return token ?? null;
  }

  async revoke(id: string, revokedAt: Date): Promise<void> {
    const token = this.items.find((item) => item.id === id);
    if (token) {
      token.revokedAt = revokedAt;
    }
  }
  async rotate(input: {
    oldId: string;
    revokedAt: Date;
    newId: string;
    newToken: {
      userId: string;
      sessionId: string;
      tokenHash: string;
      expiresAt: Date;
      ipAddress: string;
    };
  }): Promise<void> {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      if (!token) break;
      if (token.id === input.oldId && token.revokedAt === null) {
        token.revokedAt = input.revokedAt;
        token.replacedByTokenId = input.newId;
      }
    }
    const refreshToken: RefreshTokenEntity = {
      id: input.newId,
      createdAt: new Date(),
      tokenHash: input.newToken.tokenHash,
      sessionId: input.newToken.sessionId,
      replacedByTokenId: null,
      userId: input.newToken.userId,
      ipAddress: input.newToken.ipAddress,
      expiresAt: input.newToken.expiresAt,
      revokedAt: null,
    };
    this.items.push(refreshToken);
  }
  async revokeAllAndCreate(input: {
    userId: string;
    revokedAt: Date;
    token: {
      id: string;
      sessionId: string;
      tokenHash: string;
      expiresAt: Date;
      ipAddress: string;
    };
  }): Promise<void> {
    for (let i = 0; i < this.items.length; i++) {
      const token = this.items[i];
      if (!token) break;
      if (token.userId === input.userId && token.revokedAt === null) {
        token.revokedAt = input.revokedAt;
        token.replacedByTokenId = input.token.id;
      }
    }
    const newToken: RefreshTokenEntity = {
      id: input.token.id,
      expiresAt: input.token.expiresAt,
      ipAddress: input.token.ipAddress,
      sessionId: input.token.sessionId,
      tokenHash: input.token.tokenHash,
      createdAt: new Date(),
      userId: input.userId,
      replacedByTokenId: null,
      revokedAt: null,
    };
    this.items.push(newToken);
  }
}
