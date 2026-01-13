import fastify, { FastifyError } from "fastify";
import fastifyCookie from "@fastify/cookie";
import fastifyRateLimit from "@fastify/rate-limit";
import { ZodError } from "zod";

import { env } from "../../shared/env";

import authPlugin from "../http/plugins/auth";
import rolesPlugin from "../http/plugins/roles";
import redisPlugin from "../cache/redis-plugin";
import prismaPlugin from "../db/prisma-plugin"; // vamos criar

import { usersRoutes } from "./routes/users-routes";
import { authRoutes } from "./routes/auth-routes";
import { questionsRoutes } from "./routes/questions-routes";

export function buildApp() {
  const app = fastify({
    trustProxy: env.NODE_ENV === "production",
  });

  app.register(fastifyCookie);
  app.register(authPlugin);
  app.register(rolesPlugin);
  if (env.NODE_ENV !== "test") {
    app.register(fastifyRateLimit, { global: false });
  }

  app.register(redisPlugin);
  app.register(prismaPlugin);

  app.register(usersRoutes, { prefix: "/users" });
  app.register(authRoutes, { prefix: "/auth" });
  app.register(questionsRoutes, { prefix: "/questions" });

  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error instanceof ZodError) {
      return reply.code(400).send({
        message: "Validation error",
        issues: error.format(),
      });
    }

    if (typeof error.statusCode === "number") {
      return reply.code(error.statusCode).send({ message: error.message });
    }

    if (env.NODE_ENV !== "production") console.log(error);
    return reply.code(500).send({ message: "Internal Server Error" });
  });

  return app;
}
