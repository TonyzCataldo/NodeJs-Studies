import { FastifyInstance } from "fastify";
import { createUserController } from "../../../modules/users/controllers/create-user-controller";

export async function usersRoutes(app: FastifyInstance) {
  app.post(
    "/",
    { config: { rateLimit: { max: 5, timeWindow: "10 minutes" } } },
    createUserController
  );
}
