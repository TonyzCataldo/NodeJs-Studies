import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { makeCreateUserUseCase } from "../../use-cases/factories/make-create-user-use-case";
import { createUserController } from "../create-user-controller";
import { ZodError } from "zod";
import { UserAlreadyExistsError } from "../../../../shared/errors/user-already-exists-error";

vi.mock("../../use-cases/factories/make-create-user-use-case", () => ({
  makeCreateUserUseCase: vi.fn(),
}));

describe("create-user-controller", () => {
  function makeReplyMock() {
    const reply: any = {
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should call use case and return 201", async () => {
    const executeMock = vi.fn();
    (makeCreateUserUseCase as Mock).mockReturnValue({ execute: executeMock });
    const request: any = {
      body: {
        name: "user",
        email: "user@email.com",
        password: "123456",
      },
    };
    const reply = makeReplyMock();
    await createUserController(request, reply);
    expect(executeMock).toHaveBeenCalledWith({
      name: "user",
      email: "user@email.com",
      password: "123456",
    });

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(201);
    expect(reply.send).toHaveBeenCalledOnce();
  });

  it("should rethrows ZodError and does not call use case", async () => {
    const executeMock = vi.fn();
    (makeCreateUserUseCase as Mock).mockReturnValue({ execute: executeMock });
    const request: any = {
      body: {
        name: "1ad",
        email: "aaaadadad.com",
        password: "a",
      },
    };
    const reply = makeReplyMock();

    await expect(createUserController(request, reply)).rejects.toBeInstanceOf(
      ZodError
    );
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("should catch userAlreadyExistsError and reply 409 and error message", async () => {
    const executeMock = vi.fn().mockRejectedValue(new UserAlreadyExistsError());
    (makeCreateUserUseCase as Mock).mockReturnValue({ execute: executeMock });

    const request: any = {
      body: {
        name: "user",
        email: "user@email.com",
        password: "123456",
      },
    };
    const reply = makeReplyMock();
    await createUserController(request, reply);

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(409);
    expect(reply.send).toHaveBeenCalledWith({ message: "User already exists" });
  });

  it("should rethrows unknown errors from use case", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error());
    (makeCreateUserUseCase as Mock).mockReturnValue({ execute: executeMock });

    const request: any = {
      body: {
        name: "user",
        email: "user@email.com",
        password: "123456",
      },
    };
    const reply = makeReplyMock();
    await expect(createUserController(request, reply)).rejects.toThrow(Error);
  });
});
