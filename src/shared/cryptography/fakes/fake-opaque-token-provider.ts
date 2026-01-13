import { OpaqueTokenProvider } from "../opaque-token-provider";

export class FakeOpaqueTokenProvider implements OpaqueTokenProvider {
  generateOpaqueToken(bytes: number): string {
    return "refresh-token";
  }
}
