import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

/**
 * Advanced Caching System for TamanduAI Platform
 * Provides multi-layer caching with performance monitoring
 */

// ============================================
// CACHE CONFIGURATION
// ============================================

const CACHE_CONFIG = {
  // Memory cache settings
  MEMORY: {
    DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
    MAX_SIZE: 100, // Maximum entries
    CLEANUP_INTERVAL: 60 * 1000, // 1 minute
  },

  // Persistent cache settings
  PERSISTENT: {
    STORAGE_KEY: 'tamanduai_cache',
    MAX_AGE: 24 * 60 * 60 * 1000, // 24 hours
    MAX_SIZE: 50, // Maximum entries
  },

  // Network cache settings
  NETWORK: {
    ENABLE_SERVICE_WORKER: true,
    CACHE_NAME: 'tamanduai-v1',
    MAX_ENTRIES: 200,
    MAX_AGE: 7 * 24 * 60 * 60 * 1000, // 7 days
  },
};

// ============================================
// CACHE METRICS
// ============================================

class CacheMetrics {
  constructor() {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.errors = 0;
    this.totalRequests = 0;
  }

  recordHit() {
    this.hits++;
    this.totalRequests++;
  }

  recordMiss() {
    this.misses++;
    this.totalRequests++;
  }

  recordEviction() {
    this.evictions++;
  }

  recordError() {
    this.errors++;
  }

  getHitRate() {
    return this.totalRequests > 0 ? (this.hits / this.totalRequests) * 100 : 0;
  }

  getStats() {
    return {
      hits: this.hits,
      misses: this.misses,
      evictions: this.evictions,
      errors: this.errors,
      hitRate: this.getHitRate(),
      totalRequests: this.totalRequests,
    };
  }

  reset() {
    this.hits = 0;
    this.misses = 0;
    this.evictions = 0;
    this.errors = 0;
    this.totalRequests = 0;
  }
}

// ============================================
// MEMORY CACHE
// ============================================

class MemoryCache {
  constructor() {
    this.cache = new Map();
    this.metrics = new CacheMetrics();
    this.cleanupTimer = null;
  }

  /**
   * Get item from cache
   */
  get(key) {
    try {
      const item = this.cache.get(key);

      if (!item) {
        this.metrics.recordMiss();
        return null;
      }

      // Check if expired
      if (Date.now() > item.expiry) {
        this.cache.delete(key);
        this.metrics.recordMiss();
        return null;
      }

      this.metrics.recordHit();
      return item.data;
    } catch (error) {
      console.warn('Cache get error:', error);
      this.metrics.recordError();
      return null;
    }
  }

  /**
   * Set item in cache
   */
  set(key, data, ttl = CACHE_CONFIG.MEMORY.DEFAULT_TTL) {
    try {
      // Check size limit
      if (this.cache.size >= CACHE_CONFIG.MEMORY.MAX_SIZE && !this.cache.has(key)) {
        this.evictLRU();
      }

      const expiry = Date.now() + ttl;
      this.cache.set(key, { data, expiry, timestamp: Date.now() });

      // Start cleanup timer if not running
      if (!this.cleanupTimer) {
        this.startCleanupTimer();
      }
    } catch (error) {
      console.warn('Cache set error:', error);
      this.metrics.recordError();
    }
  }

  /**
   * Delete item from cache
   */
  delete(key) {
    return this.cache.delete(key);
  }

  /**
   * Clear all cache
   */
  clear() {
    this.cache.clear();
  }

  /**
   * Get cache size
   */
  size() {
    return this.cache.size;
  }

  /**
   * Evict least recently used item
   */
  evictLRU() {
    let oldestKey = null;
    let oldestTimestamp = Date.now();

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTimestamp) {
        oldestTimestamp = item.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.metrics.recordEviction();
    }
  }

  /**
   * Start cleanup timer for expired items
   */
  startCleanupTimer() {
    this.cleanupTimer = setInterval(() => {
      const now = Date.now();
      for (const [key, item] of this.cache.entries()) {
        if (now > item.expiry) {
          this.cache.delete(key);
        }
      }
    }, CACHE_CONFIG.MEMORY.CLEANUP_INTERVAL);
  }

  /**
   * Get cache metrics
   */
  getMetrics() {
    return this.metrics.getStats();
  }

  /**
   * Reset metrics
   */
  resetMetrics() {
    this.metrics.reset();
  }
}

// ============================================
// PERSISTENT CACHE
// ============================================

class PersistentCache {
  constructor() {
    this.metrics = new CacheMetrics();
  }

  /**
   * Get item from persistent cache
   */
  get(key) {
    try {
      const stored = localStorage.getItem(`${CACHE_CONFIG.PERSISTENT.STORAGE_KEY}_${key}`);
      if (!stored) {
        this.metrics.recordMiss();
        return null;
      }

      const item = JSON.parse(stored);

      // Check if expired
      if (Date.now() > item.expiry) {
        this.delete(key);
        this.metrics.recordMiss();
        return null;
      }

      this.metrics.recordHit();
      return item.data;
    } catch (error) {
      console.warn('Persistent cache get error:', error);
      this.metrics.recordError();
      return null;
    }
  }

  /**
   * Set item in persistent cache
   */
  set(key, data, ttl = CACHE_CONFIG.PERSISTENT.MAX_AGE) {
    try {
      // Check storage quota
      const item = {
        data,
        expiry: Date.now() + ttl,
        timestamp: Date.now(),
      };

      const serialized = JSON.stringify(item);

      // Check if we need to evict old items
      this.evictIfNeeded();

      localStorage.setItem(`${CACHE_CONFIG.PERSISTENT.STORAGE_KEY}_${key}`, serialized);
    } catch (error) {
      console.warn('Persistent cache set error:', error);
      this.metrics.recordError();

      // If quota exceeded, try to free space
      if (error.name === 'QuotaExceededError') {
        this.evictOldItems();
      }
    }
  }

  /**
   * Delete item from persistent cache
   */
  delete(key) {
    try {
      localStorage.removeItem(`${CACHE_CONFIG.PERSISTENT.STORAGE_KEY}_${key}`);
    } catch (error) {
      console.warn('Persistent cache delete error:', error);
    }
  }

  /**
   * Clear all persistent cache
   */
  clear() {
    try {
      const keys = Object.keys(localStorage);
      keys.forEach(key => {
        if (key.startsWith(CACHE_CONFIG.PERSISTENT.STORAGE_KEY)) {
          localStorage.removeItem(key);
        }
      });
    } catch (error) {
      console.warn('Persistent cache clear error:', error);
    }
  }

  /**
   * Evict old items if needed
   */
  evictIfNeeded() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_CONFIG.PERSISTENT.STORAGE_KEY));

      if (cacheKeys.length >= CACHE_CONFIG.PERSISTENT.MAX_SIZE) {
        this.evictOldItems();
      }
    } catch (error) {
      console.warn('Persistent cache eviction error:', error);
    }
  }

  /**
   * Evict oldest items
   */
  evictOldItems() {
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys
        .filter(key => key.startsWith(CACHE_CONFIG.PERSISTENT.STORAGE_KEY))
        .map(key => ({
          key,
          value: localStorage.getItem(key),
        }))
        .filter(item => item.value)
        .map(item => ({
          key: item.key,
          data: JSON.parse(item.value),
        }))
        .sort((a, b) => a.data.timestamp - b.data.timestamp)
        .slice(0, Math.floor(CACHE_CONFIG.PERSISTENT.MAX_SIZE * 0.3)); // Remove 30% oldest

      cacheKeys.forEach(({ key }) => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.warn('Persistent cache eviction error:', error);
    }
  }

  /**
   * Get cache metrics
   */
  getMetrics() {
    return this.metrics.getStats();
  }
}

// ============================================
// NETWORK CACHE (SERVICE WORKER)
// ============================================

class NetworkCache {
  constructor() {
    this.cacheName = CACHE_CONFIG.NETWORK.CACHE_NAME;
    this.metrics = new CacheMetrics();
  }

  /**
   * Initialize service worker cache
   */
  async initialize() {
    if (!CACHE_CONFIG.NETWORK.ENABLE_SERVICE_WORKER || !('serviceWorker' in navigator)) {
      return false;
    }

    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      return registration.active !== null;
    } catch (error) {
      console.warn('Service worker registration failed:', error);
      return false;
    }
  }

  /**
   * Cache network request
   */
  async cacheRequest(request, response) {
    try {
      if (!('caches' in window)) return;

      const cache = await caches.open(this.cacheName);

      // Clone response as it can only be consumed once
      const responseToCache = response.clone();

      await cache.put(request, responseToCache);
    } catch (error) {
      console.warn('Network cache error:', error);
      this.metrics.recordError();
    }
  }

  /**
   * Get cached response
   */
  async getCachedResponse(request) {
    try {
      if (!('caches' in window)) {
        this.metrics.recordMiss();
        return null;
      }

      const cache = await caches.open(this.cacheName);
      const cachedResponse = await cache.match(request);

      if (cachedResponse) {
        this.metrics.recordHit();
        return cachedResponse;
      } else {
        this.metrics.recordMiss();
        return null;
      }
    } catch (error) {
      console.warn('Network cache get error:', error);
      this.metrics.recordError();
      return null;
    }
  }

  /**
   * Clear network cache
   */
  async clear() {
    try {
      if (!('caches' in window)) return;

      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(name => caches.delete(name))
      );
    } catch (error) {
      console.warn('Network cache clear error:', error);
    }
  }
}

// ============================================
// MAIN CACHE MANAGER
// ============================================

class CacheManager {
  constructor() {
    this.memoryCache = new MemoryCache();
    this.persistentCache = new PersistentCache();
    this.networkCache = new NetworkCache();
    this.initialized = false;
  }

  /**
   * Initialize cache manager
   */
  async initialize() {
    if (this.initialized) return;

    try {
      await this.networkCache.initialize();
      this.initialized = true;
    } catch (error) {
      console.warn('Cache manager initialization error:', error);
    }
  }

  /**
   * Get item from all cache layers
   */
  async get(key, options = {}) {
    const { useMemory = true, usePersistent = true, useNetwork = false } = options;

    // Try memory cache first (fastest)
    if (useMemory) {
      const memoryResult = this.memoryCache.get(key);
      if (memoryResult !== null) {
        return memoryResult;
      }
    }

    // Try persistent cache
    if (usePersistent) {
      const persistentResult = this.persistentCache.get(key);
      if (persistentResult !== null) {
        // Promote to memory cache for faster future access
        if (useMemory) {
          this.memoryCache.set(key, persistentResult);
        }
        return persistentResult;
      }
    }

    // Try network cache
    if (useNetwork) {
      // Network cache logic would be implemented here
      // For now, return null
    }

    return null;
  }

  /**
   * Set item in cache layers
   */
  async set(key, data, options = {}) {
    const {
      memoryTTL = CACHE_CONFIG.MEMORY.DEFAULT_TTL,
      persistentTTL = CACHE_CONFIG.PERSISTENT.MAX_AGE,
      useMemory = true,
      usePersistent = false,
      useNetwork = false,
    } = options;

    // Set in memory cache
    if (useMemory) {
      this.memoryCache.set(key, data, memoryTTL);
    }

    // Set in persistent cache
    if (usePersistent) {
      this.persistentCache.set(key, data, persistentTTL);
    }

    // Network cache would be handled differently
    if (useNetwork) {
      // Implementation would depend on request/response objects
    }
  }

  /**
   * Delete item from all cache layers
   */
  async delete(key) {
    this.memoryCache.delete(key);
    this.persistentCache.delete(key);
  }

  /**
   * Clear all caches
   */
  async clear() {
    this.memoryCache.clear();
    this.persistentCache.clear();
    await this.networkCache.clear();
  }

  /**
   * Invalidate cache by pattern
   */
  async invalidatePattern(pattern) {
    // Simple pattern matching for cache keys
    const regex = new RegExp(pattern);

    // Invalidate memory cache
    for (const key of this.memoryCache.cache.keys()) {
      if (regex.test(key)) {
        this.memoryCache.delete(key);
      }
    }

    // Invalidate persistent cache
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_CONFIG.PERSISTENT.STORAGE_KEY) && regex.test(key)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * Get combined metrics from all cache layers
   */
  getMetrics() {
    const memoryMetrics = this.memoryCache.getMetrics();
    const persistentMetrics = this.persistentCache.getMetrics();
    const networkMetrics = this.networkCache.getMetrics();

    return {
      memory: memoryMetrics,
      persistent: persistentMetrics,
      network: networkMetrics,
      combined: {
        totalHits: memoryMetrics.hits + persistentMetrics.hits + networkMetrics.hits,
        totalMisses: memoryMetrics.misses + persistentMetrics.misses + networkMetrics.misses,
        totalErrors: memoryMetrics.errors + persistentMetrics.errors + networkMetrics.errors,
        hitRate: 0, // Would need to calculate combined hit rate
      },
    };
  }

  /**
   * Reset all metrics
   */
  resetMetrics() {
    this.memoryCache.resetMetrics();
    this.persistentCache.resetMetrics();
    this.networkCache.metrics.reset();
  }
}

// ============================================
// REACT HOOKS
// ============================================

/**
 * Hook for using cache in React components
 */
export const useCache = (key, options = {}) => {
  const {
    defaultValue = null,
    ttl = CACHE_CONFIG.MEMORY.DEFAULT_TTL,
    enabled = true,
    dependencies = [],
  } = options;

  const [data, setData] = useState(defaultValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const cacheManagerRef = useRef();

  useEffect(() => {
    cacheManagerRef.current = window.cacheManager;
  }, []);

  // Load from cache or fetch
  const load = useCallback(async () => {
    if (!enabled || !cacheManagerRef.current) {
      setData(defaultValue);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cachedData = await cacheManagerRef.current.get(key);
      if (cachedData !== null) {
        setData(cachedData);
      } else {
        setData(defaultValue);
      }
    } catch (err) {
      console.warn('Cache load error:', err);
      setError(err);
      setData(defaultValue);
    } finally {
      setLoading(false);
    }
  }, [key, enabled, defaultValue]);

  // Load on mount and when dependencies change
  useEffect(() => {
    load();
  }, dependencies);

  // Set data in cache
  const setCachedData = useCallback(async (newData, cacheOptions = {}) => {
    if (!cacheManagerRef.current) return;

    setData(newData);

    try {
      await cacheManagerRef.current.set(key, newData, {
        memoryTTL: ttl,
        useMemory: true,
        usePersistent: cacheOptions.persist || false,
        ...cacheOptions,
      });
    } catch (err) {
      console.warn('Cache set error:', err);
    }
  }, [key, ttl]);

  // Invalidate cache
  const invalidate = useCallback(async () => {
    if (!cacheManagerRef.current) return;

    try {
      await cacheManagerRef.current.delete(key);
      load(); // Reload from source
    } catch (err) {
      console.warn('Cache invalidation error:', err);
    }
  }, [key, load]);

  return {
    data,
    loading,
    error,
    setData: setCachedData,
    invalidate,
    reload: load,
  };
};

/**
 * Hook for cache metrics
 */
export const useCacheMetrics = () => {
  const [metrics, setMetrics] = useState({});
  const cacheManagerRef = useRef();

  useEffect(() => {
    cacheManagerRef.current = window.cacheManager;
  }, []);

  const refreshMetrics = useCallback(() => {
    if (cacheManagerRef.current) {
      setMetrics(cacheManagerRef.current.getMetrics());
    }
  }, []);

  useEffect(() => {
    refreshMetrics();

    // Update metrics every 30 seconds
    const interval = setInterval(refreshMetrics, 30000);

    return () => clearInterval(interval);
  }, [refreshMetrics]);

  return { metrics, refreshMetrics };
};

/**
 * Hook for cache invalidation by pattern
 */
export const useCacheInvalidation = () => {
  const cacheManagerRef = useRef();

  useEffect(() => {
    cacheManagerRef.current = window.cacheManager;
  }, []);

  const invalidateByPattern = useCallback(async (pattern) => {
    if (!cacheManagerRef.current) return;

    try {
      await cacheManagerRef.current.invalidatePattern(pattern);
    } catch (error) {
      console.warn('Cache invalidation error:', error);
    }
  }, []);

  return { invalidateByPattern };
};

// ============================================
// GLOBAL CACHE MANAGER INSTANCE
// ============================================

// Create global cache manager instance
const globalCacheManager = new CacheManager();

// Initialize cache manager
if (typeof window !== 'undefined') {
  globalCacheManager.initialize().catch(console.warn);
  window.cacheManager = globalCacheManager;
}

export {
  globalCacheManager as cacheManager,
  MemoryCache,
  PersistentCache,
  NetworkCache,
  CacheManager,
  CacheMetrics,
  useCache,
  useCacheMetrics,
  useCacheInvalidation,
};

export default globalCacheManager;
