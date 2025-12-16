import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { JwtTokenProvider } from "../../cryptography/jwt-token-provider";

type AuthUser = {
  sub: string;
  payload: Record<string, unknown>;
};

export default fp(async function authPlugin(app: FastifyInstance) {
  const tokenProvider = new JwtTokenProvider();

  // 1) Declara a propriedade request.user
  app.decorateRequest("user", null as AuthUser | null);

  // 2) Cria o "middleware" reutilizável
  app.decorate(
    "authenticate",
    async (request: FastifyRequest, reply: FastifyReply) => {
      const authHeader = request.headers.authorization;

      if (!authHeader) {
        return reply.status(401).send({ message: "Authentication Error." });
      }

      const [scheme, token] = authHeader.split(" ");

      if (scheme !== "Bearer" || !token) {
        return reply.status(401).send({ message: "Authentication Error." });
      }

      try {
        const decoded = await tokenProvider.verify(token, "access");

        request.user = {
          sub: String(decoded.sub),
          payload: (decoded.payload ?? {}) as Record<string, unknown>,
        };
      } catch {
        return reply.status(401).send({ message: "Authentication Error" });
      }
    }
  );
});
