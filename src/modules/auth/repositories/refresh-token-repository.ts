export interface RefreshTokenRepository {
  create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
  }): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    revokedAt: Date | null;
    ipAddress: string | null;
  } | null>;
  revoke(id: string, revokedAt: Date): Promise<void>;
}
