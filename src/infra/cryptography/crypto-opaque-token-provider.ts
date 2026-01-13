import { OpaqueTokenProvider } from "../../shared/cryptography/opaque-token-provider";
import crypto from "node:crypto";

export class CryptoOpaqueTokenProvider implements OpaqueTokenProvider {
  generateOpaqueToken(bytes: number = 48): string {
    return crypto.randomBytes(bytes).toString("base64url");
  }
}
