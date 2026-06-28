/**
 * Lightweight data fetching hook with client-side caching.
 * Prevents duplicate requests and provides stale-while-revalidate pattern.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

// Global in-memory cache (shared across components)
const globalCache = new Map<string, CacheEntry<any>>();

function getCached<T>(key: string, ttl: number): T | null {
  const entry = globalCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > entry.ttl) {
    globalCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCache<T>(key: string, data: T, ttl: number): void {
  globalCache.set(key, { data, timestamp: Date.now(), ttl });
}

interface UseDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: { ttl?: number; enabled?: boolean }
): UseDataResult<T> {
  const { ttl = 30000, enabled = true } = options || {};
  const [data, setData] = useState<T | null>(() => getCached<T>(key, ttl));
  const [loading, setLoading] = useState(!data);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  const mountedRef = useRef(true);

  // Keep fetcher ref up to date
  fetcherRef.current = fetcher;

  const fetchData = useCallback(async () => {
    if (!enabled) return;
    
    // Check cache first
    const cached = getCached<T>(key, ttl);
    if (cached) {
      setData(cached);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const result = await fetcherRef.current();
      if (mountedRef.current) {
        setCache(key, result, ttl);
        setData(result);
        setLoading(false);
      }
    } catch (err: any) {
      if (mountedRef.current) {
        setError(err.message || 'Erro ao carregar dados');
        setLoading(false);
      }
    }
  }, [key, ttl, enabled]);

  useEffect(() => {
    mountedRef.current = true;
    if (!data) {
      fetchData();
    } else {
      setLoading(false);
    }
    return () => {
      mountedRef.current = false;
    };
  }, [fetchData]); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: fetchData };
}

/**
 * Invalidate cached data for a specific key or pattern.
 * Call this after mutations (create/update/delete) to refresh data.
 */
export function invalidateCache(key: string): void {
  // Exact match
  if (globalCache.has(key)) {
    globalCache.delete(key);
    return;
  }
  // Pattern match (key starts with)
  for (const cacheKey of globalCache.keys()) {
    if (cacheKey.startsWith(key)) {
      globalCache.delete(cacheKey);
    }
  }
}