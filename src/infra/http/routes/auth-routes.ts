import { FastifyInstance } from "fastify";
import { LoginController } from "../../../modules/auth/controllers/login-controller";

export async function authRoutes(app: FastifyInstance) {
  app.post("/", LoginController);
}
