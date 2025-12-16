export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  password_hash: string;
  createdAt: Date;
  updatedAt: Date;
}
