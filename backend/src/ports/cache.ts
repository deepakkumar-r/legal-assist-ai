/** Cache boundary used for repeat-safe AI computations. */
export interface CacheStore {
  get<T>(key: string): T | undefined;
  set<T>(key: string, value: T, ttlMs?: number): void;
}

interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

export class MemoryCache implements CacheStore {
  private readonly entries = new Map<string, CacheEntry>();

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = 15 * 60_000): void {
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
  }
}
