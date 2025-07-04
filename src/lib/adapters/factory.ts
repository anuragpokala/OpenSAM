import { EnvironmentConfig, CacheAdapter, VectorStoreAdapter } from './types';
import { RedisCacheAdapter } from './redis-cache';
import { UpstashCacheAdapter } from './upstash-cache';
import { ChromaVectorAdapter } from './chroma-vector';
import { PineconeVectorAdapter } from './pinecone-vector';

// Cache adapter factory
export function createCacheAdapter(config: EnvironmentConfig['cache']): CacheAdapter {
  switch (config.provider) {
    case 'redis':
      return new RedisCacheAdapter({
        url: config.url,
        password: config.password,
        database: config.database
      });
    
    case 'upstash':
      if (!config.url || !config.password) {
        throw new Error('Upstash Redis requires both URL and password');
      }
      return new UpstashCacheAdapter({
        url: config.url,
        password: config.password
      });
    
    default:
      throw new Error(`Unsupported cache provider: ${config.provider}`);
  }
}

// Vector store adapter factory
export function createVectorStoreAdapter(config: EnvironmentConfig['vectorStore']): VectorStoreAdapter {
  switch (config.provider) {
    case 'chroma':
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
  
  return {
    cache: {
      provider: (process.env.CACHE_PROVIDER as 'redis' | 'upstash') || (isProduction ? 'upstash' : 'redis'),
      url: process.env.CACHE_URL,
      password: process.env.CACHE_PASSWORD,
      database: process.env.CACHE_DB ? parseInt(process.env.CACHE_DB) : undefined
    },
    vectorStore: {
      provider: (process.env.VECTOR_STORE_PROVIDER as 'chroma' | 'pinecone') || (isProduction ? 'pinecone' : 'chroma'),
      url: process.env.VECTOR_STORE_URL,
      apiKey: process.env.VECTOR_STORE_API_KEY,
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