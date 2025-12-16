import fastify from "fastify";
import { usersRoutes } from "./routes/users-routes";
import { ZodError } from "zod";
import { env } from "../../shared/env";
import fastifyCookie from "@fastify/cookie";
import { authRoutes } from "./routes/auth-routes";
import authPlugin from "../http/plugins/auth";

export const app = fastify({
  // logger: true,
});

app.register(fastifyCookie);
app.register(authPlugin);

// registra as rotas de usuários
app.register(usersRoutes, {
  prefix: "/users",
});

app.register(authRoutes, {
  prefix: "/auth",
});

app.setErrorHandler((error, request, reply) => {
  if (error instanceof ZodError) {
    return reply
      .code(400)
      .send({ message: "Validation error", issues: error.format() });
  }
  if (env.NODE_ENV !== "production") {
    console.log(error);
  }
  return reply.code(400).send({ message: "Internal Server Error" });
});
