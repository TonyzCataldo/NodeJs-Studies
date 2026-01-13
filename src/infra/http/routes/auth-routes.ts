import { FastifyInstance } from "fastify";
import { LoginController } from "../../../modules/auth/controllers/login-controller";
import { RefreshTokenController } from "../../../modules/auth/controllers/refresh-token-controller";
import { verifyEmailController } from "../../../modules/users/controllers/verify-email-controller";

export async function authRoutes(app: FastifyInstance) {
  app.post(
    "/login",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    LoginController
  );
  app.post(
    "/refresh",
    { config: { rateLimit: { max: 5, timeWindow: "1 minute" } } },
    RefreshTokenController
  );

  app.post(
    "/verify-email",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    verifyEmailController
  );
}
