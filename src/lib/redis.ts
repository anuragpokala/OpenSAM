import { getCacheAdapter } from './adapters/factory';
import { CacheOptions } from './adapters/types';

// Cache configuration
const DEFAULT_TTL = 3600; // 1 hour in seconds
const MAX_TTL = 86400; // 24 hours in seconds

/**
 * Generate cache key with prefix
 */
export function generateCacheKey(key: string, prefix?: string): string {
  const baseKey = prefix ? `${prefix}:${key}` : key;
  return baseKey.replace(/[^a-zA-Z0-9:_-]/g, '_');
}

/**
 * Set cache value
 */
export async function setCache<T>(
  key: string, 
  value: T, 
  options: CacheOptions = {}
): Promise<void> {
  try {
    const cache = getCacheAdapter();
    const ttl = Math.min(options.ttl || DEFAULT_TTL, MAX_TTL);
    await cache.set(key, value, { ...options, ttl });
  } catch (error) {
    console.error('❌ Cache set error:', error);
    // Don't throw error to prevent application failure
  }
}

/**
 * Get cache value
 */
export async function getCache<T>(key: string, prefix?: string): Promise<T | null> {
  try {
    const cache = getCacheAdapter();
    return await cache.get<T>(key, prefix);
  } catch (error) {
    console.error('❌ Cache get error:', error);
    return null;
  }
}

/**
 * Delete cache value
 */
export async function deleteCache(key: string, prefix?: string): Promise<void> {
  try {
    const cache = getCacheAdapter();
    await cache.delete(key, prefix);
  } catch (error) {
    console.error('❌ Cache delete error:', error);
  }
}

/**
 * Clear all cache with prefix
 */
export async function clearCacheByPrefix(prefix: string): Promise<void> {
  try {
    const cache = getCacheAdapter();
    await cache.clearByPrefix(prefix);
  } catch (error) {
    console.error('❌ Cache clear error:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats() {
  try {
    const cache = getCacheAdapter();
    return await cache.getStats();
  } catch (error) {
    console.error('❌ Cache stats error:', error);
    return {
      totalKeys: 0,
      memoryUsage: 'Unknown',
      connected: false
    };
  }
}

/**
 * Cache wrapper for async functions
 */
export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  options: CacheOptions = {}
): Promise<T> {
  // Try to get from cache first
  const cached = await getCache<T>(key, options.prefix);
  if (cached !== null) {
    return cached;
  }

  // Execute function and cache result
  const result = await fn();
  await setCache(key, result, options);
  
  return result;
}

/**
 * Cache middleware for API routes
 */
export function cacheMiddleware(prefix: string, ttl: number = DEFAULT_TTL) {
  return async (req: Request, handler: () => Promise<Response>) => {
    const url = new URL(req.url);
    const cacheKey = `${req.method}:${url.pathname}${url.search}`;
    
    // Try to get from cache
    const cached = await getCache<Response>(cacheKey, prefix);
    if (cached) {
      return cached;
    }

    // Execute handler and cache response
    const response = await handler();
    
    // Only cache successful responses
    if (response.ok) {
      const responseClone = response.clone();
      const responseData = await responseClone.json();
      await setCache(cacheKey, responseData, { prefix, ttl });
    }

    return response;
  };
}

/**
 * Check if cache is connected
 */
export async function isCacheConnected(): Promise<boolean> {
  try {
    const cache = getCacheAdapter();
    return await cache.isConnected();
  } catch (error) {
    return false;
  }
} 