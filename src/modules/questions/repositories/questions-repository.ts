import { QuestionEntity } from "../entities/question";

export type FindQuestionsFilter = {
  courseId: string;
  subjectId?: string | undefined;
  limit: number;
  userId?: string | undefined;
  onlyAnswered?: boolean | undefined;
  onlyCorrect?: boolean | undefined;
};

export interface QuestionsRepository {
  findManyByFilter(filters: FindQuestionsFilter): Promise<QuestionEntity[]>;
  findById(id: string): Promise<QuestionEntity | null>;
  findByIds(ids: string[]): Promise<QuestionEntity[]>;
}
