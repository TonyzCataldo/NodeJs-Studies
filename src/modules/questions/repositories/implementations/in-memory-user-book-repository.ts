import { UserBookRepository, SessionData } from "../user-book-repository";

export class InMemoryUserBookRepository implements UserBookRepository {
  public items: { userId: string; data: SessionData }[] = [];
  public attempts: any[] = [];

  async createOrUpdate(userId: string, data: SessionData): Promise<void> {
    const index = this.items.findIndex((item) => item.userId === userId);

    const session = { userId, data };

    if (index >= 0) {
      this.items[index] = session;
    } else {
      this.items.push(session);
    }
  }

  async findByUserId(userId: string): Promise<SessionData | null> {
    const session = this.items.find((item) => item.userId === userId);
    return session ? session.data : null;
  }

  async saveAttempt(
    userId: string,
    questionId: string,
    chosenOptionId: string,
    isCorrect: boolean
  ): Promise<void> {
    this.attempts.push({
      userId,
      questionId,
      chosenOptionId,
      isCorrect,
      createdAt: new Date(),
    });
  }

  async deleteSession(userId: string): Promise<void> {
    this.items = this.items.filter((item) => item.userId !== userId);
  }

  async findAttempts(userId: string, questionIds: string[]): Promise<any[]> {
    return this.attempts
      .filter((a) => a.userId === userId && questionIds.includes(a.questionId))
      .map((a: any) => ({
        ...a,
        question: {
          ...a.question,
          topic: a.question?.topic || { name: "Mock Topic" },
        },
      }));
  }
}
