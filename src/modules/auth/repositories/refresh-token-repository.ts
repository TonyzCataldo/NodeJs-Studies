import { RefreshTokenEntity } from "../entities/refresh-token-entity";

export interface RefreshTokenRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
    sessionId: string;
  }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null>;
  revoke(id: string, revokedAt: Date): Promise<void>;
  rotate(input: {
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
  }): Promise<void>;
  revokeAllAndCreate(input: {
    userId: string;
    revokedAt: Date;
    token: {
      id: string;
      sessionId: string;
      tokenHash: string;
      expiresAt: Date;
      ipAddress: string;
    };
  }): Promise<void>;
}
