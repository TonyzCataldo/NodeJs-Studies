import { HashRefreshTokenProvider } from "../hash-refresh-token";

export class FakeHashRefreshToken implements HashRefreshTokenProvider {
  hash(refreshToken: string): string {
    return `hashed-${refreshToken}`;
  }
}
