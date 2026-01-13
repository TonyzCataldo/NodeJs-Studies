export interface OpaqueTokenProvider {
  generateOpaqueToken(bytes: number): string;
}
