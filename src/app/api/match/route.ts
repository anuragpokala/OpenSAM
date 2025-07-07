import { NextRequest, NextResponse } from 'next/server';
import { getEmbeddingService } from '@/lib/embed';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';

/**
 * Match company profile with opportunities
 * GET /api/match?company_id=xxx&limit=5
 * POST /api/match (with company profile in body)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const companyId = searchParams.get('company_id');
    const opportunityId = searchParams.get('opportunity_id');
    const limit = parseInt(searchParams.get('limit') || '5');
    const query = searchParams.get('query'); // Optional text query

    if (!companyId) {
      return NextResponse.json({ 
        error: 'company_id parameter is required' 
      }, { status: 400 });
    }

    // For GET requests, we need the company profile data to be passed in the request body
    // This is a limitation since GET requests shouldn't have bodies, so we'll return an error
    // suggesting to use POST instead
    return NextResponse.json({ 
      error: 'Company profile data required. Please use POST method with company profile in request body.' 
    }, { status: 400 });

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
 * Match company profile with opportunities (POST method)
 * POST /api/match
 * Body: { companyProfile: CompanyProfile, opportunityId?: string, limit?: number, query?: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { companyProfile, opportunityId, limit = 5, query } = body;

    if (!companyProfile || !companyProfile.id) {
      return NextResponse.json({ 
        error: 'Company profile with ID is required in request body' 
      }, { status: 400 });
    }

    // If opportunity_id is provided, calculate match for specific opportunity
    if (opportunityId) {
      try {
        const matchScore = await vectorStoreServerUtils.calculateOpportunityMatch(companyProfile, opportunityId);
        return NextResponse.json({
          success: true,
          data: {
            companyId: companyProfile.id,
            opportunityId,
            matchScore,
            timestamp: Date.now()
          }
        }, { status: 200 });
      } catch (error) {
        console.error('Opportunity match calculation error:', error);
        return NextResponse.json({ 
          error: 'Failed to calculate opportunity match',
          details: error instanceof Error ? error.message : 'Unknown error',
          timestamp: Date.now()
        }, { status: 500 });
      }
    }

    let results: Array<{ opportunity: any; score: number }> = [];

    if (query) {
      // Text-based search: embed the query and search opportunities
      const embeddingService = getEmbeddingService();
      const queryVector = await embeddingService.getEmbedding(query);
      
      const vectorResults = await vectorStoreServerUtils.searchVectors(
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
      results = await vectorStoreServerUtils.findMatchingOpportunities(companyProfile, limit);
    }

    return NextResponse.json({
      success: true,
      data: {
        companyId: companyProfile.id,
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