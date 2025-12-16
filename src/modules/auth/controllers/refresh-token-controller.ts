import { FastifyReply, FastifyRequest } from "fastify";
import { MakeRefreshTokenUseCase } from "../use-cases/factories/make-refresh-token-use-case";
import { AuthenticationError } from "../../../shared/errors/authentication-error";

export async function RefreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const refreshToken = request.cookies.refreshToken;
  if (!refreshToken) {
    return reply.status(401).send({ message: "Authentication Error." });
  }

  const refreshUseCase = MakeRefreshTokenUseCase();

  try {
    const { accessToken } = await refreshUseCase.execute({ refreshToken });

    return reply.status(200).send({ accessToken });
  } catch (error) {
    reply.clearCookie("refreshToken", { path: "/auth/refresh" });
    if (error instanceof AuthenticationError) {
      return reply.status(401).send({ message: error.message });
    }
    throw error;
  }
}
