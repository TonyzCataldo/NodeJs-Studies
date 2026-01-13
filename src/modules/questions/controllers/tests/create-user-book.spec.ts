import { beforeEach, describe, expect, Mock, vi, it } from "vitest";
import { makeCreateUserBookUseCase } from "../../use-cases/factories/make-create-user-book-use-case";
import { CreateUserBookController } from "../create-user-book";
import { ZodError } from "zod";

vi.mock("../../use-cases/factories/make-create-user-book-use-case", () => ({
  makeCreateUserBookUseCase: vi.fn(),
}));

describe("CreateUserBook Controller Unit Tests", () => {
  function MakeReplyMock() {
    const reply: any = {
      status: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should call UseCase and return 201 with session data on success", async () => {
    const executeMock = vi.fn().mockResolvedValue({
      questionsCount: 10,
      sessionData: { some: "data" },
    });

    (makeCreateUserBookUseCase as Mock).mockReturnValue({
      execute: executeMock,
    });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        courseId: "123e4567-e89b-12d3-a456-426614174000",
        subjectId: "123e4567-e89b-12d3-a456-426614174001",
        limit: 10,
        done: true,
        correct: false,
      },
      user: { sub: "user-id" },
    };

    await CreateUserBookController(request, reply);

    expect(executeMock).toHaveBeenCalledWith({
      userId: "user-id",
      courseId: "123e4567-e89b-12d3-a456-426614174000",
      subjectId: "123e4567-e89b-12d3-a456-426614174001",
      limit: 10,
      onlyAnswered: true,
      onlyCorrect: false,
    });

    expect(reply.status).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Session created successfully",
      total: 10,
      session: { some: "data" },
    });
  });

  it("Should return 401 if user is not authenticated", async () => {
    const executeMock = vi.fn();
    (makeCreateUserBookUseCase as Mock).mockReturnValue({
      execute: executeMock,
    });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        courseId: "123e4567-e89b-12d3-a456-426614174000",
        subjectId: "123e4567-e89b-12d3-a456-426614174001",
      },
      user: undefined, // Sem usuário
    };

    await CreateUserBookController(request, reply);

    expect(executeMock).not.toHaveBeenCalled();
    expect(reply.status).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "User not authenticated",
    });
  });

  it("Should rethrow ZodError on validation failure", async () => {
    const executeMock = vi.fn();
    (makeCreateUserBookUseCase as Mock).mockReturnValue({
      execute: executeMock,
    });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        // Missing fields
        limit: "nan",
      },
      user: { sub: "user-id" },
    };

    await expect(
      CreateUserBookController(request, reply)
    ).rejects.toBeInstanceOf(ZodError);
    expect(executeMock).not.toHaveBeenCalled();
  });
});
