/**
 * CycloneShield AI - Robust Request Manager
 * Handles request timeouts (10s), in-flight deduplication, stale-while-revalidate caching,
 * and structured diagnostic logging.
 */

export type DataStatus = 'NO_DATA' | 'LOADING' | 'LIVE' | 'STALE' | 'ERROR';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttlMs: number;
}

class RequestManager {
  private inFlightMap = new Map<string, Promise<any>>();
  private cache = new Map<string, CacheEntry<any>>();
  private defaultTimeoutMs = 10000; // 10 seconds timeout
  private defaultTtlMs = 300000;    // 5 minutes cache TTL
  private debugLogging = true;

  private log(message: string, durationMs?: number) {
    if (!this.debugLogging) return;
    const durationStr = durationMs !== undefined ? ` in ${durationMs}ms` : '';
    console.log(`[Weather] ${message}${durationStr}`);
  }

  /**
   * Retrieves data from client-side memory cache if valid.
   */
  getFromCache<T>(key: string): { data: T; isStale: boolean } | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    const isStale = age > entry.ttlMs;

    this.log(`Cache ${isStale ? 'stale hit' : 'hit'}: ${key}`);
    return { data: entry.data, isStale };
  }

  /**
   * Stores data in client-side memory cache.
   */
  setCache<T>(key: string, data: T, ttlMs: number = this.defaultTtlMs): void {
    if (!data) return;
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttlMs
    });
  }

  /**
   * Clears specific cache key or all cache.
   */
  clearCache(key?: string): void {
    if (key) {
      this.cache.delete(key);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Executes an HTTP request with automatic in-flight deduplication, timeout, and response validation.
   */
  async request<T>(
    url: string,
    options: RequestInit = {},
    customTimeoutMs?: number,
    forceRefresh: boolean = false,
    ttlMs?: number
  ): Promise<T> {
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // 1. Check cache unless forcing refresh
    if (!forceRefresh) {
      const cached = this.getFromCache<T>(cacheKey);
      if (cached && !cached.isStale) {
        return cached.data;
      }
    }

    // 2. Check in-flight deduplication
    if (this.inFlightMap.has(cacheKey)) {
      this.log(`Deduplicated in-flight request: ${url}`);
      return this.inFlightMap.get(cacheKey) as Promise<T>;
    }

    // 3. Initiate request with timeout
    const timeoutMs = customTimeoutMs || this.defaultTimeoutMs;
    const startTime = performance.now();
    this.log(`Request started: ${url}`);

    const promise = (async (): Promise<T> => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
        this.log(`Request timeout (${timeoutMs}ms): ${url}`);
      }, timeoutMs);

      try {
        const fetchOptions: RequestInit = {
          ...options,
          signal: controller.signal
        };

        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);

        const duration = Math.round(performance.now() - startTime);

        if (!response.ok) {
          this.log(`Request failed (HTTP ${response.status}): ${url}`, duration);
          throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
        }

        const data: T = await response.json();
        this.log(`Request success: ${url}`, duration);

        // Cache successful response
        this.setCache(cacheKey, data, ttlMs);
        return data;
      } catch (err: any) {
        clearTimeout(timeoutId);
        const duration = Math.round(performance.now() - startTime);

        if (err.name === 'AbortError') {
          this.log(`Request aborted due to timeout: ${url}`, duration);
          throw new Error(`Weather request timed out after ${timeoutMs / 1000}s`);
        }

        this.log(`Request error: ${err.message || err}`, duration);
        throw err;
      } finally {
        this.inFlightMap.delete(cacheKey);
      }
    })();

    this.inFlightMap.set(cacheKey, promise);
    return promise;
  }
}

export const requestManager = new RequestManager();
