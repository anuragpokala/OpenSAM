import { ChromaClient, Collection } from 'chromadb';
import { VectorStoreAdapter, Vector, VectorSearchResult } from './types';

export class ChromaVectorAdapter implements VectorStoreAdapter {
  private client: ChromaClient;
  private collections: Map<string, Collection> = new Map();

  constructor(config: { url?: string }) {
    const url = config.url || 'http://localhost:8000';
    this.client = new ChromaClient({ path: url });
    console.log('✅ ChromaDB client initialized');
  }

  async createCollection(collection: string, dimension: number = 1536): Promise<void> {
    try {
      if (this.collections.has(collection)) {
        return; // Collection already exists
      }

      const chromaCollection = await this.client.createCollection({
        name: collection,
        metadata: {
          dimension: dimension.toString(),
          description: `Collection for ${collection} vectors`
        }
      });

      this.collections.set(collection, chromaCollection);
      console.log(`✅ Created ChromaDB collection: ${collection}`);
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
      
      const queryResult = await chromaCollection.query({
        queryEmbeddings: [vector],
        nResults: topK,
        where: filter
      });

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
      await this.client.heartbeat();
      return true;
    } catch (error) {
      return false;
    }
  }
} 