import { NextRequest, NextResponse } from 'next/server';
import { withCache, generateCacheKey } from '@/lib/redis';

// SAM.gov Entity API configuration
const SAM_BASE_URL = process.env.SAM_BASE_URL || 'https://api.sam.gov';
const SAM_ENTITY_ENDPOINT = '/entity-information/v3/entities';

// Rate limiting for SAM.gov API
const SAM_RATE_LIMIT_WINDOW = 60000; // 1 minute
const SAM_RATE_LIMIT_MAX_REQUESTS = 100;
const samRateLimitMap = new Map<string, { count: number; timestamp: number }>();

/**
 * Rate limiting for SAM.gov API calls
 */
function checkSAMRateLimit(req: NextRequest): boolean {
  const clientIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || 'unknown';
  const now = Date.now();
  
  const clientData = samRateLimitMap.get(clientIp as string);
  
  if (!clientData) {
    samRateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Reset if window has passed
  if (now - clientData.timestamp > SAM_RATE_LIMIT_WINDOW) {
    samRateLimitMap.set(clientIp as string, { count: 1, timestamp: now });
    return true;
  }
  
  // Check if limit exceeded
  if (clientData.count >= SAM_RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }
  
  // Increment count
  clientData.count++;
  return true;
}

/**
 * Search SAM.gov entities
 */
async function searchSAMEntities(
  filters: {
    entityName?: string;
    ueiSAM?: string;
    cageCode?: string;
    duns?: string;
    state?: string;
    city?: string;
    zipCode?: string;
    limit?: number;
    offset?: number;
  },
  samApiKey: string
): Promise<any[]> {
  // Generate cache key based on filters
  const cacheKey = generateCacheKey(JSON.stringify(filters), 'sam-entity');
  
  // Use cache wrapper
  return withCache(cacheKey, async () => {
    // --- SAM.gov API CALL HAPPENS HERE ---
    let url: string;
    let isSingleEntity = false;
    let params = new URLSearchParams();

    if (filters.ueiSAM) {
      // Use the direct UEI SAM parameter as specified
      params.append('ueiSAM', filters.ueiSAM);
      params.append('api_key', samApiKey);
      url = `${SAM_BASE_URL}${SAM_ENTITY_ENDPOINT}?${params.toString()}`;
      isSingleEntity = true;
      console.log('🔍 Using SINGLE entity endpoint:', url);
    } else {
      // Use the bulk endpoint
      if (filters.entityName) params.append('entityName', filters.entityName);
      if (filters.cageCode) params.append('cageCode', filters.cageCode);
      if (filters.duns) params.append('duns', filters.duns);
      if (filters.state) params.append('state', filters.state);
      if (filters.city) params.append('city', filters.city);
      if (filters.zipCode) params.append('zipCode', filters.zipCode);
      params.append('size', Math.min(filters.limit || 50, 100).toString());
      params.append('registrationStatus', 'ACTIVE');
      params.append('format', 'json');
      url = `${SAM_BASE_URL}${SAM_ENTITY_ENDPOINT}?${params.toString()}`;
      console.log('🔍 Using BULK endpoint:', url);
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    // Check response status
    if (!response.ok) {
      if (response.status === 404 && isSingleEntity) {
        throw new Error(`Entity with UEI SAM ${filters.ueiSAM} not found. Please verify the UEI SAM number is correct.`);
      } else if (response.status === 401) {
        throw new Error('Invalid SAM.gov API key. Please check your API key and try again.');
      } else if (response.status === 429) {
        throw new Error('Rate limit exceeded. Please wait a moment and try again.');
      } else {
        throw new Error(`SAM.gov API error: ${response.status} ${response.statusText}`);
      }
    }

    // Always read the response as text first
    const rawText = await response.text();
    
    // Check if this is a download response (only for bulk searches)
    if (!isSingleEntity && rawText.includes('Extract File will be available for download')) {
      console.log('SAM.gov Entity API requires bulk download approach');
      throw new Error('SAM.gov Entity API requires bulk download. Individual entity lookups are not supported in real-time. Use the bulk download endpoint instead.');
    }
    
    let data;
    try {
      data = JSON.parse(rawText);
    } catch (parseError) {
      console.error('Failed to parse SAM.gov response as JSON:', {
        status: response.status,
        statusText: response.statusText,
        url,
        params: Object.fromEntries(params.entries()),
        rawResponse: rawText.substring(0, 500)
      });
      
      if (isSingleEntity) {
        throw new Error(`Failed to fetch entity with UEI SAM ${filters.ueiSAM}. Please verify the UEI SAM number is correct and try again.`);
      } else {
        throw new Error(`SAM.gov API returned invalid JSON: ${rawText.substring(0, 200)}...`);
      }
    }

    // --- END SAM.gov API CALL ---

    // Transform SAM.gov response to our format
    if (isSingleEntity) {
      // Single entity lookup - handle different response formats
      if (data && data.entityData && Array.isArray(data.entityData)) {
        // Standard SAM.gov response format with entityData array
        return data.entityData;
      } else if (data && data.entity) {
        return [data.entity];
      } else if (data && data.ueiSAM) {
        // Direct entity response
        return [data];
      } else if (Array.isArray(data) && data.length > 0) {
        // Array response with single entity
        return data;
      } else if (data && data.entities && Array.isArray(data.entities)) {
        // Response with entities array
        return data.entities;
      } else {
        console.log('No entity found in response:', data);
        return [];
      }
    } else {
      // Bulk search: entityData is an array
      const entities = Array.isArray(data) ? data : (data.entityData || []);
      return entities;
    }
  }, { prefix: 'sam-entity', ttl: 3600 }); // Cache for 1 hour
}

/**
 * Main SAM entity search API handler
 */
export async function GET(req: NextRequest) {
  // Check rate limit
  if (!checkSAMRateLimit(req)) {
    return NextResponse.json({ 
      error: 'Rate limit exceeded. Please try again later.' 
    }, { status: 429 });
  }
  
  try {
    const { searchParams } = new URL(req.url);
    const entityName = searchParams.get('entityName');
    const ueiSAM = searchParams.get('ueiSAM');
    const cageCode = searchParams.get('cageCode');
    const duns = searchParams.get('duns');
    const state = searchParams.get('state');
    const city = searchParams.get('city');
    const zipCode = searchParams.get('zipCode');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const samApiKey = searchParams.get('samApiKey') || process.env.SAM_API_KEY;
    
    // Validate required parameters
    if (!samApiKey) {
      return NextResponse.json({ 
        error: 'SAM API key is required' 
      }, { status: 400 });
    }
    
    // Build search filters
    const filters = {
      entityName: entityName || undefined,
      ueiSAM: ueiSAM || undefined,
      cageCode: cageCode || undefined,
      duns: duns || undefined,
      state: state || undefined,
      city: city || undefined,
      zipCode: zipCode || undefined,
      limit: limit ? parseInt(limit) : 50,
      offset: offset ? parseInt(offset) : 0,
    };
    
    // Search SAM.gov entities
    const entities = await searchSAMEntities(filters, samApiKey);
    
    // Build response
    const response = {
      entities,
      totalRecords: entities.length,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
    };
    
    // Return response
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('SAM entity search API error:', error);
    
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

// Rate limit configuration for internal use only 