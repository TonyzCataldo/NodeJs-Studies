import { QuestionsRepository } from "../repositories/questions-repository";
import { UserBookRepository } from "../repositories/user-book-repository";

interface CreateUserBookUseCaseInput {
  userId: string;
  courseId: string;
  subjectId?: string;
  onlyAnswered?: boolean | undefined;
  onlyCorrect?: boolean | undefined;
  limit: number;
}

interface CreateUserBookUseCaseOutput {
  questionsCount: number;
  sessionData: any;
}

export class CreateUserBookUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private userBookRepository: UserBookRepository
  ) {}

  async execute({
    userId,
    courseId,
    limit,
    onlyAnswered,
    onlyCorrect,
    subjectId,
  }: CreateUserBookUseCaseInput): Promise<CreateUserBookUseCaseOutput> {
    // 1. Busca as questões filtradas
    const questions = await this.questionsRepository.findManyByFilter({
      courseId,
      subjectId,
      limit,
      userId,
      onlyAnswered,
      onlyCorrect,
    });

    // 2. Extrai apenas os IDs e embaralha (Shuffle leve em memória)
    const questionIds = questions
      .map((q) => q.id)
      .sort(() => Math.random() - 0.5);

    // 3. Monta o objeto da sessão
    const sessionData = {
      courseId,
      subjectId,
      filter: { onlyAnswered, onlyCorrect },
      questionIds,
      total: questions.length,
      createdAt: new Date(),
    };

    // 4. Salva (upsert) na "UserCurrentSession"
    await this.userBookRepository.createOrUpdate(userId, sessionData);

    return {
      questionsCount: questions.length,
      sessionData,
    };
  }
}
