import { UserEntity } from "../entities/user-entity";

export interface CreateUserData {
  name: string;
  email: string;
  password_hash: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
}
