import { FastifyInstance } from "fastify";
import { createUserController } from "../../../modules/users/controllers/create-user-controller";

export async function usersRoutes(app: FastifyInstance) {
  app.post("/", createUserController);
}
