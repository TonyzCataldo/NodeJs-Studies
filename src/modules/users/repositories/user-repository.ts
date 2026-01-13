import { UserEntity } from "../entities/user-entity";

export interface CreateUserData {
  name: string;
  email: string;
  password_hash: string;
  verificationToken?: string;
}

export interface UserRepository {
  findByEmail(email: string): Promise<UserEntity | null>;
  create(data: CreateUserData): Promise<UserEntity>;
  findById(id: string): Promise<UserEntity | null>;
  findByVerificationToken(token: string): Promise<UserEntity | null>;
  save(user: UserEntity): Promise<UserEntity>;
}
