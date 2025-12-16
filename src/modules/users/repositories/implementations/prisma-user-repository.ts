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
  }): Promise<UserEntity> {
    const user = await prisma.user.create({
      data,
    });
    return user;
  }
}
