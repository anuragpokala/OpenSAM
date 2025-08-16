import { EnvironmentConfig, CacheAdapter, VectorStoreAdapter } from './types';
import { UpstashCacheAdapter } from './upstash-cache';
import { BrowserCacheAdapter } from './browser-cache';
import { PineconeVectorAdapter } from './pinecone-vector';

// Import server-side adapters only when not in browser
let RedisCacheAdapter: any = null;
let ChromaVectorAdapter: any = null;

if (typeof window === 'undefined') {
  // Server-side only
  const redisModule = require('./redis-cache');
  RedisCacheAdapter = redisModule.RedisCacheAdapter;
  
  const chromaModule = require('./chroma-vector');
  ChromaVectorAdapter = chromaModule.ChromaVectorAdapter;
}

// Cache adapter factory
export function createCacheAdapter(config: EnvironmentConfig['cache']): CacheAdapter {
  switch (config.provider) {
    case 'redis':
      if (!RedisCacheAdapter) {
        console.warn('⚠️ Redis not available in browser, falling back to browser cache');
        return new BrowserCacheAdapter();
      }
      return new RedisCacheAdapter({
        url: config.url,
        password: config.password,
        database: config.database
      });
    
    case 'upstash':
      if (!config.url || !config.password) {
        console.warn('⚠️ Upstash configuration incomplete, falling back to browser cache');
        return new BrowserCacheAdapter();
      }
      return new UpstashCacheAdapter({
        url: config.url,
        password: config.password
      });
    
    case 'browser':
      return new BrowserCacheAdapter();
    
    default:
      console.warn(`⚠️ Unknown cache provider: ${config.provider}, falling back to browser cache`);
      return new BrowserCacheAdapter();
  }
}

// Vector store adapter factory
export function createVectorStoreAdapter(config: EnvironmentConfig['vectorStore']): VectorStoreAdapter {
  switch (config.provider) {
    case 'chroma':
      if (!ChromaVectorAdapter) {
        console.warn('⚠️ ChromaDB not available in browser, falling back to Pinecone');
        // Fall back to Pinecone or throw error
        if (!config.apiKey || !config.environment) {
          throw new Error('ChromaDB not available in browser and Pinecone not configured');
        }
        return new PineconeVectorAdapter({
          apiKey: config.apiKey,
          environment: config.environment,
          projectId: config.projectId
        });
      }
      return new ChromaVectorAdapter({
        url: config.url
      });
    
    case 'pinecone':
      if (!config.apiKey || !config.environment) {
        throw new Error('Pinecone requires both API key and environment');
      }
      return new PineconeVectorAdapter({
        apiKey: config.apiKey,
        environment: config.environment,
        projectId: config.projectId
      });
    
    default:
      throw new Error(`Unsupported vector store provider: ${config.provider}`);
  }
}

// Environment configuration loader
export function loadEnvironmentConfig(): EnvironmentConfig {
  const isProduction = process.env.NODE_ENV === 'production';
  const isBrowser = typeof window !== 'undefined';
  
  return {
    cache: {
      provider: (process.env.CACHE_PROVIDER as 'redis' | 'upstash' | 'browser') || 
                (isBrowser ? 'browser' : (isProduction ? 'upstash' : 'redis')),
      url: process.env.CACHE_URL,
      password: process.env.CACHE_PASSWORD,
      database: process.env.CACHE_DB ? parseInt(process.env.CACHE_DB) : undefined
    },
    vectorStore: {
      provider: (process.env.VECTOR_STORE_PROVIDER as 'chroma' | 'pinecone') || (isProduction ? 'pinecone' : 'chroma'),
      url: process.env.VECTOR_STORE_URL,
      apiKey: process.env.PINECONE_API_KEY,
      environment: process.env.VECTOR_STORE_ENVIRONMENT,
      projectId: process.env.VECTOR_STORE_PROJECT_ID
    }
  };
}

// Singleton instances
let cacheAdapter: CacheAdapter | null = null;
let vectorStoreAdapter: VectorStoreAdapter | null = null;

export function getCacheAdapter(): CacheAdapter {
  if (!cacheAdapter) {
    const config = loadEnvironmentConfig();
    cacheAdapter = createCacheAdapter(config.cache);
  }
  return cacheAdapter;
}

export function getVectorStoreAdapter(): VectorStoreAdapter {
  if (!vectorStoreAdapter) {
    const config = loadEnvironmentConfig();
    vectorStoreAdapter = createVectorStoreAdapter(config.vectorStore);
  }
  return vectorStoreAdapter;
}

// Reset instances (useful for testing)
export function resetAdapters(): void {
  cacheAdapter = null;
  vectorStoreAdapter = null;
} 