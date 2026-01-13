import { prisma } from "../../../../infra/db/prisma";
import { AuthenticationError } from "../../../../shared/errors/authentication-error";
import { RefreshTokenEntity } from "../../entities/refresh-token-entity";
import { RefreshTokenRepository } from "../refresh-token-repository";

export class PrismaRefreshTokenRepository implements RefreshTokenRepository {
  async create(data: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
    ipAddress: string;
    sessionId: string;
  }): Promise<void> {
    await prisma.refreshToken.create({
      data,
    });
  }

  async findByTokenHash(tokenHash: string): Promise<RefreshTokenEntity | null> {
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
    await prisma.$transaction(async (tx) => {
      const updated = await tx.refreshToken.updateMany({
        where: { id: input.oldId, revokedAt: null },
        data: { revokedAt: input.revokedAt, replacedByTokenId: input.newId },
      });

      if (updated.count === 0) {
        throw new AuthenticationError(); // reuse/corrida
      }

      await tx.refreshToken.create({
        data: {
          id: input.newId,
          userId: input.newToken.userId,
          sessionId: input.newToken.sessionId,
          tokenHash: input.newToken.tokenHash,
          expiresAt: input.newToken.expiresAt,
          ipAddress: input.newToken.ipAddress,
        },
      });
    });
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
    await prisma.$transaction(async (tx) => {
      await tx.refreshToken.updateMany({
        where: { userId: input.userId, revokedAt: null },
        data: { revokedAt: input.revokedAt, replacedByTokenId: input.token.id },
      });

      await tx.refreshToken.create({
        data: {
          id: input.token.id,
          userId: input.userId,
          sessionId: input.token.sessionId,
          tokenHash: input.token.tokenHash,
          expiresAt: input.token.expiresAt,
          ipAddress: input.token.ipAddress,
        },
      });
    });
  }
}
