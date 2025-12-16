export interface RefreshTokenEntity {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  revokedAt?: string;
  ipAddress?: string;
}
