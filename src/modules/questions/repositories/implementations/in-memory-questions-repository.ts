import { QuestionEntity } from "../../entities/question";
import {
  FindQuestionsFilter,
  QuestionsRepository,
} from "../questions-repository";

export class InMemoryQuestionsRepository implements QuestionsRepository {
  public items: QuestionEntity[] = [];

  async findManyByFilter({
    courseId,
    limit,
    subjectId,
    userId,
    onlyAnswered,
    onlyCorrect,
  }: FindQuestionsFilter): Promise<QuestionEntity[]> {
    let questions = this.items;

    // 1. Filtrar por Curso (Obrigatório)
    // Na vida real o Subject teria courseId, aqui vamos simplificar ou assumir que o mock
    // já popula dados consistentes.
    // Mas se quiser filtrar mesmo:
    // questions = questions.filter(q => q.subject.courseId === courseId) <-- mock complexo

    if (subjectId) {
      questions = questions.filter((q) => q.subjectId === subjectId);
    }

    // 2. Filtro de Progresso (Mock simples)
    if (userId) {
      if (onlyAnswered === true) {
        // Mock: Vamos assumir que temos um campo 'attempts' no Objeto para facilitar?
        // Ou criar um InMemoryAttemptsRepo?
        // Para simplificar o teste UNITÁRIO do UseCase, podemos apenas retornar o que foi mockado
        // sem implementar a lógica complexa de filtro de attempts aqui.
        // O foco é testar se o UseCase CHAMA o método e usa o retorno.
      }
    }

    return questions.slice(0, limit);
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    const question = this.items.find((item) => item.id === id);
    return question ?? null;
  }

  async findByIds(ids: string[]): Promise<QuestionEntity[]> {
    return this.items.filter((item) => ids.includes(item.id));
  }
}
