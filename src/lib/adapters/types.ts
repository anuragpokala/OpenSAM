// Cache Adapter Interface
export interface CacheAdapter {
  get<T>(key: string, prefix?: string): Promise<T | null>;
  set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
  delete(key: string, prefix?: string): Promise<void>;
  clearByPrefix(prefix: string): Promise<void>;
  getStats(): Promise<CacheStats>;
  isConnected(): Promise<boolean>;
}

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Key prefix for organization
}

export interface CacheStats {
  totalKeys: number;
  memoryUsage: string;
  connected: boolean;
}

// Vector Store Adapter Interface
export interface VectorStoreAdapter {
  upsert(collection: string, vectors: Vector[], metadata?: Record<string, any>): Promise<void>;
  query(collection: string, vector: number[], topK?: number, filter?: Record<string, any>): Promise<VectorSearchResult[]>;
  delete(collection: string, ids?: string[]): Promise<void>;
  listCollections(): Promise<string[]>;
  createCollection(collection: string, dimension?: number): Promise<void>;
  deleteCollection(collection: string): Promise<void>;
  isConnected(): Promise<boolean>;
}

export interface Vector {
  id: string;
  values: number[];
  metadata?: Record<string, any>;
}

export interface VectorSearchResult {
  id: string;
  score: number;
  metadata?: Record<string, any>;
  values?: number[];
}

// Environment Configuration
export interface EnvironmentConfig {
  cache: {
    provider: 'redis' | 'upstash';
    url?: string;
    password?: string;
    database?: number;
  };
  vectorStore: {
    provider: 'chroma' | 'weaviate' | 'pinecone';
    url?: string;
    apiKey?: string;
    environment?: string;
    projectId?: string;
  };
}

// Factory function types
export type CacheAdapterFactory = (config: EnvironmentConfig['cache']) => CacheAdapter;
export type VectorStoreAdapterFactory = (config: EnvironmentConfig['vectorStore']) => VectorStoreAdapter; 