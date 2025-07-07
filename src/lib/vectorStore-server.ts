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
      console.log(`🚀 Adding company profile to vector store: ${profile.entityName} (ID: ${profile.id})`);
      
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

      console.log(`📝 Profile text length: ${profileText.length} characters`);
      console.log(`📝 Profile text preview: ${profileText.substring(0, 200)}...`);

      if (!profileText.trim()) {
        console.warn('⚠️ Skipping company profile with no text content:', profile.id);
        return;
      }

      // Generate proper embedding
      console.log(`🧠 Generating embedding for profile...`);
      const embeddingService = getEmbeddingService(embeddingConfig);
      const embedding = await embeddingService.getEmbedding(profileText);
      console.log(`✅ Generated embedding with ${embedding.length} dimensions`);
      
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

      console.log(`💾 Storing vector with ID: ${vector.id}`);
      console.log(`📋 Vector metadata:`, vector.metadata);
      
      await this.storeVectors([vector], 'company_profiles');
      console.log(`✅ Successfully added company profile to vector store: ${profile.entityName}`);
      
      // Verify it was stored
      const storedVector = await this.getCompanyProfileVector(profile.id);
      if (storedVector) {
        console.log(`✅ Verification: Company profile found in vector store after storage`);
      } else {
        console.warn(`⚠️ Verification failed: Company profile not found in vector store after storage`);
      }
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
      console.log(`🔍 Finding matching opportunities for company: ${companyProfile.entityName} (ID: ${companyProfile.id})`);
      
      // First, get the company profile vector
      const profileVector = await this.getCompanyProfileVector(companyProfile.id);
      if (!profileVector) {
        console.warn('❌ Company profile not found in vector store');
        console.log(`🔍 Available collections:`, await this.listCollections());
        return [];
      }

      console.log(`✅ Found company profile vector, searching for similar opportunities...`);
      
      // Search for similar opportunities
      const results = await this.searchVectors(
        profileVector.values,
        'sam_opportunities',
        topK,
        { type: 'opportunity' }
      );

      console.log(`🔍 Found ${results.length} matching opportunities`);

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

      console.log(`✅ Returning ${matchingOpportunities.length} matching opportunities`);
      return matchingOpportunities;
    } catch (error) {
      console.error('❌ Failed to find matching opportunities:', error);
      return [];
    }
  },

  /**
   * Calculate match score between company profile and specific opportunity
   */
  async calculateOpportunityMatch(
    companyProfile: CompanyProfile,
    opportunityId: string,
    embeddingConfig?: EmbeddingConfig
  ): Promise<number> {
    try {
      // Get the company profile vector
      const profileVector = await this.getCompanyProfileVector(companyProfile.id);
      if (!profileVector) {
        console.warn('Company profile not found in vector store');
        return 0;
      }

      // Get the opportunity vector
      const vectorStore = await getVectorStoreAdapter();
      const opportunityVector = await vectorStore.getVector('sam_opportunities', opportunityId);
      
      if (!opportunityVector) {
        console.warn('Opportunity not found in vector store');
        return 0;
      }

      // Calculate cosine similarity
      const similarity = this.cosineSimilarity(profileVector.values, opportunityVector.values);
      
      console.log(`✅ Calculated match score for opportunity ${opportunityId}: ${similarity}`);
      return similarity;
    } catch (error) {
      console.error('❌ Failed to calculate opportunity match:', error);
      return 0;
    }
  },

  /**
   * Get a specific company profile vector
   */
  async getCompanyProfileVector(profileId: string): Promise<Vector | null> {
    try {
      console.log(`🔍 Looking for company profile vector with profileId: ${profileId}`);
      const vectorStore = await getVectorStoreAdapter();
      
      // First try to get the vector directly by ID
      console.log(`🔍 Trying direct vector lookup with ID: profile_${profileId}`);
      const directVector = await vectorStore.getVector('company_profiles', `profile_${profileId}`);
      if (directVector) {
        console.log(`✅ Found company profile vector directly: ${directVector.id}`);
        console.log(`📋 Vector metadata:`, directVector.metadata);
        return directVector;
      }
      
      console.log(`⚠️ Direct lookup failed, trying query with metadata filter...`);
      // Fallback: Search for the specific profile using metadata filter
      const results = await vectorStore.query(
        'company_profiles',
        new Array(1536).fill(0), // Dummy vector for exact match
        1,
        { profileId }
      );

      console.log(`🔍 Query returned ${results.length} results`);
      if (results.length > 0) {
        const result = results[0];
        console.log(`✅ Found company profile vector via query: ${result.id}`);
        console.log(`📋 Vector metadata:`, result.metadata);
        return {
          id: result.id,
          values: result.values || [],
          metadata: result.metadata
        };
      }

      console.warn(`❌ Company profile vector not found for profileId: ${profileId}`);
      console.log(`🔍 Available collections:`, await vectorStore.listCollections());
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
  },

  /**
   * Calculate cosine similarity between two vectors
   */
  cosineSimilarity(vectorA: number[], vectorB: number[]): number {
    if (vectorA.length !== vectorB.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < vectorA.length; i++) {
      dotProduct += vectorA[i] * vectorB[i];
      normA += vectorA[i] * vectorA[i];
      normB += vectorB[i] * vectorB[i];
    }

    normA = Math.sqrt(normA);
    normB = Math.sqrt(normB);

    if (normA === 0 || normB === 0) {
      return 0;
    }

    return dotProduct / (normA * normB);
  }
}; 