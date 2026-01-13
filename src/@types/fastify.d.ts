import "fastify";
import { PrismaClient } from "../infra/generated/client";

declare module "fastify" {
  interface FastifyRequest {
    user: null | {
      sub: string;
      payload: Record<string, unknown>;
    };
  }
  interface FastifyInstance {
    authorizeRoles: (
      allowed: Role[]
    ) => (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
  interface FastifyInstance {
    redis: ReturnType<typeof createClient>;
    prisma: PrismaClient;
  }
}
