import { prisma } from "../../../../infra/db/prisma";
import { QuestionEntity } from "../../entities/question";
import {
  FindQuestionsFilter,
  QuestionsRepository,
} from "../questions-repository";
export class PrismaQuestionsRepository implements QuestionsRepository {
  async findManyByFilter({
    courseId,
    subjectId,
    limit,
    userId,
    onlyAnswered,
    onlyCorrect,
  }: FindQuestionsFilter): Promise<QuestionEntity[]> {
    const where: any = {};

    // 1. Filtro de Hierarquia (Curso -> Materia)
    if (subjectId) {
      where.subjectId = subjectId;
    } else {
      // Se não tem subjectId, busca todas as matérias daquele CURSO
      where.subject = {
        courseId: courseId,
      };
    }

    // 2. Filtro de Progresso (User Attempts)
    if (userId) {
      if (onlyAnswered === true) {
        // Lógica "Last Attempt": Busca a última tentativa de cada questão
        // para decidir se ela conta como Certa ou Errada atualmente.

        const latestAttempts = await prisma.userAttempt.findMany({
          where: { userId },
          distinct: ["questionId"], // Garante 1 linha por questão
          orderBy: [{ questionId: "asc" }, { createdAt: "desc" }], // Postgres exige questionId primeiro
          select: { questionId: true, isCorrect: true },
        });

        // Filtra os IDs baseado no status da ÚLTIMA tentativa
        const filteredIds = latestAttempts
          .filter(
            (a) => onlyCorrect === undefined || a.isCorrect === onlyCorrect
          )
          .map((a) => a.questionId);

        // Adiciona ao filtro principal
        where.id = { in: filteredIds };
      } else if (onlyAnswered === false) {
        // Apenas NÃO respondidas ("Novas")
        // Aqui mantemos a lógica: se teve QUALQUER tentativa, não é nova.
        where.attempts = {
          none: {
            userId: userId,
          },
        };
      }
    }

    // Como o Prisma não tem "Random Order" nativo eficiente,
    // buscamos normal e o UseCase/Service pode embaralhar,
    // OU usamos queryRaw se precisar de performance extrema com RANDOM().
    // Por enquanto, vamos de findMany simples.

    const questions = await prisma.question.findMany({
      where,
      take: limit,
      include: {
        assets: true,
      },
    });

    return questions.map((q) => ({
      id: q.id,
      statement: q.statement,
      options: q.options,
      correctOptionId: q.correctOptionId,
      subjectId: q.subjectId,
      topicId: q.topicId,
      assets: q.assets,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }

  async findById(id: string): Promise<QuestionEntity | null> {
    const question = await prisma.question.findUnique({
      where: { id },
      include: { assets: true },
    });

    if (!question) return null;

    return {
      id: question.id,
      statement: question.statement,
      options: question.options,
      correctOptionId: question.correctOptionId,
      subjectId: question.subjectId,
      topicId: question.topicId,
      assets: question.assets,
      createdAt: question.createdAt,
      updatedAt: question.updatedAt,
    };
  }

  async findByIds(ids: string[]): Promise<QuestionEntity[]> {
    const questions = await prisma.question.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      include: { assets: true },
    });

    return questions.map((q) => ({
      id: q.id,
      statement: q.statement,
      options: q.options,
      correctOptionId: q.correctOptionId,
      subjectId: q.subjectId,
      topicId: q.topicId,
      assets: q.assets,
      createdAt: q.createdAt,
      updatedAt: q.updatedAt,
    }));
  }
}
