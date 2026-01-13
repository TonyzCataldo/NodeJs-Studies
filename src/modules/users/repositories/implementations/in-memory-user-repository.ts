import { UserEntity } from "../../entities/user-entity";
import { CreateUserData, UserRepository } from "../user-repository";

export class InMemoryUserRepository implements UserRepository {
  public items: UserEntity[] = [];
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = this.items.find((item) => item.email === email);
    return user ?? null;
  }
  async create(data: CreateUserData): Promise<UserEntity> {
    const user: UserEntity = {
      id: crypto.randomUUID(),
      name: data.name,
      email: data.email,
      password_hash: data.password_hash,
      verificationToken: data.verificationToken ?? null,
      emailVerifiedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(user);
    return user;
  }
  async findById(id: string): Promise<UserEntity | null> {
    const user = this.items.find((item) => item.id === id);
    return user ?? null;
  }
  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    const user = this.items.find((item) => item.verificationToken === token);
    return user ?? null;
  }
  async save(user: UserEntity): Promise<UserEntity> {
    const index = this.items.findIndex((item) => item.id === user.id);
    if (index >= 0) {
      this.items[index] = user;
    }
    return user;
  }
}
