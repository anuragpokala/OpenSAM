import { Vector, VectorSearchResult } from './adapters/types';
import { SAMOpportunity, CompanyProfile } from '@/types';
import { getEmbeddingService, EmbeddingConfig } from './embed';

// Vector store configuration
const DEFAULT_COLLECTION = 'opportunities';
const DEFAULT_DIMENSION = 1536;

// Server-side only imports
let vectorStoreAdapter: any = null;

async function getVectorStoreAdapter() {
  if (!vectorStoreAdapter) {
    const { getVectorStoreAdapter: getAdapter } = await import('./adapters/factory');
    vectorStoreAdapter = getAdapter();
  }
  return vectorStoreAdapter;
}

/**
 * Server-side vector store utilities
 * This module should only be used in API routes and server-side code
 */
export const vectorStoreServerUtils = {
  /**
   * Store vectors in the vector database
   */
  async storeVectors(
    vectors: Vector[], 
    collection: string = DEFAULT_COLLECTION,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const vectorStore = await getVectorStoreAdapter();
      
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
          title: profile.entityName || '',
          description: profile.description || '',
          naicsCodes: (profile.naicsCodes || []).join(', '),
          capabilities: (profile.capabilities || []).join(', '),
          businessTypes: (profile.businessTypes || []).join(', '),
          source: 'company-profile',
          timestamp: new Date().toISOString(),
          profileId: profile.id,
          ueiSAM: profile.ueiSAM || ''
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
      const vectorStore = await getVectorStoreAdapter();
      
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

      // Convert results to opportunity objects
      const matchingOpportunities = results.map(result => ({
        opportunity: {
          id: result.id,
          noticeId: result.id,
          title: result.metadata?.title || '',
          description: result.metadata?.synopsis || '',
          synopsis: result.metadata?.synopsis || '',
          type: result.metadata?.type || '',
          baseType: result.metadata?.type || '',
          archiveType: 'Active',
          archiveDate: '',
          naicsCode: result.metadata?.naicsCode || '',
          naicsDescription: '',
          classificationCode: '',
          active: result.metadata?.active || false,
          responseDeadLine: result.metadata?.responseDeadline || '',
          typeOfSetAsideDescription: result.metadata?.setAside || '',
          typeOfSetAside: result.metadata?.setAside || '',
          organizationType: '',
          uiLink: result.metadata?.uiLink || '',
          placeOfPerformance: {
            streetAddress: '',
            city: { code: result.metadata?.city || '', name: result.metadata?.city || '' },
            state: { code: result.metadata?.state || '', name: result.metadata?.state || '' },
            zip: '',
            country: { code: 'US', name: 'United States' }
          }
        } as SAMOpportunity,
        score: result.score
      }));

      return matchingOpportunities;
    } catch (error) {
      console.error('❌ Failed to find matching opportunities:', error);
      return [];
    }
  },

  /**
   * Get a specific company profile vector
   */
  async getCompanyProfileVector(profileId: string): Promise<Vector | null> {
    try {
      const vectorStore = await getVectorStoreAdapter();
      
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
   * Delete vectors from collection
   */
  async deleteVectors(
    collection: string = DEFAULT_COLLECTION,
    ids?: string[]
  ): Promise<void> {
    try {
      const vectorStore = await getVectorStoreAdapter();
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
      const vectorStore = await getVectorStoreAdapter();
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
      const vectorStore = await getVectorStoreAdapter();
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
      const vectorStore = await getVectorStoreAdapter();
      return await vectorStore.isConnected();
    } catch (error) {
      console.error('❌ Failed to check connection:', error);
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
      const vectorStore = await getVectorStoreAdapter();
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
  }
}; 