import { FastifyReply, FastifyRequest } from "fastify";
import z from "zod";
import { MakeLoginUseCase } from "../use-cases/factories/make-login-use-case";
import { AuthenticationError } from "../../../shared/errors/authentication-error";

const LoginBodySchema = z.object({
  email: z.email(),
  password: z.string().min(6),
});

export async function LoginController(
  request: FastifyRequest,
  reply: FastifyReply
) {
  const { email, password } = LoginBodySchema.parse(request.body);
  const ipAddress = request.ip;

  const loginUseCase = MakeLoginUseCase();

  try {
    const { accessToken, refreshToken } = await loginUseCase.execute({
      email,
      password,
      ipAddress,
    });

    //opção para enviar o refresh token direto pro cookie

    // reply.setCookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: env.NODE_ENV !== "development",
    //   sameSite: "lax",
    //   path: "/auth/refresh",
    //   maxAge: 60 * 60 * 24 * 7, // 7 dias
    // });
    return reply.header("Cache-Control", "no-store").code(200).send({
      accessToken,
      refreshToken,
    });
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
