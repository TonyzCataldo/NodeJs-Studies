import { beforeEach, describe, expect, it } from "vitest";
import { InMemoryUserRepository } from "../repositories/implementations/in-memory-user-repository";
import { VerifyEmailUseCase } from "./verify-email-use-case";
import { ResourceNotFoundError } from "../../../shared/errors/resource-not-found-error";

let userRepository: InMemoryUserRepository;
let sut: VerifyEmailUseCase;

describe("VerifyEmailUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    sut = new VerifyEmailUseCase(userRepository);
  });

  it("should verify user email with valid token", async () => {
    const user = await userRepository.create({
      name: "User",
      email: "user@example.com",
      password_hash: "123456",
      verificationToken: "valid-token",
    });

    await sut.execute({ token: "valid-token" });

    const updatedUser = await userRepository.findById(user.id);

    expect(updatedUser?.emailVerifiedAt).not.toBeNull();
    expect(updatedUser?.verificationToken).toBeNull();
  });

  it("should not verify email with invalid token", async () => {
    await expect(
      sut.execute({ token: "invalid-token" })
    ).rejects.toBeInstanceOf(ResourceNotFoundError);
  });
});
