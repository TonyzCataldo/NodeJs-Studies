import { HashProvider } from "../../shared/cryptography/hash-provider";
import bcrypt from "bcryptjs";

export class BcryptHashProvider implements HashProvider {
  private readonly saltRounds = 6;

  async hash(plaintext: string): Promise<string> {
    const hash = await bcrypt.hash(plaintext, this.saltRounds);
    return hash;
  }
  async compare(plaintext: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plaintext, hash);
  }
}
