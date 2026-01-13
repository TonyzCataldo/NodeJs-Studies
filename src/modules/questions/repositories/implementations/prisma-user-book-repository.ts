import { prisma } from "../../../../infra/db/prisma";
import { UserBookRepository, SessionData } from "../user-book-repository";

export class PrismaUserBookRepository implements UserBookRepository {
  async createOrUpdate(userId: string, data: SessionData): Promise<void> {
    await prisma.userCurrentSession.upsert({
      where: {
        userId,
      },
      create: {
        userId,
        data: data as any, // Prisma Json type workaround
      },
      update: {
        data: data as any,
      },
    });
  }

  async findByUserId(userId: string): Promise<SessionData | null> {
    const session = await prisma.userCurrentSession.findUnique({
      where: { userId },
    });

    if (!session) return null;

    return session.data as unknown as SessionData;
  }

  async saveAttempt(
    userId: string,
    questionId: string,
    chosenOptionId: string,
    isCorrect: boolean
  ): Promise<void> {
    await prisma.userAttempt.create({
      data: {
        userId,
        questionId,
        chosenOptionId,
        isCorrect,
      },
    });
  }

  async deleteSession(userId: string): Promise<void> {
    await prisma.userCurrentSession.deleteMany({
      where: {
        userId,
      },
    });
  }

  async findAttempts(userId: string, questionIds: string[]): Promise<any[]> {
    return await prisma.userAttempt.findMany({
      where: {
        userId,
        questionId: {
          in: questionIds,
        },
      },
      include: {
        question: {
          include: {
            topic: true,
          },
        },
      },
    });
  }
}
