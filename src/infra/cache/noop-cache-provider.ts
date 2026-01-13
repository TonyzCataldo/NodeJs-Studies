import { CacheProvider } from "../../shared/cache/cache-provider";

export class NoopCacheProvider implements CacheProvider {
  async get<T>(): Promise<T | null> {
    return null;
  }
  async set(): Promise<void> {}
  async del(): Promise<void> {}
  async incr(key: string): Promise<number> {
    return 0;
  }
}
