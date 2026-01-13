import { beforeEach, describe, expect, Mock, vi, it } from "vitest";
import { makeVerifyEmailUseCase } from "../../use-cases/factories/make-verify-email-use-case";
import { verifyEmailController } from "../verify-email-controller";
import { ResourceNotFoundError } from "../../../../shared/errors/resource-not-found-error";

vi.mock("../../use-cases/factories/make-verify-email-use-case", () => ({
  makeVerifyEmailUseCase: vi.fn(),
}));

describe("Verify Email Controller unit tests", () => {
  function MakeReplyMock() {
    const reply: any = {
      header: vi.fn().mockReturnThis(),
      code: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
    return reply;
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("Should call use case and successfully return 200", async () => {
    const executeMock = vi.fn().mockResolvedValue(undefined);
    (makeVerifyEmailUseCase as Mock).mockReturnValue({ execute: executeMock });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        token: "valid-token",
      },
    };

    await verifyEmailController(request, reply);

    expect(executeMock).toHaveBeenCalledWith({
      token: "valid-token",
    });

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(200);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Email verified successfully",
    });
  });

  it("Should catch ResourceNotFoundError and return 404", async () => {
    const executeMock = vi.fn().mockRejectedValue(new ResourceNotFoundError());
    (makeVerifyEmailUseCase as Mock).mockReturnValue({ execute: executeMock });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        token: "invalid-token",
      },
    };

    await verifyEmailController(request, reply);

    expect(reply.header).toHaveBeenCalledWith("Cache-Control", "no-store");
    expect(reply.code).toHaveBeenCalledWith(404);
    expect(reply.send).toHaveBeenCalledWith({
      message: "Resource not found.",
    });
  });

  it("Should rethrow unknown errors from use case", async () => {
    const executeMock = vi.fn().mockRejectedValue(new Error());
    (makeVerifyEmailUseCase as Mock).mockReturnValue({ execute: executeMock });

    const reply = MakeReplyMock();
    const request: any = {
      body: {
        token: "valid-token",
      },
    };

    await expect(verifyEmailController(request, reply)).rejects.toThrow(Error);
  });
});
