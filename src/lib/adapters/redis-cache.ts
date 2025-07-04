import Redis from 'ioredis';
import { CacheAdapter, CacheOptions, CacheStats } from './types';

export class RedisCacheAdapter implements CacheAdapter {
  private client: Redis;
  private readonly DEFAULT_TTL = 3600; // 1 hour
  private readonly MAX_TTL = 86400; // 24 hours

  constructor(config: { url?: string; password?: string; database?: number }) {
    const url = config.url || 'redis://localhost:6379';
    const database = config.database || 0;

    this.client = new Redis(url, {
      password: config.password,
      db: database,
      maxRetriesPerRequest: 3,
      lazyConnect: false,
      keepAlive: 30000,
      connectTimeout: 10000,
      commandTimeout: 5000,
    });

    this.client.on('connect', () => {
      console.log('✅ Redis connected successfully');
    });

    this.client.on('error', (error) => {
      console.error('❌ Redis connection error:', error);
    });

    this.client.on('close', () => {
      console.log('🔌 Redis connection closed');
    });

    this.client.on('reconnecting', () => {
      console.log('🔄 Redis reconnecting...');
    });
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

      const parsed = JSON.parse(cachedValue);
      
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
      const [totalKeys, memoryInfo] = await Promise.all([
        this.client.dbsize(),
        this.client.info('memory')
      ]);

      // Parse memory usage from info
      const memoryMatch = memoryInfo.match(/used_memory_human:(\S+)/);
      const memoryUsage = memoryMatch ? memoryMatch[1] : 'Unknown';

      return {
        totalKeys,
        memoryUsage,
        connected: this.client.status === 'ready'
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
      return this.client.status === 'ready';
    } catch (error) {
      return false;
    }
  }

  async close(): Promise<void> {
    if (this.client) {
      await this.client.quit();
      console.log('🔌 Redis connection closed');
    }
  }
} 