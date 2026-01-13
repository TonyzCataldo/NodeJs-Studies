import { beforeEach, describe, expect, Mock, vi, it } from "vitest";
import { MakeLoginUseCase } from "../../use-cases/factories/make-login-use-case";
import { LoginController } from "../login-controller";
import { env } from "../../../../shared/env";
import { ZodError } from "zod";
import { AuthenticationError } from "../../../../shared/errors/authentication-error";

vi.mock("../../use-cases/factories/make-login-use-case", () => ({
  MakeLoginUseCase: vi.fn(),
}));

describe("Login Controller unit tests", () => {
  function MakeReplyMock() {
    const reply: any = {
      setCookie: vi.fn().mockReturnThis(),
      header: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should call use case and succesfully return 200", async () => {
    const executeMock = vi.fn().mockResolvedValue({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
    (MakeLoginUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        email: "user@email.com",
        password: "123456",
      },
      ip: "ip",
    };
    await LoginController(request, reply);
    expect(executeMock).toHaveBeenCalledWith({
      email: "user@email.com",
      password: "123456",
      ipAddress: "ip",
    });

    // opção de teste de set cookie direto

    // expect(reply.setCookie).toHaveBeenCalledWith(
    //   "refreshToken",
    //   "refreshToken",
    //   {
    //     httpOnly: true,
    //     secure: env.NODE_ENV !== "development",
    //     sameSite: "lax",
    //     path: "/auth/refresh",
    //     maxAge: 60 * 60 * 24 * 7, // 7 dias
    //   }
    // );

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
  });

  it("should rethrows ZodError and does not call use case", async () => {
    const executeMock = vi.fn();
    (MakeLoginUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        email: "useremailcom",
        password: "123",
      },
      ip: "ip",
    };

    await expect(LoginController(request, reply)).rejects.toBeInstanceOf(
      ZodError
    );
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("Should catch AuthenticationError and reply 401 code", async () => {
    const executeMock = vi.fn().mockRejectedValue(new AuthenticationError());
    (MakeLoginUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        email: "user@email.com",
        password: "123456",
      },
      ip: "ip",
    };
    await LoginController(request, reply);
    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication Error.",
    });
  });

  it("Should rethrows unknown errors from use case", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error());
    (MakeLoginUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        email: "user@email.com",
        password: "123456",
      },
      ip: "ip",
    };
    await expect(LoginController(request, reply)).rejects.toThrow(Error);
  });
});
