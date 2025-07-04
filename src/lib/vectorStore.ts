import { getVectorStoreAdapter } from './adapters/factory';
import { Vector, VectorSearchResult } from './adapters/types';

// Vector store configuration
const DEFAULT_COLLECTION = 'opportunities';
const DEFAULT_DIMENSION = 1536;

/**
 * Vector store utilities using adapter pattern
 */
export const vectorStoreUtils = {
  /**
   * Store vectors in the vector database
   */
  async storeVectors(
    vectors: Vector[], 
    collection: string = DEFAULT_COLLECTION,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const vectorStore = getVectorStoreAdapter();
      
      // Ensure collection exists
      await vectorStore.createCollection(collection, DEFAULT_DIMENSION);
      
      // Store vectors
      await vectorStore.upsert(collection, vectors, metadata);
      
      console.log(`✅ Stored ${vectors.length} vectors in collection: ${collection}`);
    } catch (error) {
      console.error('❌ Failed to store vectors:', error);
      throw error;
    }
  },

  /**
   * Search for similar vectors
   */
  async searchVectors(
    queryVector: number[],
    collection: string = DEFAULT_COLLECTION,
    topK: number = 10,
    filter?: Record<string, any>
  ): Promise<VectorSearchResult[]> {
    try {
      const vectorStore = getVectorStoreAdapter();
      
      const results = await vectorStore.query(collection, queryVector, topK, filter);
      
      console.log(`✅ Found ${results.length} similar vectors in collection: ${collection}`);
      return results;
    } catch (error) {
      console.error('❌ Failed to search vectors:', error);
      throw error;
    }
  },

  /**
   * Delete vectors from collection
   */
  async deleteVectors(
    collection: string = DEFAULT_COLLECTION,
    ids?: string[]
  ): Promise<void> {
    try {
      const vectorStore = getVectorStoreAdapter();
      await vectorStore.delete(collection, ids);
      
      const action = ids ? `deleted ${ids.length} vectors` : 'deleted all vectors';
      console.log(`✅ ${action} from collection: ${collection}`);
    } catch (error) {
      console.error('❌ Failed to delete vectors:', error);
      throw error;
    }
  },

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    try {
      const vectorStore = getVectorStoreAdapter();
      return await vectorStore.listCollections();
    } catch (error) {
      console.error('❌ Failed to list collections:', error);
      return [];
    }
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collection: string): Promise<void> {
    try {
      const vectorStore = getVectorStoreAdapter();
      await vectorStore.deleteCollection(collection);
      console.log(`✅ Deleted collection: ${collection}`);
    } catch (error) {
      console.error('❌ Failed to delete collection:', error);
      throw error;
    }
  },

  /**
   * Check if vector store is connected
   */
  async isConnected(): Promise<boolean> {
    try {
      const vectorStore = getVectorStoreAdapter();
      return await vectorStore.isConnected();
    } catch (error) {
      return false;
    }
  },

  /**
   * Get vector store statistics
   */
  async getStats(): Promise<{
    collections: string[];
    connected: boolean;
  }> {
    try {
      const vectorStore = getVectorStoreAdapter();
      const collections = await vectorStore.listCollections();
      const connected = await vectorStore.isConnected();
      
      return {
        collections,
        connected
      };
    } catch (error) {
      console.error('❌ Failed to get vector store stats:', error);
      return {
        collections: [],
        connected: false
      };
    }
  }
};

/**
 * Helper function to normalize vector dimensions
 */
export function normalizeVector(vector: number[], targetDimension: number = DEFAULT_DIMENSION): number[] {
  if (vector.length === targetDimension) {
    return vector;
  }
  
  if (vector.length > targetDimension) {
    // Truncate to target dimension
    return vector.slice(0, targetDimension);
  }
  
  // Pad with zeros to target dimension
  const padded = [...vector];
  while (padded.length < targetDimension) {
    padded.push(0);
  }
  
  return padded;
}

/**
 * Helper function to create vector objects
 */
export function createVector(
  id: string, 
  values: number[], 
  metadata?: Record<string, any>
): Vector {
  return {
    id,
    values: normalizeVector(values),
    metadata
  };
} 