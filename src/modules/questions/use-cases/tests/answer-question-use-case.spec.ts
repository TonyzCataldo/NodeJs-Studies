import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryQuestionsRepository } from "../../repositories/implementations/in-memory-questions-repository";
import { InMemoryUserBookRepository } from "../../repositories/implementations/in-memory-user-book-repository";
import { AnswerQuestionUseCase } from "../answer-question-use-case";

let questionsRepository: InMemoryQuestionsRepository;
let userBookRepository: InMemoryUserBookRepository;
let sut: AnswerQuestionUseCase;

describe("Answer Question Use Case", () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    userBookRepository = new InMemoryUserBookRepository();
    sut = new AnswerQuestionUseCase(questionsRepository, userBookRepository);
  });

  it("should be able to answer a question correctly", async () => {
    // Arrange
    questionsRepository.items.push({
      id: "q-1",
      statement: "Question 1",
      subjectId: "math",
      options: {},
      correctOptionId: "opt-a",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await sut.execute({
      userId: "user-1",
      questionId: "q-1",
      chosenOptionId: "opt-a",
    });

    // Assert
    expect(result.isCorrect).toBe(true);
    expect(result.correctOptionId).toBe("opt-a");

    // Verify persistence
    expect(userBookRepository.attempts).toHaveLength(1);
    expect(userBookRepository.attempts[0]).toMatchObject({
      userId: "user-1",
      questionId: "q-1",
      chosenOptionId: "opt-a",
      isCorrect: true,
    });
  });

  it("should be able to answer a question incorrectly", async () => {
    // Arrange
    questionsRepository.items.push({
      id: "q-1",
      statement: "Question 1",
      subjectId: "math",
      options: {},
      correctOptionId: "opt-a",
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    // Act
    const result = await sut.execute({
      userId: "user-1",
      questionId: "q-1",
      chosenOptionId: "opt-b", // Errado
    });

    // Assert
    expect(result.isCorrect).toBe(false);
    expect(result.correctOptionId).toBe("opt-a");

    // Verify persistence
    expect(userBookRepository.attempts).toHaveLength(1);
    expect(userBookRepository.attempts[0]).toMatchObject({
      userId: "user-1",
      questionId: "q-1",
      chosenOptionId: "opt-b",
      isCorrect: false,
    });
  });

  it("should throw error if question does not exist", async () => {
    await expect(() =>
      sut.execute({
        userId: "user-1",
        questionId: "fake-id",
        chosenOptionId: "opt-a",
      })
    ).rejects.toThrow("Question not found");
  });
});
