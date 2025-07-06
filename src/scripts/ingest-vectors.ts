/**
 * Script to ingest SAM.gov opportunities and company profiles into vector store
 * Usage: npm run ingest-vectors
 */

import { vectorStoreUtils } from '@/lib/vectorStore';
import { getEmbeddingService } from '@/lib/embed';
import { SAMOpportunity, CompanyProfile } from '@/types';

interface IngestOptions {
  opportunities?: SAMOpportunity[];
  companyProfile?: CompanyProfile;
  embeddingConfig?: {
    provider: 'openai' | 'local';
    apiKey?: string;
    model?: string;
  };
}

/**
 * Ingest opportunities into vector store
 */
async function ingestOpportunities(
  opportunities: SAMOpportunity[], 
  embeddingConfig?: any
): Promise<void> {
  console.log(`🔄 Ingesting ${opportunities.length} opportunities...`);
  
  const embeddingService = getEmbeddingService(embeddingConfig);
  
  for (let i = 0; i < opportunities.length; i++) {
    const opportunity = opportunities[i];
    
    try {
      // Create text representation
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
        console.warn(`⚠️ Skipping opportunity ${opportunity.id} - no text content`);
        continue;
      }

      // Generate embedding
      const embedding = await embeddingService.getEmbedding(opportunityText);
      
      // Create vector
      const vector = {
        id: opportunity.id || opportunity.noticeId || `opp_${Date.now()}_${i}`,
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

      // Store in vector database
      await vectorStoreUtils.storeVectors([vector], 'sam_opportunities');
      
      console.log(`✅ Ingested opportunity: ${opportunity.title?.substring(0, 50)}...`);
      
      // Rate limiting to avoid overwhelming the embedding API
      if (i < opportunities.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
    } catch (error) {
      console.error(`❌ Failed to ingest opportunity ${opportunity.id}:`, error);
    }
  }
  
  console.log(`✅ Completed ingesting ${opportunities.length} opportunities`);
}

/**
 * Ingest company profile into vector store
 */
async function ingestCompanyProfile(
  profile: CompanyProfile, 
  embeddingConfig?: any
): Promise<void> {
  console.log(`🔄 Ingesting company profile: ${profile.entityName}...`);
  
  try {
    await vectorStoreUtils.addCompanyProfile(profile, embeddingConfig);
    console.log(`✅ Successfully ingested company profile: ${profile.entityName}`);
  } catch (error) {
    console.error(`❌ Failed to ingest company profile:`, error);
    throw error;
  }
}

/**
 * Main ingestion function
 */
export async function ingestVectors(options: IngestOptions): Promise<void> {
  console.log('🚀 Starting vector ingestion...');
  
  try {
    // Check vector store connection
    const stats = await vectorStoreUtils.getStats();
    if (!stats.connected) {
      throw new Error('Vector store not connected');
    }
    
    console.log(`✅ Connected to vector store. Collections: ${stats.collections.join(', ')}`);
    
    // Ingest opportunities if provided
    if (options.opportunities && options.opportunities.length > 0) {
      await ingestOpportunities(options.opportunities, options.embeddingConfig);
    }
    
    // Ingest company profile if provided
    if (options.companyProfile) {
      await ingestCompanyProfile(options.companyProfile, options.embeddingConfig);
    }
    
    console.log('🎉 Vector ingestion completed successfully!');
    
  } catch (error) {
    console.error('❌ Vector ingestion failed:', error);
    throw error;
  }
}

/**
 * Test function with sample data
 */
export async function testIngestion(): Promise<void> {
  console.log('🧪 Running test ingestion...');
  
  // Sample opportunities
  const sampleOpportunities: SAMOpportunity[] = [
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
  
  // Sample company profile
  const sampleProfile: CompanyProfile = {
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
      enhancedDescription: 'TechCorp Solutions is a rapidly growing technology company specializing in AI, cybersecurity, and cloud services. We have successfully delivered innovative solutions to government agencies and commercial clients.',
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
  
  await ingestVectors({
    opportunities: sampleOpportunities,
    companyProfile: sampleProfile,
    embeddingConfig: {
      provider: 'openai',
      model: 'text-embedding-3-small'
    }
  });
  
  console.log('✅ Test ingestion completed!');
}

// Export for use in other scripts
export { ingestOpportunities, ingestCompanyProfile }; 