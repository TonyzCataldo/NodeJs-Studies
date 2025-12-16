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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.items.push(user);
    return user;
  }
}
