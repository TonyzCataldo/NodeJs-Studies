export interface RefreshTokenEntity {
  id: string;
  userId: string;
  sessionId: string;
  tokenHash: string;
  createdAt: Date;
  expiresAt: Date;
  revokedAt: Date | null;
  ipAddress: string | null;
  replacedByTokenId: string | null;
}
