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

  constructor(private readonly maxEntries = 256) {
    if (!Number.isInteger(maxEntries) || maxEntries < 1) {
      throw new Error('maxEntries must be a positive integer');
    }
  }

  get<T>(key: string): T | undefined {
    const entry = this.entries.get(key);
    if (!entry) return undefined;
    if (entry.expiresAt < Date.now()) {
      this.entries.delete(key);
      return undefined;
    }
    // Refresh insertion order so the map also acts as a bounded LRU cache.
    this.entries.delete(key);
    this.entries.set(key, entry);
    return entry.value as T;
  }

  set<T>(key: string, value: T, ttlMs = 15 * 60_000): void {
    const now = Date.now();
    for (const [entryKey, entry] of this.entries) {
      if (entry.expiresAt < now) this.entries.delete(entryKey);
    }
    this.entries.delete(key);
    this.entries.set(key, { value, expiresAt: Date.now() + ttlMs });
    while (this.entries.size > this.maxEntries) {
      const oldest = this.entries.keys().next().value as string;
      this.entries.delete(oldest);
    }
  }
}
