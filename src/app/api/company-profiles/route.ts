import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';

// Import the getVectorStoreAdapter function
async function getVectorStoreAdapter() {
  const { getVectorStoreAdapter: getAdapter } = await import('@/lib/adapters/factory');
  return getAdapter();
}

/**
 * Get all company profiles from vector store
 * GET /api/company-profiles
 */
export async function GET(req: NextRequest) {
  try {
    console.log('🔍 Retrieving all company profiles from vector store...');
    
    // Get all vectors from the company_profiles collection
    const vectorStore = await getVectorStoreAdapter();
    const results = await vectorStore.query(
      'company_profiles',
      new Array(1536).fill(0), // Dummy vector to get all results
      1000, // Get up to 1000 profiles
      {} // No metadata filter
    );

    console.log(`✅ Found ${results.length} company profiles in vector store`);

    // Convert vector results back to company profile format
    const companyProfiles = results.map((result: any) => {
      const metadata = result.metadata || {};
      return {
        id: metadata.profileId || result.id.replace('profile_', ''),
        entityName: metadata.title || 'Unknown Company',
        description: metadata.description || '',
        businessTypes: metadata.businessTypes ? metadata.businessTypes.split(', ') : [],
        naicsCodes: metadata.naicsCodes ? metadata.naicsCodes.split(', ') : [],
        capabilities: metadata.capabilities ? metadata.capabilities.split(', ') : [],
        ueiSAM: metadata.ueiSAM || '',
        contactInfo: {
          address: '',
          city: '',
          state: '',
          zipCode: '',
          phone: '',
          email: '',
          website: ''
        },
        createdAt: metadata.timestamp ? new Date(metadata.timestamp).getTime() : Date.now(),
        updatedAt: metadata.timestamp ? new Date(metadata.timestamp).getTime() : Date.now()
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        profiles: companyProfiles,
        totalCount: companyProfiles.length,
        timestamp: Date.now()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('❌ Failed to retrieve company profiles:', error);
    return NextResponse.json({ 
      error: 'Failed to retrieve company profiles',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 });
  }
} 