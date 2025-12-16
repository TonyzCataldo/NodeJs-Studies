import { HashProvider } from "../hash-provider";

export class FakeHashProvider implements HashProvider {
  async hash(plaintext: string): Promise<string> {
    return `hashed-${plaintext}`;
  }
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return hash === `hashed-${plaintext}`;
  }
}
