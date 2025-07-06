/**
 * Unit tests for vector store functionality
 * Tests opportunity and company profile vectorization and matching
 */

import { vectorStoreUtils } from '@/lib/vectorStore';
import { getEmbeddingService } from '@/lib/embed';
import { getVectorStoreAdapter } from '@/lib/adapters/factory';
import { SAMOpportunity, CompanyProfile } from '@/types';

// Mock data for testing
const mockOpportunities: SAMOpportunity[] = [
  {
    id: 'test-opp-1',
    noticeId: 'test-opp-1',
    title: 'AI Software Development Services',
    description: 'Development of artificial intelligence software for government applications',
    synopsis: 'Development of artificial intelligence software for government applications',
    type: 'Solicitation',
    baseType: 'Solicitation',
    archiveType: 'Active',
    archiveDate: '',
    naicsCode: '541511',
    naicsDescription: 'Custom Computer Programming Services',
    classificationCode: 'D',
    active: true,
    responseDeadLine: '2024-12-31',
    placeOfPerformance: {
      streetAddress: '123 Main St',
      state: { code: 'VA', name: 'Virginia' },
      city: { code: 'ARL', name: 'Arlington' },
      zip: '22201',
      country: { code: 'US', name: 'United States' }
    },
    typeOfSetAsideDescription: 'Small Business Set-Aside',
    typeOfSetAside: 'Small Business Set-Aside',
    organizationType: 'Federal Agency',
    uiLink: 'https://sam.gov/opp/test-1'
  },
  {
    id: 'test-opp-2',
    noticeId: 'test-opp-2',
    title: 'Cybersecurity Infrastructure Support',
    description: 'Cybersecurity infrastructure and support services for federal agencies',
    synopsis: 'Cybersecurity infrastructure and support services for federal agencies',
    type: 'Solicitation',
    baseType: 'Solicitation',
    archiveType: 'Active',
    archiveDate: '',
    naicsCode: '541519',
    naicsDescription: 'Other Computer Related Services',
    classificationCode: 'D',
    active: true,
    responseDeadLine: '2024-11-30',
    placeOfPerformance: {
      streetAddress: '456 Security Blvd',
      state: { code: 'MD', name: 'Maryland' },
      city: { code: 'BETH', name: 'Bethesda' },
      zip: '20814',
      country: { code: 'US', name: 'United States' }
    },
    typeOfSetAsideDescription: '8(a) Set-Aside',
    typeOfSetAside: '8(a) Set-Aside',
    organizationType: 'Federal Agency',
    uiLink: 'https://sam.gov/opp/test-2'
  },
  {
    id: 'test-opp-3',
    noticeId: 'test-opp-3',
    title: 'Cloud Migration and DevOps Services',
    description: 'Cloud migration and DevOps services for government systems',
    synopsis: 'Cloud migration and DevOps services for government systems',
    type: 'Solicitation',
    baseType: 'Solicitation',
    archiveType: 'Active',
    archiveDate: '',
    naicsCode: '541511',
    naicsDescription: 'Custom Computer Programming Services',
    classificationCode: 'D',
    active: true,
    responseDeadLine: '2024-10-31',
    placeOfPerformance: {
      streetAddress: '789 Cloud Ave',
      state: { code: 'DC', name: 'District of Columbia' },
      city: { code: 'WASH', name: 'Washington' },
      zip: '20001',
      country: { code: 'US', name: 'United States' }
    },
    typeOfSetAsideDescription: 'Full and Open',
    typeOfSetAside: 'Full and Open',
    organizationType: 'Federal Agency',
    uiLink: 'https://sam.gov/opp/test-3'
  }
];

const mockCompanyProfile: CompanyProfile = {
  id: 'test-company-1',
  ueiSAM: 'TEST123456789',
  entityName: 'TechCorp Solutions',
  description: 'Leading provider of AI and cybersecurity solutions for government and commercial clients',
  businessTypes: ['Small Business', '8(a) Program'],
  naicsCodes: ['541511', '541519', '541512'],
  capabilities: [
    'Artificial Intelligence Development',
    'Cybersecurity Services',
    'Cloud Migration',
    'DevOps Implementation',
    'Machine Learning Solutions'
  ],
  pastPerformance: [
    'Successfully delivered AI-powered analytics platform for DoD',
    'Implemented zero-trust cybersecurity framework for federal agency',
    'Migrated legacy systems to AWS GovCloud'
  ],
  certifications: ['CMMI Level 3', 'ISO 27001', 'FedRAMP Authorized'],
  contactInfo: {
    address: '123 Tech Street',
    city: 'Arlington',
    state: 'VA',
    zipCode: '22201',
    phone: '555-123-4567',
    email: 'contact@techcorp.com',
    website: 'https://techcorp.com'
  },
  aiEnhanced: {
    industry: 'Technology Services',
    companySize: 'Small Business',
    foundingYear: 2018,
    revenue: '$5M - $10M',
    employeeCount: '25-50',
    enhancedDescription: 'TechCorp Solutions is a rapidly growing technology company specializing in AI, cybersecurity, and cloud services.',
    keyProducts: ['AI Analytics Platform', 'Cybersecurity Framework', 'Cloud Migration Toolkit'],
    targetMarkets: ['Federal Government', 'Defense', 'Healthcare', 'Financial Services'],
    competitiveAdvantages: ['8(a) Certification', 'AI Expertise', 'Security Clearances', 'Proven Track Record'],
    technologyStack: ['Python', 'AWS', 'Azure', 'TensorFlow', 'Kubernetes'],
    partnerships: ['AWS Partner', 'Microsoft Partner', 'Google Cloud Partner'],
    awards: ['SBA 8(a) Business of the Year', 'FedRAMP Innovation Award'],
    lastEnhanced: Date.now()
  },
  createdAt: Date.now(),
  updatedAt: Date.now()
};

describe('Vector Store Integration Tests', () => {
  beforeAll(async () => {
    // Check if vector store is connected
    const stats = await vectorStoreUtils.getStats();
    if (!stats.connected) {
      throw new Error('Vector store not connected. Please ensure ChromaDB is running.');
    }
  });

  describe('Opportunity Vectorization', () => {
    test('should vectorize and store opportunities', async () => {
      // Add opportunities to vector store
      for (const opportunity of mockOpportunities) {
        await vectorStoreUtils.addOpportunity(opportunity);
      }

      // Verify opportunities are stored
      const stats = await vectorStoreUtils.getStats();
      expect(stats.collections).toContain('sam_opportunities');
    }, 30000); // 30 second timeout for embedding generation

    test('should find opportunities by text query', async () => {
      const query = 'AI software development';
      const embeddingService = getEmbeddingService();
      const queryVector = await embeddingService.getEmbedding(query);
      
      const results = await vectorStoreUtils.searchVectors(
        queryVector,
        'sam_opportunities',
        3,
        { type: 'opportunity' }
      );

      expect(results.length).toBeGreaterThan(0);
      expect(results[0].metadata?.type).toBe('opportunity');
    }, 15000);
  });

  describe('Company Profile Vectorization', () => {
    test('should vectorize and store company profile', async () => {
      await vectorStoreUtils.addCompanyProfile(mockCompanyProfile);

      // Verify profile is stored
      const stats = await vectorStoreUtils.getStats();
      expect(stats.collections).toContain('company_profiles');
    }, 15000);

    test('should find matching opportunities for company profile', async () => {
      const results = await vectorStoreUtils.findMatchingOpportunities(mockCompanyProfile, 3);
      
      expect(results.length).toBeGreaterThan(0);
      expect(results[0]).toHaveProperty('opportunity');
      expect(results[0]).toHaveProperty('score');
    }, 15000);
  });

  describe('Similarity Matching', () => {
    test('should return highest similarity for AI-related opportunity when querying AI company', async () => {
      // Query for AI-related opportunities
      const query = 'artificial intelligence development';
      const embeddingService = getEmbeddingService();
      const queryVector = await embeddingService.getEmbedding(query);
      
      const results = await vectorStoreUtils.searchVectors(
        queryVector,
        'sam_opportunities',
        3,
        { type: 'opportunity' }
      );

      // The AI opportunity should be ranked highest
      const aiOpportunity = results.find(r => 
        r.metadata?.title?.toLowerCase().includes('ai') ||
        r.metadata?.synopsis?.toLowerCase().includes('artificial intelligence')
      );

      expect(aiOpportunity).toBeDefined();
      if (aiOpportunity && results.length > 1) {
        // AI opportunity should have higher score than non-AI opportunities
        const nonAiOpportunities = results.filter(r => 
          !r.metadata?.title?.toLowerCase().includes('ai') &&
          !r.metadata?.synopsis?.toLowerCase().includes('artificial intelligence')
        );
        
        if (nonAiOpportunities.length > 0) {
          expect(aiOpportunity.score).toBeGreaterThanOrEqual(nonAiOpportunities[0].score);
        }
      }
    }, 15000);

    test('should match company capabilities with relevant opportunities', async () => {
      const results = await vectorStoreUtils.findMatchingOpportunities(mockCompanyProfile, 3);
      
      // Company has AI and cybersecurity capabilities, so should match those opportunities
      const hasAiMatch = results.some(r => 
        r.opportunity.title.toLowerCase().includes('ai') ||
        r.opportunity.synopsis.toLowerCase().includes('artificial intelligence')
      );
      
      const hasCybersecurityMatch = results.some(r => 
        r.opportunity.title.toLowerCase().includes('cybersecurity') ||
        r.opportunity.synopsis.toLowerCase().includes('cybersecurity')
      );

      expect(hasAiMatch || hasCybersecurityMatch).toBe(true);
    }, 15000);
  });

  describe('Embedding Service', () => {
    test('should generate consistent embeddings for same text', async () => {
      const embeddingService = getEmbeddingService();
      const text = 'AI software development services';
      
      const embedding1 = await embeddingService.getEmbedding(text);
      const embedding2 = await embeddingService.getEmbedding(text);
      
      expect(embedding1).toEqual(embedding2);
      expect(embedding1.length).toBe(1536); // OpenAI text-embedding-3-small dimension
    }, 10000);

    test('should generate different embeddings for different text', async () => {
      const embeddingService = getEmbeddingService();
      
      const embedding1 = await embeddingService.getEmbedding('AI software development');
      const embedding2 = await embeddingService.getEmbedding('Cybersecurity services');
      
      expect(embedding1).not.toEqual(embedding2);
    }, 10000);
  });

  afterAll(async () => {
    // Clean up test data
    try {
      const vectorStore = getVectorStoreAdapter();
      await vectorStore.deleteCollection('sam_opportunities');
      await vectorStore.deleteCollection('company_profiles');
    } catch (error) {
      console.warn('Failed to clean up test data:', error);
    }
  });
}); 