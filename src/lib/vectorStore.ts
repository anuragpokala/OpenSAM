import { Vector, VectorSearchResult } from './adapters/types';
import { SAMOpportunity, CompanyProfile } from '@/types';
import { getEmbeddingService, EmbeddingConfig } from './embed';

// Vector store configuration
const DEFAULT_COLLECTION = 'opportunities';
const DEFAULT_DIMENSION = 1536;

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Vector store utilities - Browser-safe version
 * All vector store operations are handled via API calls in the browser
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
    if (isBrowser) {
      console.warn('⚠️ Vector storage not available in browser');
      return;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Vector storage not implemented in server-side fallback');
  },

  /**
   * Add a SAM.gov opportunity to the vector store
   */
  async addOpportunity(opportunity: SAMOpportunity, embeddingConfig?: EmbeddingConfig): Promise<void> {
    if (isBrowser) {
      console.warn('⚠️ Adding opportunities to vector store not available in browser');
      return;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Adding opportunities not implemented in server-side fallback');
  },

  /**
   * Add a company profile to the vector store
   */
  async addCompanyProfile(profile: CompanyProfile, embeddingConfig?: EmbeddingConfig): Promise<void> {
    if (isBrowser) {
      console.warn('⚠️ Adding company profiles to vector store not available in browser');
      return;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Adding company profiles not implemented in server-side fallback');
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
    if (isBrowser) {
      console.warn('⚠️ Vector search not available in browser');
      return [];
    }

    // Server-side implementation would go here
    console.warn('⚠️ Vector search not implemented in server-side fallback');
    return [];
  },

  /**
   * Search for opportunities similar to a company profile
   */
  async findMatchingOpportunities(
    companyProfile: CompanyProfile,
    topK: number = 5,
    embeddingConfig?: EmbeddingConfig
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number }>> {
    if (isBrowser) {
      console.warn('⚠️ Finding matching opportunities not available in browser');
      return [];
    }

    // Server-side implementation would go here
    console.warn('⚠️ Finding matching opportunities not implemented in server-side fallback');
    return [];
  },

  /**
   * Get a specific company profile vector
   */
  async getCompanyProfileVector(profileId: string): Promise<Vector | null> {
    if (isBrowser) {
      console.warn('⚠️ Getting company profile vector not available in browser');
      return null;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Getting company profile vector not implemented in server-side fallback');
    return null;
  },

  /**
   * Simple text-to-vector conversion (for testing)
   */
  textToSimpleVector(text: string): number[] {
    // Simple hash-based vector for testing
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    const vector = new Array(DEFAULT_DIMENSION).fill(0);
    for (let i = 0; i < Math.min(DEFAULT_DIMENSION, 10); i++) {
      vector[i] = Math.sin(hash + i) * 0.1;
    }
    return vector;
  },

  /**
   * Delete vectors from collection
   */
  async deleteVectors(
    collection: string = DEFAULT_COLLECTION,
    ids?: string[]
  ): Promise<void> {
    if (isBrowser) {
      console.warn('⚠️ Deleting vectors not available in browser');
      return;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Deleting vectors not implemented in server-side fallback');
  },

  /**
   * List all collections
   */
  async listCollections(): Promise<string[]> {
    if (isBrowser) {
      console.warn('⚠️ Listing collections not available in browser');
      return [];
    }

    // Server-side implementation would go here
    console.warn('⚠️ Listing collections not implemented in server-side fallback');
    return [];
  },

  /**
   * Delete a collection
   */
  async deleteCollection(collection: string): Promise<void> {
    if (isBrowser) {
      console.warn('⚠️ Deleting collection not available in browser');
      return;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Deleting collection not implemented in server-side fallback');
  },

  /**
   * Check if vector store is connected
   */
  async isConnected(): Promise<boolean> {
    if (isBrowser) {
      console.warn('⚠️ Checking connection not available in browser');
      return false;
    }

    // Server-side implementation would go here
    console.warn('⚠️ Checking connection not implemented in server-side fallback');
    return false;
  },

  /**
   * Get vector store statistics
   */
  async getStats(): Promise<{
    collections: string[];
    connected: boolean;
  }> {
    if (isBrowser) {
      console.warn('⚠️ Getting stats not available in browser');
      return {
        collections: [],
        connected: false
      };
    }

    // Server-side implementation would go here
    console.warn('⚠️ Getting stats not implemented in server-side fallback');
    return {
      collections: [],
      connected: false
    };
  }
};

/**
 * Normalize vector to target dimension
 */
export function normalizeVector(vector: number[], targetDimension: number = DEFAULT_DIMENSION): number[] {
  if (vector.length === targetDimension) {
    return vector;
  }
  
  if (vector.length > targetDimension) {
    return vector.slice(0, targetDimension);
  }
  
  // Pad with zeros if shorter
  const normalized = [...vector];
  while (normalized.length < targetDimension) {
    normalized.push(0);
  }
  return normalized;
}

/**
 * Create a vector object
 */
export function createVector(
  id: string, 
  values: number[], 
  metadata?: Record<string, any>
): Vector {
  return {
    id,
    values: normalizeVector(values),
    metadata: metadata || {}
  };
} 