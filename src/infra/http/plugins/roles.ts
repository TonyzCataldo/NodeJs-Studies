import fp from "fastify-plugin";
import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";

type Role = "admin" | "user"; // ajuste pro seu sistema

export default fp(async function rolesPlugin(app: FastifyInstance) {
  app.decorate("authorizeRoles", (allowed: Role[]) => {
    return async (request: FastifyRequest, reply: FastifyReply) => {
      const role = request.user?.payload?.role;

      if (typeof role !== "string") {
        return reply.status(403).send({ message: "Forbidden" });
      }

      if (!allowed.includes(role as Role)) {
        return reply.status(403).send({ message: "Forbidden" });
      }
    };
  });
});
