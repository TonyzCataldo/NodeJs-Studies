import { beforeEach, describe, expect, it, Mock, vi } from "vitest";
import { MakeRefreshTokenUseCase } from "../../use-cases/factories/make-refresh-token-use-case";
import { RefreshTokenController } from "../refresh-token-controller";
import { AuthenticationError } from "../../../../shared/errors/authentication-error";
import { ZodError } from "zod";

vi.mock("../../use-cases/factories/make-refresh-token-use-case", () => ({
  MakeRefreshTokenUseCase: vi.fn(),
}));

describe("Refresh Token Controller unit tests", () => {
  function MakeReplyMock() {
    const reply: any = {
      header: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
      clearCookie: vi.fn().mockReturnThis(),
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
    (MakeRefreshTokenUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        refreshToken: "refreshToken",
      },
    };
    await RefreshTokenController(request, reply);
    expect(executeMock).toHaveBeenCalledWith({
      refreshToken: "refreshToken",
    });

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      accessToken: "accessToken",
      refreshToken: "refreshToken",
    });
  });

  it("should throw error if refresh token is not provided (Zod Validation)", async () => {
    const executeMock = vi.fn();
    (MakeRefreshTokenUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {},
    };

    await expect(RefreshTokenController(request, reply)).rejects.toThrow(
      ZodError
    );
    expect(executeMock).not.toHaveBeenCalled();
  });

  it("Should catch AuthenticationError and reply 401 code", async () => {
    const executeMock = vi.fn().mockRejectedValue(new AuthenticationError());
    (MakeRefreshTokenUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        refreshToken: "refreshToken",
      },
    };
    await RefreshTokenController(request, reply);
    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(401);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Authentication Error.",
    });
  });

  it("Should rethrows unknown errors from use case", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error());
    (MakeRefreshTokenUseCase as Mock).mockReturnValue({ execute: executeMock });
    const reply = MakeReplyMock();
    const request: any = {
      body: {
        refreshToken: "refreshToken",
      },
    };
    await expect(RefreshTokenController(request, reply)).rejects.toThrow(Error);
  });
});
