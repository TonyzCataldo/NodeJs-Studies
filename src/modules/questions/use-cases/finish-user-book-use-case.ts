import { UserBookRepository } from "../repositories/user-book-repository";

interface FinishUserBookUseCaseInput {
  userId: string;
}

interface FinishUserBookUseCaseOutput {
  score: number;
  totalQuestions: number;
  correctCount: number;
  weakTopic: string | null;
}

export class FinishUserBookUseCase {
  constructor(private userBookRepository: UserBookRepository) {}

  async execute({
    userId,
  }: FinishUserBookUseCaseInput): Promise<FinishUserBookUseCaseOutput> {
    // 1. Get user current session
    const session = await this.userBookRepository.findByUserId(userId);

    if (!session) {
      throw new Error("Session not found");
    }

    const questionIds = session.questionIds || [];

    // 2. Get user attempts for these questions
    const attempts = await this.userBookRepository.findAttempts(
      userId,
      questionIds
    );

    // 3. Calculate Stats
    const totalQuestions = session.total || questionIds.length;
    let correctCount = 0;
    const errorsByTopic: Record<string, number> = {};

    attempts.forEach((attempt) => {
      if (attempt.isCorrect) {
        correctCount++;
      } else {
        // Track Errors by Topic
        const topicName = attempt.question?.topic?.name;
        if (topicName) {
          errorsByTopic[topicName] = (errorsByTopic[topicName] || 0) + 1;
        }
      }
    });

    const score = Math.round((correctCount / totalQuestions) * 100) || 0;

    // 4. Find weakest topic (max errors)
    let weakTopic = null;
    let maxErrors = 0;

    for (const [topic, count] of Object.entries(errorsByTopic)) {
      if (count > maxErrors) {
        maxErrors = count;
        weakTopic = topic;
      }
    }

    // 5. Delete Session (Clean up)
    await this.userBookRepository.deleteSession(userId);

    return {
      score,
      totalQuestions,
      correctCount,
      weakTopic,
    };
  }
}
