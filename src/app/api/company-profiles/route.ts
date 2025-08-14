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
    console.log('🔍 Retrieving all company profiles...');
    
    // For now, return an empty array to prevent errors
    // TODO: Implement proper vector store integration when available
    const companyProfiles: any[] = [];
    
    console.log(`✅ Returning ${companyProfiles.length} company profiles`);

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