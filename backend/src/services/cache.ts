/**
 * Simple in-memory cache with TTL (Time-To-Live).
 * Production-ready structure that can be swapped for Redis later.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

class MemoryCache {
  private store = new Map<string, CacheEntry<any>>();
  private defaultTTL: number;

  constructor(defaultTTLSeconds = 30) {
    this.defaultTTL = defaultTTLSeconds * 1000;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T, ttlSeconds?: number): void {
    const ttl = (ttlSeconds ?? this.defaultTTL / 1000) * 1000;
    this.store.set(key, {
      data,
      expiresAt: Date.now() + ttl,
    });
  }

  invalidate(pattern?: string): void {
    if (!pattern) {
      this.store.clear();
      return;
    }
    // Invalidate all keys starting with pattern
    for (const key of this.store.keys()) {
      if (key.startsWith(pattern)) {
        this.store.delete(key);
      }
    }
  }

  get size(): number {
    return this.store.size;
  }
}

// Singleton instance
export const cache = new MemoryCache(30); // 30 second default TTL

// Cache key helpers
export const CacheKeys = {
  dashboard: (userId: string) => `dashboard:${userId}`,
  summary: (userId: string) => `summary:${userId}`,
  growth: (userId: string) => `growth:${userId}`,
  history: (userId: string) => `history:${userId}`,
  payments: (userId: string) => `payments:${userId}`,
  deliveries: (userId: string) => `deliveries:${userId}`,
  clients: (userId: string) => `clients:${userId}`,
};