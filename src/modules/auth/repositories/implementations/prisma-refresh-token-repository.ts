import { prisma } from "../../../../infra/db/prisma";
import { RefreshTokenRepository } from "../refresh-token-repository";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
  }): Promise<void> {
    await prisma.refreshToken.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<{
    id: string;
    userId: string;
    expiresAt: Date;
    ipAddress: string | null;
    revokedAt: Date | null;
  } | null> {
    return await prisma.refreshToken.findUnique({
      where: {
        tokenHash,
      },
    });
  }

  async revoke(id: string, revokedAt: Date): Promise<void> {
    await prisma.refreshToken.update({
      where: {
        id,
      },
      data: {
        revokedAt,
      },
    });
  }
}
