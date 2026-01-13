export interface QuestionEntity {
  id: string;
  statement: string;
  options: any;
  correctOptionId: string;
  subjectId: string;
  topicId?: string | null;
  assets?: {
    id: string;
    type: string;
    content: string;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
