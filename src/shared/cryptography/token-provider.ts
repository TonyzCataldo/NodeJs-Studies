export type TokenType = "access" | "refresh";

export interface SignTokenInput {
  subject: string;
  type: TokenType;
  payload?: Record<string, any>;
}

export interface VerifyTokenOutput {
  sub: string; // subject
  type: TokenType;
  payload: Record<string, any>;
  exp: number | undefined;
}

export interface TokenProvider {
  sign(input: SignTokenInput): Promise<string>;
  verify(token: string, type: TokenType): Promise<VerifyTokenOutput>;
}
