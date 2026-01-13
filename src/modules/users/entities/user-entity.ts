export interface UserEntity {
  id: string;
  name: string;
  email: string;
  role?: "user" | "admin";
  password_hash: string;
  emailVerifiedAt?: Date | null;
  verificationToken?: string | null;
  createdAt: Date;
  updatedAt: Date;
}
