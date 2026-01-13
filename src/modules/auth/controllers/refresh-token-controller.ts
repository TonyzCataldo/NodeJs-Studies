import { FastifyReply, FastifyRequest } from "fastify";
import { MakeRefreshTokenUseCase } from "../use-cases/factories/make-refresh-token-use-case";
import { AuthenticationError } from "../../../shared/errors/authentication-error";
import z from "zod";

export async function RefreshTokenController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const RefreshTokenBodySchema = z.object({
    refreshToken: z.string().min(6),
  });

  const { refreshToken } = RefreshTokenBodySchema.parse(request.body);

  const oldRefreshToken = refreshToken;
  if (!oldRefreshToken) {
    return reply
      .header("Cache-Control", "no-store")
      .code(401)
      .send({ message: "Authentication Error." });
  }

  const refreshUseCase = MakeRefreshTokenUseCase();

  try {
    const { accessToken, refreshToken } = await refreshUseCase.execute({
      ipAddress: request.ip,
      refreshToken: oldRefreshToken,
    });

    return reply
      .header("Cache-Control", "no-store")
      .code(200)
      .send({ accessToken, refreshToken });
  } catch (error) {
    if (error instanceof AuthenticationError) {
      return reply
        .header("Cache-Control", "no-store")
        .code(401)
        .send({ message: error.message });
    }
    throw error;
  }
}
