import { ChromaClient, Collection } from 'chromadb';
import { VectorStoreAdapter, Vector, VectorSearchResult } from './types';

export class ChromaVectorAdapter implements VectorStoreAdapter {
  private client: ChromaClient;
  private collections: Map<string, Collection> = new Map();

  constructor(config: { url?: string }) {
    // Check if we're running in the browser
    const isBrowser = typeof window !== 'undefined';
    
    if (isBrowser) {
      // In browser, use the Next.js proxy to avoid CORS issues
      this.client = new ChromaClient({
        host: window.location.hostname,
        port: parseInt(window.location.port) || 80,
        ssl: window.location.protocol === 'https:',
        path: '/api/chromadb-proxy'
      });
    } else {
      // Server-side: direct connection to ChromaDB
      this.client = new ChromaClient({
        host: 'localhost',
        port: 8000,
        ssl: false
      });
    }
    console.log('✅ ChromaDB client initialized');
  }

  async createCollection(collection: string, dimension: number = 1536): Promise<void> {
    try {
      if (this.collections.has(collection)) {
        return; // Collection already exists in memory
      }

      // Check if collection already exists in ChromaDB
      try {
        const existingCollection = await this.client.getCollection({ name: collection });
        this.collections.set(collection, existingCollection);
        console.log(`✅ Found existing ChromaDB collection: ${collection}`);
        return;
      } catch (getError: any) {
        // Collection doesn't exist, create it
        if (getError.message?.includes('not found') || getError.message?.includes('does not exist')) {
          const chromaCollection = await this.client.createCollection({
            name: collection,
            metadata: {
              dimension: dimension.toString(),
              description: `Collection for ${collection} vectors`
            }
          });

          this.collections.set(collection, chromaCollection);
          console.log(`✅ Created ChromaDB collection: ${collection}`);
        } else {
          throw getError;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create collection ${collection}:`, error);
      throw error;
    }
  }

  private async getCollection(collection: string): Promise<Collection> {
    if (!this.collections.has(collection)) {
      try {
        const chromaCollection = await this.client.getCollection({ name: collection });
        this.collections.set(collection, chromaCollection);
      } catch (error) {
        // Collection doesn't exist, create it
        await this.createCollection(collection);
      }
    }
    return this.collections.get(collection)!;
  }

  async upsert(collection: string, vectors: Vector[], metadata?: Record<string, any>): Promise<void> {
    try {
      const chromaCollection = await this.getCollection(collection);
      
      const ids = vectors.map(v => v.id);
      const embeddings = vectors.map(v => v.values);
      const metadatas = vectors.map(v => ({ ...v.metadata, ...metadata }));

      await chromaCollection.upsert({
        ids,
        embeddings,
        metadatas
      });

      console.log(`✅ Upserted ${vectors.length} vectors to collection: ${collection}`);
    } catch (error) {
      console.error(`❌ Failed to upsert vectors to ${collection}:`, error);
      throw error;
    }
  }

  async query(
    collection: string, 
    vector: number[], 
    topK: number = 10, 
    filter?: Record<string, any>
  ): Promise<VectorSearchResult[]> {
    try {
      const chromaCollection = await this.getCollection(collection);
      
      const queryOptions: any = {
        queryEmbeddings: [vector],
        nResults: topK,
      };

      // Only add where clause if filter is provided and not empty
      if (filter && Object.keys(filter).length > 0) {
        queryOptions.where = filter;
      }

      const queryResult = await chromaCollection.query(queryOptions);

      if (!queryResult.ids || !queryResult.embeddings || !queryResult.metadatas) {
        return [];
      }

      const results: VectorSearchResult[] = [];
      const ids = queryResult.ids[0] || [];
      const embeddings = queryResult.embeddings[0] || [];
      const metadatas = queryResult.metadatas[0] || [];
      const distances = queryResult.distances?.[0] || [];

      for (let i = 0; i < ids.length; i++) {
        const id = ids[i];
        const embedding = embeddings[i];
        const metadata = metadatas[i];
        const distance = distances[i];

        // Convert distance to similarity score (ChromaDB returns distances, we want similarities)
        const score = distance !== undefined && distance !== null ? 1 - distance : 0;

        results.push({
          id: id as string,
          score,
          metadata: metadata as Record<string, any>,
          values: embedding as number[]
        });
      }

      console.log(`✅ Queried ${results.length} results from collection: ${collection}`);
      return results;
    } catch (error) {
      console.error(`❌ Failed to query collection ${collection}:`, error);
      throw error;
    }
  }

  async delete(collection: string, ids?: string[]): Promise<void> {
    try {
      const chromaCollection = await this.getCollection(collection);
      
      if (ids && ids.length > 0) {
        await chromaCollection.delete({ ids });
        console.log(`✅ Deleted ${ids.length} vectors from collection: ${collection}`);
      } else {
        // Delete all vectors in collection
        await chromaCollection.delete({});
        console.log(`✅ Deleted all vectors from collection: ${collection}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete from collection ${collection}:`, error);
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    try {
      const collections = await this.client.listCollections();
      return collections.map(col => col.name);
    } catch (error) {
      console.error('❌ Failed to list collections:', error);
      return [];
    }
  }

  async deleteCollection(collection: string): Promise<void> {
    try {
      await this.client.deleteCollection({ name: collection });
      this.collections.delete(collection);
      console.log(`✅ Deleted collection: ${collection}`);
    } catch (error) {
      console.error(`❌ Failed to delete collection ${collection}:`, error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      // For embedded ChromaDB, try to list collections as a connection test
      await this.client.listCollections();
      return true;
    } catch (error) {
      console.error('ChromaDB connection test failed:', error);
      return false;
    }
  }
} 