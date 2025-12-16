export interface HashRefreshTokenProvider {
  hash(refreshToken: string): string;
}
