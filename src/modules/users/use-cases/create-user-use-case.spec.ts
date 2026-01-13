import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { FakeHashProvider } from "../../../shared/cryptography/fakes/fake-hash-provider";
import { InMemoryUserRepository } from "../repositories/implementations/in-memory-user-repository";
import { CreateUserUseCase } from "./create-user-use-case";
import { UserAlreadyExistsError } from "../../../shared/errors/user-already-exists-error";
import { FakeMailProvider } from "../../../shared/providers/fakes/fake-mail-provider";

let userRepository: InMemoryUserRepository;
let hashProvider: FakeHashProvider;
let mailProvider: FakeMailProvider;
let sut: CreateUserUseCase;

describe("CreateUserUseCase", () => {
  beforeEach(() => {
    userRepository = new InMemoryUserRepository();
    hashProvider = new FakeHashProvider();
    mailProvider = new FakeMailProvider();
    sut = new CreateUserUseCase(userRepository, hashProvider, mailProvider);
  });

  it("should create a user with a hashed password", async () => {
    const { user } = await sut.execute({
      name: "user",
      email: "user@example.com",
      password: "123456",
    });

    expect(userRepository.items).toHaveLength(1);

    const savedUser = userRepository.items[0]!;

    expect(savedUser.name).toBe("user");
    expect(savedUser.email).toBe("user@example.com");

    // 2) Garante que a senha foi hasheada (usando o FakeHashProvider)
    expect(savedUser.password_hash).toBe("hashed-123456");

    // 3) Garante que o retorno do use case NÃO expõe o hash
    expect(user).toMatchObject({
      id: savedUser.id,
      name: "user",
      email: "user@example.com",
    });
    // @ts-expect-error - só pra garantir que o TypeScript não permita o field
    expect(user.password_hash).toBeUndefined();
  });

  it("should not create a user if email is already used", async () => {
    await sut.execute({
      name: "user",
      email: "user@email.com",
      password: "123456",
    });
    await expect(
      sut.execute({
        name: "user2",
        email: "user@email.com",
        password: "12345678",
      })
    ).rejects.toBeInstanceOf(UserAlreadyExistsError);

    expect(userRepository.items).toHaveLength(1);

    const savedUser = userRepository.items[0]!;
    expect(savedUser.name).toBe("user");
    expect(savedUser.email).toBe("user@email.com");
  });
});
