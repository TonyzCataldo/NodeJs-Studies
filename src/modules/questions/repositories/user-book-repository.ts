export type SessionData = {
  courseId: string;
  subjectId?: string | undefined;
  filter: {
    onlyAnswered?: boolean | undefined;
    onlyCorrect?: boolean | undefined;
  };
  questionIds: string[];
  total: number;
  createdAt: Date;
};

export interface UserBookRepository {
  createOrUpdate(userId: string, data: SessionData): Promise<void>;
  findByUserId(userId: string): Promise<SessionData | null>;
  saveAttempt(
    userId: string,
    questionId: string,
    chosenOptionId: string,
    isCorrect: boolean
  ): Promise<void>;
  deleteSession(userId: string): Promise<void>;
  findAttempts(userId: string, questionIds: string[]): Promise<any[]>;
}
