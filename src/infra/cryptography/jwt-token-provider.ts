import {
  SignTokenInput,
  TokenProvider,
  TokenType,
  VerifyTokenOutput,
} from "../../shared/cryptography/token-provider";
import { env } from "../../shared/env";
import jwt from "jsonwebtoken";

export class JwtTokenProvider implements TokenProvider {
  async sign(input: SignTokenInput): Promise<string> {
    const expiresIn =
      input.type === "access"
        ? env.JWT_ACCESS_EXPIRES
        : env.JWT_REFRESH_EXPIRES;

    const payload = {
      ...(input.payload ?? {}),
      typ: input.type,
    };

    const SECRET =
      input.type === "access" ? env.JWT_SECRET : env.JWT_REFRESH_SECRET;

    return jwt.sign(payload, SECRET, {
      subject: input.subject,
      expiresIn,
    });
  }

  async verify(token: string, type: TokenType): Promise<VerifyTokenOutput> {
    const SECRET = type === "access" ? env.JWT_SECRET : env.JWT_REFRESH_SECRET;

    const decoded = jwt.verify(token, SECRET) as jwt.JwtPayload;

    const { sub, exp, iat, typ, ...payload } = decoded;

    if (!sub) {
      throw new Error("Invalid Token");
    }

    delete payload.typ;

    return {
      sub,
      type: typ,
      payload,
      exp,
    };
  }
}
