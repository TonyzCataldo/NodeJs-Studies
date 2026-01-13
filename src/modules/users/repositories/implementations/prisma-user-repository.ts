import { UserRepository } from "../user-repository";
import { prisma } from "../../../../infra/db/prisma";
import { UserEntity } from "../../entities/user-entity";

export class PrismaUserRepository implements UserRepository {
  async findByEmail(email: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { email },
    });
    return user;
  }

  async create(data: {
    name: string;
    email: string;
    password_hash: string;
    verificationToken?: string;
  }): Promise<UserEntity> {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }

  async findById(id: string): Promise<UserEntity | null> {
    const user = await prisma.user.findUnique({
      where: { id },
    });
    return user;
  }

  async findByVerificationToken(token: string): Promise<UserEntity | null> {
    const user = await prisma.user.findFirst({
      where: { verificationToken: token },
    });
    return user;
  }

  async save(user: UserEntity): Promise<UserEntity> {
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerifiedAt: user.emailVerifiedAt ?? null,
        verificationToken: user.verificationToken ?? null,
        updatedAt: new Date(),
      },
    });
    return updatedUser;
  }
}
