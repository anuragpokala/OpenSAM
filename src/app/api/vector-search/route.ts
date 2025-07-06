import { NextRequest, NextResponse } from 'next/server';
import { vectorStoreUtils } from '@/lib/vectorStore';
import { VectorSearchQuery, SemanticSearchResult } from '@/types';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 50;
const rateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Rate limiting for vector search API calls
 */
function checkRateLimit(req: NextRequest): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = rateLimitMap.get(clientIp as string);
  
  if (!clientData) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - clientData.timestamp > RATE_LIMIT_WINDOW) {
    rateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Check if limit exceeded
  if (clientData.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment count
  clientData.count++;
  return true;
}

/**
 * Main vector search API handler
 */
export async function GET(req: NextRequest) {
  // Check rate limit
  if (!checkRateLimit(req)) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }, { status: 429 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type');
    const tags = searchParams.get('tags');
    const fromDate = searchParams.get('fromDate');
    const toDate = searchParams.get('toDate');
    const limit = searchParams.get('limit');
    const threshold = searchParams.get('threshold');
    
    // Validate required parameters
    if (!query) {
      return NextResponse.json({ 
        error: 'Search query is required' 
      }, { status: 400 });
    }
    
    // Build search filters
    const filters: Record<string, any> = {};
    
    if (type) {
      filters.type = type.split(',').map(t => t.trim());
    }
    
    if (tags) {
      filters.tags = tags.split(',').map(t => t.trim());
    }
    
    if (fromDate || toDate) {
      filters.dateRange = {
        from: fromDate ? new Date(fromDate).getTime() : 0,
        to: toDate ? new Date(toDate).getTime() : Date.now(),
      };
    }
    
    // Perform vector search
    const startTime = Date.now();
    
    try {
      // Convert query to vector (using the same method as addOpportunity)
      const queryVector = vectorStoreUtils.textToSimpleVector(query);
      
      const results = await vectorStoreUtils.searchVectors(
        queryVector,
        'sam_opportunities',
        limit ? parseInt(limit) : 20,
        filters
      );
      
      const searchTime = Date.now() - startTime;
      
      // Build response
      const response: SemanticSearchResult = {
        query,
        results: results.map(result => ({
          document: {
            id: result.id,
            content: result.metadata?.title || 'No title',
            metadata: {
              type: 'opportunity',
              source: 'sam-gov',
              title: result.metadata?.title,
              description: result.metadata?.description,
              tags: [],
              timestamp: Date.now(),
              ...result.metadata
            },
            embedding: result.values || [],
            similarity: result.score
          },
          score: result.score,
          highlights: []
        })),
        totalResults: results.length,
        searchTime,
        filters,
      };
      
      // Return response
      return NextResponse.json({
        success: true,
        data: response,
        timestamp: Date.now(),
      }, { status: 200 });
      
    } catch (searchError) {
      console.error('Vector search error details:', {
        error: searchError,
        query,
        filters,
        vectorStoreStats: await vectorStoreUtils.getStats()
      });
      throw searchError;
    }
    
  } catch (error) {
    console.error('Vector search API error:', error);
    
    // Return appropriate error response
    if (error instanceof Error) {
      return NextResponse.json({ 
        error: error.message,
        timestamp: Date.now(),
      }, { status: 500 });
    } else {
      return NextResponse.json({ 
        error: 'An unexpected error occurred',
        timestamp: Date.now(),
      }, { status: 500 });
    }
  }
}

/**
 * Add document to vector store
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { type, content, metadata } = body;
    
    // Validate required parameters
    if (!type || !content) {
      return NextResponse.json({ 
        error: 'Type and content are required' 
      }, { status: 400 });
    }
    
    // Convert content to vector
    const vector = vectorStoreUtils.textToSimpleVector(content);
    
    // Add document to vector store
    await vectorStoreUtils.storeVectors([{
      id: metadata?.id || `doc_${Date.now()}`,
      values: vector,
      metadata: {
        type,
        source: metadata?.source || 'api',
        title: metadata?.title,
        description: metadata?.description,
        tags: metadata?.tags || [],
        timestamp: Date.now(),
        ...metadata,
      }
    }], 'documents');
    
    return NextResponse.json({
      success: true,
      message: 'Document added to vector store',
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Vector store add document error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to add document to vector store',
      timestamp: Date.now(),
    }, { status: 500 });
  }
}

/**
 * Get vector store statistics
 */
export async function OPTIONS(req: NextRequest) {
  try {
    const stats = await vectorStoreUtils.getStats();
    
    return NextResponse.json({
      success: true,
      data: stats,
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('Vector store stats error:', error);
    
    return NextResponse.json({ 
      error: 'Failed to get vector store statistics',
      timestamp: Date.now(),
    }, { status: 500 });
  }
} 