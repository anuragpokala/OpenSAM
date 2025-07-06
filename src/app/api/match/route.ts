import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreUtils } from '@/lib/vectorStore';
import { getEmbeddingService } from '@/lib/embed';

/**
 * Match company profile with opportunities
 * GET /api/match?company_id=xxx&limit=5
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('company_id');
    const limit = parseInt(searchParams.get('limit') || '5');
    const query = searchParams.get('query'); // Optional text query

    if (!companyId) {
      return NextResponse.json({ 
        error: 'company_id parameter is required' 
      }, { status: 400 });
    }

    // Get company profile from localStorage (simplified - in production, use database)
    let companyProfile = null;
    if (typeof window !== 'undefined') {
      const profiles = JSON.parse(localStorage.getItem('opensam-company-profiles') || '{}');
      companyProfile = profiles[companyId];
    }

    if (!companyProfile) {
      return NextResponse.json({ 
        error: 'Company profile not found' 
      }, { status: 404 });
    }

    let results: Array<{ opportunity: any; score: number }> = [];

    if (query) {
      // Text-based search: embed the query and search opportunities
      const embeddingService = getEmbeddingService();
      const queryVector = await embeddingService.getEmbedding(query);
      
      const vectorResults = await vectorStoreUtils.searchVectors(
        queryVector,
        'sam_opportunities',
        limit,
        { type: 'opportunity' }
      );

      results = vectorResults.map(result => ({
        opportunity: {
          id: result.id,
          title: result.metadata?.title || '',
          synopsis: result.metadata?.synopsis || '',
          naicsCode: result.metadata?.naicsCode || '',
          state: result.metadata?.state || '',
          city: result.metadata?.city || '',
          setAside: result.metadata?.setAside || '',
          responseDeadline: result.metadata?.responseDeadline || '',
          active: result.metadata?.active || false,
          uiLink: result.metadata?.uiLink || '',
          source: result.metadata?.source || ''
        },
        score: result.score
      }));
    } else {
      // Profile-based matching: find opportunities similar to company profile
      results = await vectorStoreUtils.findMatchingOpportunities(companyProfile, limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        companyId,
        query: query || null,
        results,
        totalResults: results.length,
        timestamp: Date.now()
      }
    }, { status: 200 });

  } catch (error) {
    console.error('Match API error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to match opportunities',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 });
  }
}

/**
 * Add company profile to vector store
 * POST /api/match
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyProfile, embeddingConfig } = body;

    if (!companyProfile || !companyProfile.id) {
      return NextResponse.json({ 
        error: 'Company profile with ID is required' 
      }, { status: 400 });
    }

    // Add company profile to vector store
    await vectorStoreUtils.addCompanyProfile(companyProfile, embeddingConfig);

    return NextResponse.json({
      success: true,
      message: 'Company profile added to vector store',
      profileId: companyProfile.id,
      timestamp: Date.now()
    }, { status: 200 });

  } catch (error) {
    console.error('Add company profile error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to add company profile to vector store',
      details: error instanceof Error ? error.message : 'Unknown error',
      timestamp: Date.now()
    }, { status: 500 });
  }
} 