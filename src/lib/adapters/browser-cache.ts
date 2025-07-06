import { CacheAdapter, CacheOptions, CacheStats } from './types';

/**
 * Browser-safe cache adapter using localStorage
 * Used as fallback when Redis is not available in browser environment
 */
export class BrowserCacheAdapter implements CacheAdapter {
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly MAX_TTL = 86400; // 24 hours
  private readonly STORAGE_KEY = 'opensam-cache';

  constructor() {
    console.log('✅ Browser cache adapter initialized (localStorage)');
  }

  private generateKey(key: string, prefix?: string): string {
    const baseKey = prefix ? `${prefix}:${key}` : key;
    return baseKey.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }

  private getStorage(): Storage {
    if (typeof window === 'undefined') {
      throw new Error('localStorage is not available in server environment');
    }
    return window.localStorage;
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const storage = this.getStorage();
      const cacheKey = this.generateKey(key, prefix);
      const fullKey = `${this.STORAGE_KEY}:${cacheKey}`;
      
      const cachedValue = storage.getItem(fullKey);
      if (!cachedValue) {
        return null;
      }

      const parsed = JSON.parse(cachedValue);
      
      // Check if cache is still valid
      if (parsed.timestamp && parsed.ttl) {
        const age = (Date.now() - parsed.timestamp) / 1000;
        if (age > parsed.ttl) {
          // Cache expired, remove it
          storage.removeItem(fullKey);
          return null;
        }
      }

      console.log(`📖 Browser cache hit: ${cacheKey}`);
      return parsed.data as T;
    } catch (error) {
      console.error('❌ Browser cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const storage = this.getStorage();
      const cacheKey = this.generateKey(key, options.prefix);
      const fullKey = `${this.STORAGE_KEY}:${cacheKey}`;
      const ttl = Math.min(options.ttl || this.DEFAULT_TTL, this.MAX_TTL);
      
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        ttl
      });

      storage.setItem(fullKey, serializedValue);
      console.log(`💾 Browser cached: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error('❌ Browser cache set error:', error);
      // Don't throw error to prevent application failure
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const storage = this.getStorage();
      const cacheKey = this.generateKey(key, prefix);
      const fullKey = `${this.STORAGE_KEY}:${cacheKey}`;
      
      storage.removeItem(fullKey);
      console.log(`🗑️ Deleted browser cache: ${cacheKey}`);
    } catch (error) {
      console.error('❌ Browser cache delete error:', error);
    }
  }

  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const storage = this.getStorage();
      const pattern = `${this.STORAGE_KEY}:${prefix}:`;
      const keysToRemove: string[] = [];
      
      // Find all keys with the prefix
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(pattern)) {
          keysToRemove.push(key);
        }
      }
      
      // Remove all matching keys
      keysToRemove.forEach(key => storage.removeItem(key));
      console.log(`🗑️ Cleared ${keysToRemove.length} browser cache entries with prefix: ${prefix}`);
    } catch (error) {
      console.error('❌ Browser cache clear error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      const storage = this.getStorage();
      let totalKeys = 0;
      let totalSize = 0;
      
      // Count cache keys and calculate size
      for (let i = 0; i < storage.length; i++) {
        const key = storage.key(i);
        if (key && key.startsWith(this.STORAGE_KEY)) {
          totalKeys++;
          const value = storage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      }
      
      const memoryUsage = `${Math.round(totalSize / 1024)}KB`;
      
      return {
        totalKeys,
        memoryUsage,
        connected: true // localStorage is always available in browser
      };
    } catch (error) {
      console.error('❌ Browser cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
        connected: false
      };
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      // Test if localStorage is available
      const storage = this.getStorage();
      const testKey = `${this.STORAGE_KEY}:test`;
      storage.setItem(testKey, 'test');
      storage.removeItem(testKey);
      return true;
    } catch (error) {
      return false;
    }
  }

  async close(): Promise<void> {
    // localStorage doesn't need explicit closing
    console.log('🔌 Browser cache adapter closed');
  }
} 