import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryUserBookRepository } from "../../repositories/implementations/in-memory-user-book-repository";
import { FinishUserBookUseCase } from "../finish-user-book-use-case";

let userBookRepository: InMemoryUserBookRepository;
let sut: FinishUserBookUseCase;

describe("Finish User Book Use Case", () => {
  beforeEach(() => {
    userBookRepository = new InMemoryUserBookRepository();
    sut = new FinishUserBookUseCase(userBookRepository);
  });

  it("should be able to finish a book and get stats", async () => {
    // 1. Setup Session
    await userBookRepository.createOrUpdate("user-1", {
      questionIds: ["q1", "q2", "q3"],
      total: 3,
      courseId: "course-1",
      filter: {},
      createdAt: new Date(),
    });

    // 2. Setup Attempts
    // q1: Correct (Topic A)
    // q2: Incorrect (Topic B)
    // q3: Incorrect (Topic B) -> Weak Topic should be B
    userBookRepository.attempts.push(
      {
        id: "a1",
        userId: "user-1",
        questionId: "q1",
        isCorrect: true,
        chosenOptionId: "opt-1",
        createdAt: new Date(),
        question: { topic: { name: "Topic A" } },
      },
      {
        id: "a2",
        userId: "user-1",
        questionId: "q2",
        isCorrect: false,
        chosenOptionId: "opt-2",
        createdAt: new Date(),
        question: { topic: { name: "Topic B" } },
      },
      {
        id: "a3",
        userId: "user-1",
        questionId: "q3",
        isCorrect: false,
        chosenOptionId: "opt-3",
        createdAt: new Date(),
        question: { topic: { name: "Topic B" } },
      }
    );

    const result = await sut.execute({ userId: "user-1" });

    expect(result.score).toBe(33); // 1/3 correct
    expect(result.correctCount).toBe(1);
    expect(result.totalQuestions).toBe(3);
    expect(result.weakTopic).toBe("Topic B");

    // Verify Session Deletion
    const session = await userBookRepository.findByUserId("user-1");
    expect(session).toBeNull();
  });

  it("should throw error if session does not exist", async () => {
    await expect(() =>
      sut.execute({ userId: "non-existing-user" })
    ).rejects.toThrow("Session not found");
  });
});
