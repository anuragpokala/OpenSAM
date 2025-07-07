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
      console.log('🔍 Initializing ChromaDB client with config:', {
        host: 'localhost',
        port: 8000,
        ssl: false
      });
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
      console.log(`🔍 Creating collection: ${collection} with dimension: ${dimension}`);
      
      if (this.collections.has(collection)) {
        console.log(`✅ Collection ${collection} already exists in memory`);
        return; // Collection already exists in memory
      }

      // Check if collection already exists in ChromaDB
      try {
        console.log(`🔍 Checking if collection ${collection} exists in ChromaDB...`);
        const existingCollection = await this.client.getCollection({ name: collection });
        this.collections.set(collection, existingCollection);
        console.log(`✅ Found existing ChromaDB collection: ${collection}`);
        return;
      } catch (getError: any) {
        console.log(`🔍 Collection ${collection} not found, creating new one...`);
        console.log(`🔍 Get error details:`, getError.message);
        
        // Collection doesn't exist, create it
        if (getError.message?.includes('not found') || getError.message?.includes('does not exist') || getError.message?.includes('The requested resource could not be found')) {
          console.log(`🔍 Creating new collection ${collection}...`);
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
          console.error(`❌ Unexpected error getting collection:`, getError);
          throw getError;
        }
      }
    } catch (error) {
      console.error(`❌ Failed to create collection ${collection}:`, error);
      console.error(`❌ Error details:`, error);
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
      console.log(`🔍 ChromaDB: Upserting ${vectors.length} vectors to collection ${collection}`);
      const chromaCollection = await this.getCollection(collection);
      
      const ids = vectors.map(v => v.id);
      const embeddings = vectors.map(v => v.values);
      const metadatas = vectors.map(v => ({ ...v.metadata, ...metadata }));

      console.log(`🔍 ChromaDB: Vector IDs:`, ids);
      console.log(`🔍 ChromaDB: Vector metadata:`, metadatas.map(m => ({ id: m.id, type: m.type, title: m.title })));

      await chromaCollection.upsert({
        ids,
        embeddings,
        metadatas
      });

      console.log(`✅ ChromaDB: Successfully upserted ${vectors.length} vectors to collection: ${collection}`);
      
      // Verify the vectors were stored
      for (const vectorId of ids) {
        try {
          const storedVector = await this.getVector(collection, vectorId);
          if (storedVector) {
            console.log(`✅ ChromaDB: Verified vector ${vectorId} is stored in collection ${collection}`);
          } else {
            console.warn(`⚠️ ChromaDB: Failed to verify vector ${vectorId} in collection ${collection}`);
          }
        } catch (verifyError) {
          console.warn(`⚠️ ChromaDB: Error verifying vector ${vectorId}:`, verifyError);
        }
      }
    } catch (error) {
      console.error(`❌ ChromaDB: Failed to upsert vectors to ${collection}:`, error);
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

  async getVector(collection: string, id: string): Promise<Vector | null> {
    try {
      console.log(`🔍 ChromaDB: Getting vector ${id} from collection ${collection}`);
      const chromaCollection = await this.getCollection(collection);
      
      // Try to get the vector by ID using the get method first
      try {
        console.log(`🔍 ChromaDB: Trying get method for vector ${id}`);
        const getResult = await chromaCollection.get({
          ids: [id],
          include: ['embeddings', 'metadatas']
        });

        if (getResult.ids && getResult.ids.length > 0) {
          console.log(`✅ ChromaDB: Found vector ${id} via get method`);
          return {
            id: getResult.ids[0] as string,
            values: getResult.embeddings?.[0] as number[] || [],
            metadata: getResult.metadatas?.[0] as Record<string, any> || {}
          };
        } else {
          console.log(`⚠️ ChromaDB: Get method returned no results for vector ${id}`);
        }
      } catch (getError) {
        // If get fails, fall back to query method
        console.log(`⚠️ ChromaDB: Get method failed for vector ${id}, trying query method...`, getError);
      }
      
      // Fallback: Query for the specific vector by ID
      console.log(`🔍 ChromaDB: Trying query method for vector ${id}`);
      const queryResult = await chromaCollection.query({
        queryEmbeddings: [new Array(1536).fill(0)], // Dummy vector
        nResults: 1,
        where: { id: id }
      });

      if (!queryResult.ids || !queryResult.embeddings || !queryResult.metadatas) {
        console.log(`⚠️ ChromaDB: Query method returned no valid results for vector ${id}`);
        return null;
      }

      const ids = queryResult.ids[0] || [];
      const embeddings = queryResult.embeddings[0] || [];
      const metadatas = queryResult.metadatas[0] || [];

      if (ids.length === 0) {
        console.log(`⚠️ ChromaDB: Query method returned empty results for vector ${id}`);
        return null;
      }

      console.log(`✅ ChromaDB: Found vector ${id} via query method`);
      return {
        id: ids[0] as string,
        values: embeddings[0] as number[],
        metadata: metadatas[0] as Record<string, any>
      };
    } catch (error) {
      console.error(`❌ ChromaDB: Failed to get vector ${id} from collection ${collection}:`, error);
      return null;
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