import { getVectorStoreAdapter } from './adapters/factory';
import { Vector, VectorSearchResult } from './adapters/types';
import { SAMOpportunity, CompanyProfile } from '@/types';
import { getEmbeddingService, EmbeddingConfig } from './embed';

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
   * Add a SAM.gov opportunity to the vector store
   */
  async addOpportunity(opportunity: SAMOpportunity, embeddingConfig?: EmbeddingConfig): Promise<void> {
    try {
      // Create a text representation of the opportunity for embedding
      const opportunityText = [
        opportunity.title || '',
        opportunity.synopsis || '',
        opportunity.type || '',
        opportunity.typeOfSetAsideDescription || '',
        opportunity.naicsCode || '',
        opportunity.classificationCode || '',
        opportunity.placeOfPerformance?.city?.name || '',
        opportunity.placeOfPerformance?.state?.name || '',
        opportunity.pointOfContact?.map(p => p.fullName || '').join(' ') || '',
      ].filter(Boolean).join(' ');

      if (!opportunityText.trim()) {
        console.warn('Skipping opportunity with no text content:', opportunity.id);
        return;
      }

      // Generate proper embedding
      const embeddingService = getEmbeddingService(embeddingConfig);
      const embedding = await embeddingService.getEmbedding(opportunityText);
      
      const vector: Vector = {
        id: opportunity.id || opportunity.noticeId || `opp_${Date.now()}`,
        values: embedding,
        metadata: {
          type: 'opportunity',
          title: opportunity.title,
          synopsis: opportunity.synopsis,
          naicsCode: opportunity.naicsCode,
          state: opportunity.placeOfPerformance?.state?.name,
          city: opportunity.placeOfPerformance?.city?.name,
          setAside: opportunity.typeOfSetAsideDescription,
          responseDeadline: opportunity.responseDeadLine,
          active: opportunity.active,
          uiLink: opportunity.uiLink,
          source: 'sam-gov',
          timestamp: new Date().toISOString()
        }
      };

      await this.storeVectors([vector], 'sam_opportunities');
      console.log(`✅ Added opportunity to vector store: ${opportunity.title}`);
    } catch (error) {
      console.error('❌ Failed to add opportunity to vector store:', error);
      // Don't throw - we don't want to break the main search flow
    }
  },

  /**
   * Add a company profile to the vector store
   */
  async addCompanyProfile(profile: CompanyProfile, embeddingConfig?: EmbeddingConfig): Promise<void> {
    try {
      // Create a comprehensive text representation of the company profile
      const profileText = [
        profile.entityName || '',
        profile.description || '',
        ...(profile.businessTypes || []),
        ...(profile.naicsCodes || []),
        ...(profile.capabilities || []),
        ...(profile.pastPerformance || []),
        ...(profile.certifications || []),
        // Include AI-enhanced data if available
        ...(profile.aiEnhanced ? [
          profile.aiEnhanced.industry,
          profile.aiEnhanced.enhancedDescription,
          profile.aiEnhanced.companySize,
          ...(profile.aiEnhanced.keyProducts || []),
          ...(profile.aiEnhanced.targetMarkets || []),
          ...(profile.aiEnhanced.competitiveAdvantages || []),
          ...(profile.aiEnhanced.technologyStack || []),
          ...(profile.aiEnhanced.partnerships || []),
          ...(profile.aiEnhanced.awards || [])
        ] : []),
        // Include contact info
        profile.contactInfo?.address || '',
        profile.contactInfo?.city || '',
        profile.contactInfo?.state || '',
        profile.contactInfo?.website || ''
      ].filter(Boolean).join(' ');

      if (!profileText.trim()) {
        console.warn('Skipping company profile with no text content:', profile.id);
        return;
      }

      // Generate proper embedding
      const embeddingService = getEmbeddingService(embeddingConfig);
      const embedding = await embeddingService.getEmbedding(profileText);
      
      const vector: Vector = {
        id: `profile_${profile.id}`,
        values: embedding,
        metadata: {
          type: 'entity',
          title: profile.entityName,
          description: profile.description,
          naicsCodes: profile.naicsCodes,
          capabilities: profile.capabilities,
          businessTypes: profile.businessTypes,
          source: 'company-profile',
          timestamp: new Date().toISOString(),
          profileId: profile.id,
          ueiSAM: profile.ueiSAM
        }
      };

      await this.storeVectors([vector], 'company_profiles');
      console.log(`✅ Added company profile to vector store: ${profile.entityName}`);
    } catch (error) {
      console.error('❌ Failed to add company profile to vector store:', error);
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
   * Search for opportunities similar to a company profile
   */
  async findMatchingOpportunities(
    companyProfile: CompanyProfile,
    topK: number = 5,
    embeddingConfig?: EmbeddingConfig
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number }>> {
    try {
      // First, get the company profile vector
      const profileVector = await this.getCompanyProfileVector(companyProfile.id);
      if (!profileVector) {
        console.warn('Company profile not found in vector store');
        return [];
      }

      // Search for similar opportunities
      const results = await this.searchVectors(
        profileVector.values,
        'sam_opportunities',
        topK,
        { type: 'opportunity' }
      );

      // Convert results to opportunity objects (you'll need to fetch full opportunity data)
      const matchingOpportunities = await Promise.all(
        results.map(async (result) => {
          // TODO: Fetch full opportunity data from your data source
          // For now, return the metadata
          return {
            opportunity: {
              id: result.id,
              title: result.metadata?.title || '',
              synopsis: result.metadata?.synopsis || '',
              naicsCode: result.metadata?.naicsCode || '',
              // Add other fields as needed
            } as SAMOpportunity,
            score: result.score
          };
        })
      );

      return matchingOpportunities;
    } catch (error) {
      console.error('❌ Failed to find matching opportunities:', error);
      return [];
    }
  },

  /**
   * Get company profile vector from store
   */
  async getCompanyProfileVector(profileId: string): Promise<Vector | null> {
    try {
      const vectorStore = getVectorStoreAdapter();
      
      // Search for the specific profile
      const results = await vectorStore.query(
        'company_profiles',
        new Array(1536).fill(0), // Dummy vector for exact match
        1,
        { profileId }
      );

      if (results.length > 0) {
        const result = results[0];
        return {
          id: result.id,
          values: result.values || [],
          metadata: result.metadata
        };
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to get company profile vector:', error);
      return null;
    }
  },

  /**
   * Convert text to a simple vector (placeholder implementation)
   * In production, this should use a proper embedding model
   */
  textToSimpleVector(text: string): number[] {
    // Simple hash-based vector generation (placeholder)
    // In production, replace this with actual embedding generation
    const hash = text.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    // Generate a 1536-dimensional vector based on the hash
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < 1536; i++) {
      vector[i] = Math.sin(hash + i) * 0.1; // Simple deterministic "random" values
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