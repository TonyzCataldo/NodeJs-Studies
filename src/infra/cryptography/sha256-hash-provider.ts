import crypto from "node:crypto";
import { HashRefreshTokenProvider } from "../../shared/cryptography/hash-refresh-token";

export class Sha256HashProvider implements HashRefreshTokenProvider {
  hash(refreshToken: string): string {
    return crypto.createHash("sha256").update(refreshToken).digest("hex");
  }
}
