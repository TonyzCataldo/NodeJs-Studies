import { QuestionsRepository } from "../repositories/questions-repository";
import { UserBookRepository } from "../repositories/user-book-repository";

interface AnswerQuestionUseCaseInput {
  userId: string;
  questionId: string;
  chosenOptionId: string;
}

interface AnswerQuestionUseCaseOutput {
  isCorrect: boolean;
  correctOptionId: string;
}

export class AnswerQuestionUseCase {
  constructor(
    private questionsRepository: QuestionsRepository,
    private userBookRepository: UserBookRepository
  ) {}

  async execute({
    userId,
    questionId,
    chosenOptionId,
  }: AnswerQuestionUseCaseInput): Promise<AnswerQuestionUseCaseOutput> {
    // 1. Verificar se a questão existe
    const question = await this.questionsRepository.findById(questionId);

    if (!question) {
      throw new Error("Question not found");
    }

    // 2. Verificar se está correto
    const isCorrect = question.correctOptionId === chosenOptionId;

    // 3. Salvar tentativa
    await this.userBookRepository.saveAttempt(
      userId,
      questionId,
      chosenOptionId,
      isCorrect
    );

    return {
      isCorrect,
      correctOptionId: question.correctOptionId,
    };
  }
}
