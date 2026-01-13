import { QuestionEntity } from "../entities/question";
import { QuestionsRepository } from "../repositories/questions-repository";
import {
  UserBookRepository,
  SessionData,
} from "../repositories/user-book-repository";

interface GetUserBookUseCaseOutput {
  session: SessionData;
  questions: QuestionEntity[];
}

export class GetUserBookUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private userBookRepository: UserBookRepository
  ) {}

  async execute(userId: string): Promise<GetUserBookUseCaseOutput | null> {
    const session = await this.userBookRepository.findByUserId(userId);

    if (!session) {
      return null;
    }

    const questions = await this.questionsRepository.findByIds(
      session.questionIds
    );

    // Opcional: Reordenar as questões fetched para bater com a ordem do session.questionIds
    // (O banco SQL pode retornar fora de ordem, e a ordem do ID array é a ordem shuffled)
    const questionsMap = new Map(questions.map((q) => [q.id, q]));

    const orderedQuestions = session.questionIds
      .map((id) => questionsMap.get(id))
      .filter((q): q is QuestionEntity => !!q);

    return {
      session,
      questions: orderedQuestions,
    };
  }
}
