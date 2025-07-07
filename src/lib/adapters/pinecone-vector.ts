import { Pinecone } from '@pinecone-database/pinecone';
import { VectorStoreAdapter, Vector, VectorSearchResult } from './types';

export class PineconeVectorAdapter implements VectorStoreAdapter {
  private client: Pinecone;
  private index: any; // Pinecone index
  private readonly DEFAULT_DIMENSION = 1536;

  constructor(config: { apiKey: string; environment: string; projectId?: string }) {
    if (!config.apiKey || !config.environment) {
      throw new Error('Pinecone requires API key and environment');
    }

    this.client = new Pinecone({
      apiKey: config.apiKey,
    });

    console.log('✅ Pinecone client initialized');
  }

  async createCollection(collection: string, dimension: number = 1536): Promise<void> {
    try {
      // In Pinecone, collections are called indexes
      const indexName = collection;
      
      // Check if index already exists
      const indexes = await this.client.listIndexes();
      const indexExists = indexes.indexes?.some((index: any) => index.name === indexName) || false;
      
      if (indexExists) {
        console.log(`✅ Pinecone index already exists: ${indexName}`);
        return;
      }

      await this.client.createIndex({
        name: indexName,
        dimension: dimension,
        metric: 'cosine',
        spec: {
          serverless: {
            cloud: 'aws',
            region: 'us-east-1'
          }
        }
      });

      console.log(`✅ Created Pinecone index: ${indexName}`);
    } catch (error) {
      console.error(`❌ Failed to create Pinecone index ${collection}:`, error);
      throw error;
    }
  }

  private async getIndex(collection: string) {
    if (!this.index || this.index.name !== collection) {
      this.index = this.client.index(collection);
    }
    return this.index;
  }

  async upsert(collection: string, vectors: Vector[], metadata?: Record<string, any>): Promise<void> {
    try {
      const index = await this.getIndex(collection);
      
      const upsertRequest = vectors.map(vector => ({
        id: vector.id,
        values: vector.values,
        metadata: { ...vector.metadata, ...metadata }
      }));

      await index.upsert(upsertRequest);
      console.log(`✅ Upserted ${vectors.length} vectors to index: ${collection}`);
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
      const index = await this.getIndex(collection);
      
      const queryRequest: any = {
        vector,
        topK,
        includeMetadata: true,
        includeValues: true
      };

      if (filter) {
        queryRequest.filter = filter;
      }

      const queryResponse = await index.query(queryRequest);
      
      const results: VectorSearchResult[] = queryResponse.matches?.map((match: any) => ({
        id: match.id,
        score: match.score || 0,
        metadata: match.metadata || {},
        values: match.values || []
      })) || [];

      console.log(`✅ Queried ${results.length} results from index: ${collection}`);
      return results;
    } catch (error) {
      console.error(`❌ Failed to query index ${collection}:`, error);
      throw error;
    }
  }

  async getVector(collection: string, id: string): Promise<Vector | null> {
    try {
      const index = await this.getIndex(collection);
      
      // Fetch the specific vector by ID
      const fetchResponse = await index.fetch([id]);
      
      if (!fetchResponse.vectors || !fetchResponse.vectors[id]) {
        return null;
      }

      const vectorData = fetchResponse.vectors[id];
      
      return {
        id: vectorData.id,
        values: vectorData.values || [],
        metadata: vectorData.metadata || {}
      };
    } catch (error) {
      console.error(`❌ Failed to get vector ${id} from index ${collection}:`, error);
      return null;
    }
  }

  async delete(collection: string, ids?: string[]): Promise<void> {
    try {
      const index = await this.getIndex(collection);
      
      if (ids && ids.length > 0) {
        await index.deleteMany(ids);
        console.log(`✅ Deleted ${ids.length} vectors from index: ${collection}`);
      } else {
        // Delete all vectors in index
        await index.deleteAll();
        console.log(`✅ Deleted all vectors from index: ${collection}`);
      }
    } catch (error) {
      console.error(`❌ Failed to delete from index ${collection}:`, error);
      throw error;
    }
  }

  async listCollections(): Promise<string[]> {
    try {
      const indexes = await this.client.listIndexes();
      return indexes.indexes?.map((index: any) => index.name) || [];
    } catch (error) {
      console.error('❌ Failed to list indexes:', error);
      return [];
    }
  }

  async deleteCollection(collection: string): Promise<void> {
    try {
      await this.client.deleteIndex(collection);
      console.log(`✅ Deleted index: ${collection}`);
    } catch (error) {
      console.error(`❌ Failed to delete index ${collection}:`, error);
      throw error;
    }
  }

  async isConnected(): Promise<boolean> {
    try {
      // Test connection by listing indexes
      await this.client.listIndexes();
      return true;
    } catch (error) {
      return false;
    }
  }
} 