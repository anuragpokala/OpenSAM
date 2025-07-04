import { Redis } from '@upstash/redis';
import { CacheAdapter, CacheOptions, CacheStats } from './types';

export class UpstashCacheAdapter implements CacheAdapter {
  private client: Redis;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly MAX_TTL = 86400; // 24 hours

  constructor(config: { url: string; password: string }) {
    if (!config.url || !config.password) {
      throw new Error('Upstash Redis requires both URL and password');
    }

    this.client = new Redis({
      url: config.url,
      token: config.password,
    });

    console.log('✅ Upstash Redis client initialized');
  }

  private generateKey(key: string, prefix?: string): string {
    const baseKey = prefix ? `${prefix}:${key}` : key;
    return baseKey.replace(/[^a-zA-Z0-9:_-]/g, '_');
  }

  async get<T>(key: string, prefix?: string): Promise<T | null> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      const cachedValue = await this.client.get(cacheKey);
      
      if (!cachedValue) {
        return null;
      }

      const parsed = JSON.parse(cachedValue as string);
      
      // Check if cache is still valid
      if (parsed.timestamp && parsed.ttl) {
        const age = (Date.now() - parsed.timestamp) / 1000;
        if (age > parsed.ttl) {
          // Cache expired, remove it
          await this.client.del(cacheKey);
          return null;
        }
      }

      console.log(`📖 Cache hit: ${cacheKey}`);
      return parsed.data as T;
    } catch (error) {
      console.error('❌ Cache get error:', error);
      return null;
    }
  }

  async set<T>(key: string, value: T, options: CacheOptions = {}): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, options.prefix);
      const ttl = Math.min(options.ttl || this.DEFAULT_TTL, this.MAX_TTL);
      
      const serializedValue = JSON.stringify({
        data: value,
        timestamp: Date.now(),
        ttl
      });

      await this.client.setex(cacheKey, ttl, serializedValue);
      console.log(`💾 Cached: ${cacheKey} (TTL: ${ttl}s)`);
    } catch (error) {
      console.error('❌ Cache set error:', error);
      // Don't throw error to prevent application failure
    }
  }

  async delete(key: string, prefix?: string): Promise<void> {
    try {
      const cacheKey = this.generateKey(key, prefix);
      await this.client.del(cacheKey);
      console.log(`🗑️ Deleted cache: ${cacheKey}`);
    } catch (error) {
      console.error('❌ Cache delete error:', error);
    }
  }

  async clearByPrefix(prefix: string): Promise<void> {
    try {
      const pattern = `${prefix}:*`;
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
        console.log(`🗑️ Cleared ${keys.length} cache entries with prefix: ${prefix}`);
      }
    } catch (error) {
      console.error('❌ Cache clear error:', error);
    }
  }

  async getStats(): Promise<CacheStats> {
    try {
      // Get total keys from Upstash Redis
      const totalKeys = await this.client.dbsize();
      
      // Upstash doesn't provide detailed memory info like local Redis
      // So we'll use a placeholder
      const memoryUsage = 'Managed by Upstash';

      return {
        totalKeys: totalKeys || 0,
        memoryUsage,
        connected: true // Upstash handles connection management
      };
    } catch (error) {
      console.error('❌ Cache stats error:', error);
      return {
        totalKeys: 0,
        memoryUsage: 'Unknown',
        connected: false
      };
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      await this.client.ping();
      return true;
    } catch (error) {
      return false;
    }
  }
} 