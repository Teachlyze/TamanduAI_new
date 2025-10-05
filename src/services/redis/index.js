// src/services/redis/index.js
import { Logger } from '../logger';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import Redis in a Node.js environment
let redis;
if (!isBrowser) {
  (async () => {
    try {
      redis = await import('redis');
    } catch (error) {
      console.warn('Redis module not available, using in-memory cache');
    }
  })();
}

// Simple in-memory cache for browser environment
class BrowserCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  async get(key, parse = true) {
    const value = this.cache.get(key);
    if (!value) return null;

    // Check if the value has expired
    const { data, expiresAt } = value;
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return parse && typeof data === 'string' ? JSON.parse(data) : data;
  }

  async set(key, value, ttl = 300) {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;

    this.cache.set(key, { data, expiresAt });

    // Set timeout to clean up expired items
    if (ttl) {
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }
      
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      }, ttl * 1000);
      
      this.timeouts.set(key, timeout);
    }
    
    return true;
  }

  async del(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    return this.cache.delete(key);
  }

  async deletePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;
    
    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        await this.del(key);
        count++;
      }
    }
    
    return count;
  }

  async clear() {
    this.cache.clear();
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
    return true;
  }

  async healthCheck() {
    return {
      status: 'healthy',
      message: 'Using browser in-memory cache',
      timestamp: new Date().toISOString()
    };
  }

  async getStats() {
    return {
      connected: true,
      mode: 'browser',
      stats: {
        keys: this.cache.size,
        memoryUsage: 0,
        uptime: 0
      }
    };
  }
}

// Redis client configuration
let redisConfig = {};
if (!isBrowser) {
  redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      tls: process.env.NODE_ENV === 'production',
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          Logger.error('Too many Redis connection attempts. Giving up.');
          return new Error('Too many retries');
        }
        return Math.min(retries * 100, 5000);
      }
    }
  };
}

class RedisCache extends BrowserCache {
  constructor() {
    super();
    this.client = null;
    this.connected = false;
    this.connectionPromise = null;
    this.queuedOperations = [];
    this.isProcessingQueue = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async ensureConnection(retryCount = 0) {
    if (isBrowser || !redis) {
      this.connected = false;
      return false;
    }

    if (this.connected) return true;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      try {
        const { createClient } = await import('redis');
        this.client = createClient(redisConfig);

        this.client.on('error', (err) => {
          Logger.error('Redis client error:', err);
          this.connected = false;
        });

        await this.client.connect();
        this.connected = true;
        return true;
      } catch (error) {
        if (retryCount < this.maxRetries) {
          Logger.warn(`Connection attempt ${retryCount + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.ensureConnection(retryCount + 1);
        }
        Logger.error('Failed to connect to Redis after multiple attempts:', error);
        this.connected = false;
        throw error;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async get(key, parse = true) {
    try {
      await this.ensureConnection();
      const value = await this.client.get(key);
      return value && parse ? JSON.parse(value) : value;
    } catch (error) {
      Logger.error('Redis get error:', { key, error });
      return super.get(key, parse); // Fallback to in-memory cache
    }
  }

  async set(key, value, ttl = 300) {
    try {
      await this.ensureConnection();
      const strValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.set(key, strValue, {
        EX: ttl,
        NX: false
      });
      await super.set(key, value, ttl); // Keep in-memory cache in sync
      return true;
    } catch (error) {
      Logger.error('Redis set error:', { key, error });
      return super.set(key, value, ttl); // Fallback to in-memory cache
    }
  }

  async del(key) {
    try {
      await this.ensureConnection();
      await this.client.del(key);
    } catch (error) {
      Logger.error('Redis del error:', { key, error });
    }
    return super.del(key); // Always update in-memory cache
  }

  async deletePattern(pattern) {
    try {
      await this.ensureConnection();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      Logger.error('Redis deletePattern error:', { pattern, error });
    }
    return super.deletePattern(pattern); // Update in-memory cache
  }

  async clear() {
    try {
      await this.ensureConnection();
      await this.client.flushDb();
    } catch (error) {
      Logger.error('Redis clear error:', error);
    }
    return super.clear(); // Clear in-memory cache
  }

  async healthCheck() {
    try {
      await this.ensureConnection();
      const ping = await this.client.ping();
      return {
        status: ping === 'PONG' ? 'healthy' : 'unhealthy',
        message: ping === 'PONG' ? 'Redis is responding' : 'Redis not responding',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Redis connection error: ' + error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getStats() {
    try {
      await this.ensureConnection();
      const info = await this.client.info();
      return {
        connected: true,
        mode: 'server',
        stats: {
          version: info.match(/redis_version:(.*?)\r?\n/)?.[1]?.trim(),
          uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1],
          memory: info.match(/used_memory_human:(.*?)\r?\n/)?.[1]?.trim(),
          clients: info.match(/connected_clients:(\d+)/)?.[1],
          keys: info.match(/db0:keys=(\d+)/)?.[1]
        }
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'server',
        error: error.message
      };
    }
  }

  // Process queued operations
  async processQueue() {
    if (this.isProcessingQueue || this.queuedOperations.length === 0) return;

    this.isProcessingQueue = true;
    
    try {
      while (this.queuedOperations.length > 0) {
        const operation = this.queuedOperations.shift();
        try {
          await operation();
        } catch (error) {
          Logger.error('Error processing queued operation:', error);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Add operation to queue
  queueOperation(operation, ...args) {
    this.queuedOperations.push(() => operation(...args));
    if (!this.isProcessingQueue) {
      this.processQueue().catch(Logger.error);
    }
  }
}

// src/services/redis/index.js
import { Logger } from '../logger';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined';

// Only import Redis in a Node.js environment
let redis;
if (!isBrowser) {
  (async () => {
    try {
      redis = await import('redis');
    } catch (error) {
      console.warn('Redis module not available, using in-memory cache');
    }
  })();
}

// Upstash Redis Edge Function URL
const UPSTASH_REDIS_URL = import.meta.env?.VITE_SUPABASE_URL
  ? `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/redis-cache`
  : null;

// Simple in-memory cache for browser environment
class BrowserCache {
  constructor() {
    this.cache = new Map();
    this.timeouts = new Map();
  }

  async get(key, parse = true) {
    const value = this.cache.get(key);
    if (!value) return null;

    // Check if the value has expired
    const { data, expiresAt } = value;
    if (expiresAt && Date.now() > expiresAt) {
      this.cache.delete(key);
      return null;
    }

    return parse && typeof data === 'string' ? JSON.parse(data) : data;
  }

  async set(key, value, ttl = 300) {
    const data = typeof value === 'string' ? value : JSON.stringify(value);
    const expiresAt = ttl ? Date.now() + ttl * 1000 : null;

    this.cache.set(key, { data, expiresAt });

    // Set timeout to clean up expired items
    if (ttl) {
      if (this.timeouts.has(key)) {
        clearTimeout(this.timeouts.get(key));
      }
      
      const timeout = setTimeout(() => {
        this.cache.delete(key);
        this.timeouts.delete(key);
      }, ttl * 1000);
      
      this.timeouts.set(key, timeout);
    }

    return true;
  }

  async del(key) {
    if (this.timeouts.has(key)) {
      clearTimeout(this.timeouts.get(key));
      this.timeouts.delete(key);
    }
    return this.cache.delete(key);
  }

  async deletePattern(pattern) {
    const regex = new RegExp(pattern.replace(/\*/g, '.*'));
    let count = 0;

    for (const key of this.cache.keys()) {
      if (regex.test(key)) {
        await this.del(key);
        count++;
      }
    }

    return count;
  }

  async clear() {
    this.cache.clear();
    this.timeouts.forEach(clearTimeout);
    this.timeouts.clear();
    return true;
  }

  async healthCheck() {
    return {
      status: 'healthy',
      message: 'Using browser in-memory cache',
      timestamp: new Date().toISOString()
    };
  }

  async getStats() {
    return {
      connected: true,
      mode: 'browser',
      stats: {
        keys: this.cache.size,
        memoryUsage: 0,
        uptime: 0
      }
    };
  }
}

// Redis client configuration
let redisConfig = {};
if (!isBrowser) {
  redisConfig = {
    url: process.env.REDIS_URL || 'redis://localhost:6379',
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD,
    socket: {
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT) || 6379,
      tls: process.env.NODE_ENV === 'production',
      reconnectStrategy: (retries) => {
        if (retries > 10) {
          Logger.error('Too many Redis connection attempts. Giving up.');
          return new Error('Too many retries');
        }
        return Math.min(retries * 100, 5000);
      }
    }
  };
}

// Upstash Redis Edge Function Cache
class UpstashRedisCache extends BrowserCache {
  constructor() {
    super();
    this.edgeFunctionUrl = UPSTASH_REDIS_URL;
    this.enabled = !!this.edgeFunctionUrl;
  }

  async makeEdgeFunctionRequest(action, key, value = null, ttl = null) {
    if (!this.enabled) {
      throw new Error('Upstash Redis edge function not available');
    }

    const payload = { action, key };
    if (value !== null) payload.value = value;
    if (ttl !== null) payload.ttl = ttl;

    const response = await fetch(this.edgeFunctionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env?.VITE_SUPABASE_ANON_KEY || ''}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Edge function error: ${response.status} ${errorData.message || 'Unknown error'}`);
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error(`Redis operation failed: ${data.error}`);
    }

    return data.result;
  }

  async get(key, parse = true) {
    try {
      // Try edge function first
      if (this.enabled) {
        const value = await this.makeEdgeFunctionRequest('get', key);

        if (value !== null) {
          // Also store in local cache for faster subsequent access
          await super.set(key, value);
          return parse ? JSON.parse(value) : value;
        }
      }

      // Fallback to local cache
      return super.get(key, parse);
    } catch (error) {
      Logger.warn('Upstash Redis get failed, using local cache:', error);
      return super.get(key, parse);
    }
  }

  async set(key, value, ttl = 300) {
    try {
      // Try edge function first
      if (this.enabled) {
        const strValue = typeof value === 'string' ? value : JSON.stringify(value);
        await this.makeEdgeFunctionRequest('set', key, strValue, ttl);
      }

      // Always update local cache
      await super.set(key, value, ttl);
      return true;
    } catch (error) {
      Logger.warn('Upstash Redis set failed, using local cache only:', error);
      return super.set(key, value, ttl);
    }
  }

  async del(key) {
    try {
      // Try edge function first
      if (this.enabled) {
        await this.makeEdgeFunctionRequest('del', key);
      }
    } catch (error) {
      Logger.warn('Upstash Redis del failed:', error);
    }

    // Always update local cache
    return super.del(key);
  }

  async deletePattern(pattern) {
    try {
      // Try edge function first
      if (this.enabled) {
        await this.makeEdgeFunctionRequest('keys', pattern);
        // Note: This would need a proper deletePattern implementation in the edge function
      }
    } catch (error) {
      Logger.warn('Upstash Redis deletePattern failed:', error);
    }

    // Fallback to local implementation
    return super.deletePattern(pattern);
  }

  async clear() {
    try {
      // Try edge function first
      if (this.enabled) {
        await this.makeEdgeFunctionRequest('flush');
      }
    } catch (error) {
      Logger.warn('Upstash Redis clear failed:', error);
    }

    // Always clear local cache
    return super.clear();
  }

  async healthCheck() {
    try {
      if (this.enabled) {
        await this.makeEdgeFunctionRequest('ping');
        return {
          status: 'healthy',
          message: 'Upstash Redis edge function is responding',
          mode: 'upstash-edge',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      Logger.warn('Upstash Redis health check failed:', error);
    }

    return super.healthCheck();
  }
}

class RedisCache extends BrowserCache {
  constructor() {
    super();
    this.client = null;
    this.connected = false;
    this.connectionPromise = null;
    this.queuedOperations = [];
    this.isProcessingQueue = false;
    this.maxRetries = 3;
    this.retryDelay = 1000; // 1 second
  }

  async ensureConnection(retryCount = 0) {
    if (isBrowser || !redis) {
      this.connected = false;
      return false;
    }

    if (this.connected) return true;
    if (this.connectionPromise) return this.connectionPromise;

    this.connectionPromise = (async () => {
      try {
        const { createClient } = await import('redis');
        this.client = createClient(redisConfig);

        this.client.on('error', (err) => {
          Logger.error('Redis client error:', err);
          this.connected = false;
        });

        await this.client.connect();
        this.connected = true;
        return true;
      } catch (error) {
        if (retryCount < this.maxRetries) {
          Logger.warn(`Connection attempt ${retryCount + 1} failed, retrying...`);
          await new Promise(resolve => setTimeout(resolve, this.retryDelay));
          return this.ensureConnection(retryCount + 1);
        }
        Logger.error('Failed to connect to Redis after multiple attempts:', error);
        this.connected = false;
        throw error;
      } finally {
        this.connectionPromise = null;
      }
    })();

    return this.connectionPromise;
  }

  async get(key, parse = true) {
    try {
      await this.ensureConnection();
      const value = await this.client.get(key);
      return value && parse ? JSON.parse(value) : value;
    } catch (error) {
      Logger.error('Redis get error:', { key, error });
      return super.get(key, parse); // Fallback to in-memory cache
    }
  }

  async set(key, value, ttl = 300) {
    try {
      await this.ensureConnection();
      const strValue = typeof value === 'string' ? value : JSON.stringify(value);
      await this.client.set(key, strValue, {
        EX: ttl,
        NX: false
      });
      await super.set(key, value, ttl); // Keep in-memory cache in sync
      return true;
    } catch (error) {
      Logger.error('Redis set error:', { key, error });
      return super.set(key, value, ttl); // Fallback to in-memory cache
    }
  }

  async del(key) {
    try {
      await this.ensureConnection();
      await this.client.del(key);
    } catch (error) {
      Logger.error('Redis del error:', { key, error });
    }
    return super.del(key); // Always update in-memory cache
  }

  async deletePattern(pattern) {
    try {
      await this.ensureConnection();
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(keys);
      }
    } catch (error) {
      Logger.error('Redis deletePattern error:', { pattern, error });
    }
    return super.deletePattern(pattern); // Update in-memory cache
  }

  async clear() {
    try {
      await this.ensureConnection();
      await this.client.flushDb();
    } catch (error) {
      Logger.error('Redis clear error:', error);
    }
    return super.clear(); // Clear in-memory cache
  }

  async healthCheck() {
    try {
      await this.ensureConnection();
      const ping = await this.client.ping();
      return {
        status: ping === 'PONG' ? 'healthy' : 'unhealthy',
        message: ping === 'PONG' ? 'Redis is responding' : 'Redis not responding',
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        message: 'Redis connection error: ' + error.message,
        timestamp: new Date().toISOString()
      };
    }
  }

  async getStats() {
    try {
      await this.ensureConnection();
      const info = await this.client.info();
      return {
        connected: true,
        mode: 'server',
        stats: {
          version: info.match(/redis_version:(.*?)\r?\n/)?.[1]?.trim(),
          uptime: info.match(/uptime_in_seconds:(\d+)/)?.[1],
          memory: info.match(/used_memory_human:(.*?)\r?\n/)?.[1]?.trim(),
          clients: info.match(/connected_clients:(\d+)/)?.[1],
          keys: info.match(/db0:keys=(\d+)/)?.[1]
        }
      };
    } catch (error) {
      return {
        connected: false,
        mode: 'server',
        error: error.message
      };
    }
  }

  // Process queued operations
  async processQueue() {
    if (this.isProcessingQueue || this.queuedOperations.length === 0) return;

    this.isProcessingQueue = true;

    try {
      while (this.queuedOperations.length > 0) {
        const operation = this.queuedOperations.shift();
        try {
          await operation();
        } catch (error) {
          Logger.error('Error processing queued operation:', error);
        }
      }
    } finally {
      this.isProcessingQueue = false;
    }
  }

  // Add operation to queue
  queueOperation(operation, ...args) {
    this.queuedOperations.push(() => operation(...args));
    if (!this.isProcessingQueue) {
      this.processQueue().catch(Logger.error);
    }
  }
}

// Determine which cache implementation to use
if (isBrowser) {
  // Browser: use in-memory cache with optional Upstash edge function
  cacheInstance = new UpstashRedisCache();
} else if (redis) {
  // Node.js with Redis available: use Redis client
  try {
    cacheInstance = new RedisCache();
  } catch (error) {
    console.error('Failed to initialize Redis, falling back to in-memory cache:', error);
    cacheInstance = new BrowserCache();
  }
} else {
  // Fallback to in-memory cache
  cacheInstance = new BrowserCache();
}

// Export the cache instance as both named and default export
const redisCache = cacheInstance;
export { redisCache };
export default redisCache;
