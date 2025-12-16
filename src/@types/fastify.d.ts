import "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: null | {
      sub: string;
      payload: Record<string, unknown>;
    };
  }

  interface FastifyInstance {
    authenticate: (
      request: FastifyRequest,
      reply: FastifyReply
    ) => Promise<void>;
  }
}
