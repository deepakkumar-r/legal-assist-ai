import { afterEach, describe, expect, it, vi } from 'vitest';
import { MemoryCache } from './cache.js';

describe('MemoryCache', () => {
  afterEach(() => vi.useRealTimers());

  it('rejects invalid capacity', () => {
    expect(() => new MemoryCache(0)).toThrow('positive integer');
  });

  it('expires values and keeps memory bounded with LRU eviction', () => {
    vi.useFakeTimers();
    const cache = new MemoryCache(2);
    cache.set('a', 1, 100);
    cache.set('b', 2, 1_000);
    expect(cache.get<number>('a')).toBe(1);
    cache.set('c', 3, 1_000);
    expect(cache.get('b')).toBeUndefined();
    expect(cache.get<number>('c')).toBe(3);
    vi.advanceTimersByTime(101);
    cache.set('d', 4);
    expect(cache.get('a')).toBeUndefined();

    const expiring = new MemoryCache();
    expiring.set('short-lived', true, 10);
    vi.advanceTimersByTime(11);
    expect(expiring.get('short-lived')).toBeUndefined();
  });
});
