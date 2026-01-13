import { describe, expect, it, beforeEach } from "vitest";
import { InMemoryQuestionsRepository } from "../../repositories/implementations/in-memory-questions-repository";
import { InMemoryUserBookRepository } from "../../repositories/implementations/in-memory-user-book-repository";
import { GetUserBookUseCase } from "../get-user-book-use-case";

let questionsRepository: InMemoryQuestionsRepository;
let userBookRepository: InMemoryUserBookRepository;
let sut: GetUserBookUseCase;

describe("Get User Book Use Case", () => {
  beforeEach(() => {
    questionsRepository = new InMemoryQuestionsRepository();
    userBookRepository = new InMemoryUserBookRepository();
    sut = new GetUserBookUseCase(questionsRepository, userBookRepository);
  });

  it("should be able to get the current user book (session)", async () => {
    // 1. Arrange: Criar sessão mockada
    const sessionData = {
      courseId: "course-1",
      questionIds: ["q-3", "q-1", "q-2"], // Ordem embaralhada
      total: 3,
      filter: {},
      createdAt: new Date(),
    };
    await userBookRepository.createOrUpdate("user-1", sessionData);

    // Criar as questões no repo (em ordem "padrão")
    questionsRepository.items.push(
      {
        id: "q-1",
        statement: "Q1",
        subjectId: "a",
        options: {},
        correctOptionId: "a",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q-2",
        statement: "Q2",
        subjectId: "a",
        options: {},
        correctOptionId: "a",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "q-3",
        statement: "Q3",
        subjectId: "a",
        options: {},
        correctOptionId: "a",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    );

    // 2. Act
    const result = await sut.execute("user-1");

    // 3. Assert
    expect(result).not.toBeNull();
    if (!result) return;

    expect(result.session).toEqual(sessionData);
    expect(result.questions).toHaveLength(3);

    // CRUCIAL: A ordem das questões deve seguir a ordem do ID na Sessão (q-3, q-1, q-2)
    expect(result.questions[0]?.id).toEqual("q-3");
    expect(result.questions[1]?.id).toEqual("q-1");
    expect(result.questions[2]?.id).toEqual("q-2");
  });

  it("should return null if user has no session", async () => {
    const result = await sut.execute("user-no-session");
    expect(result).toBeNull();
  });
});
