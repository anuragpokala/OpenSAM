import { NextRequest, NextResponse } from 'next/server';
import { SAMOpportunity, SAMSearchFilters, SAMSearchResponse } from '@/types';
import { withCache, generateCacheKey } from '@/lib/redis';
import { vectorStoreServerUtils } from '@/lib/vectorStore-server';

// SAM.gov API configuration
const SAM_BASE_URL = process.env.SAM_BASE_URL || 'https://api.sam.gov';
const SAM_OPPORTUNITIES_ENDPOINT = '/opportunities/v2/search';

// Rate limiting for SAM.gov API
const SAM_RATE_LIMIT_WINDOW = 60000; // 1 minute
const SAM_RATE_LIMIT_MAX_REQUESTS = 100;
const samRateLimitMap = new Map<string, { count: number; timestamp: number }>();

// Cache for search results
const searchResultsCache = new Map<string, { data: SAMSearchResponse; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

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
 * Search SAM.gov opportunities
 */
async function searchSAMOpportunities(
  filters: SAMSearchFilters,
  samApiKey: string
): Promise<{ opportunities: SAMOpportunity[]; totalRecords: number }> {
  // Generate cache key based on filters
  const cacheKey = generateCacheKey(JSON.stringify(filters), 'sam-search');
  
  // Use cache wrapper
  return withCache(cacheKey, async () => {
    const params = new URLSearchParams();
    
    // Add search parameters using correct SAM.gov API parameters
    if (filters.keyword) {
      params.append('q', filters.keyword);
    }
    
    if (filters.startDate) {
      params.append('postedFrom', filters.startDate);
    }
    
    if (filters.endDate) {
      params.append('postedTo', filters.endDate);
    }
    
    // Use ncode for NAICS codes (single value)
    if (filters.naicsCode) {
      // Take the first NAICS code if multiple are provided
      const naicsCodes = filters.naicsCode.split(',').map(code => code.trim()).filter(code => code);
      if (naicsCodes.length > 0) {
        params.append('ncode', naicsCodes[0]);
      }
    }
    
    // Set opportunity type to 'o' for opportunities
    params.append('ptype', 'o');
    
    // Set active to false to get all opportunities
    params.append('active', 'false');
    
    params.append('limit', Math.min(filters.limit || 50, 100).toString());
    params.append('offset', (filters.offset || 0).toString());
    
    // Add default parameters
    params.append('includeCount', 'true');
    params.append('format', 'json');
    
    const url = `${SAM_BASE_URL}${SAM_OPPORTUNITIES_ENDPOINT}?${params.toString()}`;
    
    // Log the request for debugging (remove sensitive data)
    console.log('SAM.gov API request:', {
      url: `${SAM_BASE_URL}${SAM_OPPORTUNITIES_ENDPOINT}`,
      params: Object.fromEntries(params.entries()),
      hasApiKey: !!samApiKey
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-API-Key': samApiKey,
        'Accept': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      let errorMessage = `SAM.gov API error: ${response.status} ${response.statusText}`;
      
      try {
        const errorJson = JSON.parse(error);
        if (errorJson.errorMessage) {
          errorMessage += ` - ${errorJson.errorMessage}`;
        } else {
          errorMessage += ` - ${error}`;
        }
      } catch {
        errorMessage += ` - ${error}`;
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    
    // Extract total count from SAM.gov response
    const totalRecords = data.totalRecords || data.opportunitiesData?.length || 0;
    
    // Transform SAM.gov response to our format
    const opportunities = data.opportunitiesData?.map((opportunity: any) => ({
      id: opportunity.noticeId || opportunity.solicitationNumber,
      noticeId: opportunity.noticeId,
      title: opportunity.title,
      description: opportunity.description || '',
      synopsis: opportunity.synopsis || '',
      type: opportunity.type,
      baseType: opportunity.baseType,
      archiveType: opportunity.archiveType,
      archiveDate: opportunity.archiveDate,
      typeOfSetAsideDescription: opportunity.typeOfSetAsideDescription,
      typeOfSetAside: opportunity.typeOfSetAside,
      responseDeadLine: opportunity.responseDeadLine,
      naicsCode: opportunity.naicsCode,
      naicsDescription: opportunity.naicsDescription,
      classificationCode: opportunity.classificationCode,
      active: opportunity.active,
      award: opportunity.award,
      pointOfContact: opportunity.pointOfContact,
      placeOfPerformance: opportunity.placeOfPerformance,
      organizationType: opportunity.organizationType,
      officeAddress: opportunity.officeAddress,
      links: opportunity.links,
      uiLink: opportunity.uiLink,
      relevanceScore: 0, // Will be calculated if semantic search is used
      isFavorite: false,
      tags: [],
    })) || [];
    
    return { opportunities, totalRecords };
  }, { prefix: 'sam-search', ttl: 1800 }); // Cache for 30 minutes
}



/**
 * Main SAM search API handler
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
    const keyword = searchParams.get('q');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    // Handle multiple NAICS codes and opportunity types
    const naicsCodes = searchParams.getAll('naicsCode');
    const naicsCode = naicsCodes.length > 0 ? naicsCodes.join(',') : null;
    const state = searchParams.get('state');
    const agency = searchParams.get('agency');
    const opportunityTypes = searchParams.getAll('type');
    const type = opportunityTypes.length > 0 ? opportunityTypes.join(',') : null;
    const setAside = searchParams.get('setAside');
    const active = searchParams.get('active');
    const limit = searchParams.get('limit');
    const offset = searchParams.get('offset');
    const semantic = searchParams.get('semantic');
    const provider = searchParams.get('provider') || 'openai';
    const samApiKey = searchParams.get('samApiKey') || searchParams.get('api_key') || process.env.SAM_API_KEY;
    const entityName = searchParams.get('entityName');
    const contractVehicle = searchParams.get('contractVehicle');
    const classificationCode = searchParams.get('classificationCode');
    const fundingSource = searchParams.get('fundingSource');
    const responseDeadlineFrom = searchParams.get('responseDeadlineFrom');
    const responseDeadlineTo = searchParams.get('responseDeadlineTo');
    const estimatedValueMin = searchParams.get('estimatedValueMin');
    const estimatedValueMax = searchParams.get('estimatedValueMax');
    const hasAttachments = searchParams.get('hasAttachments');
    
    // Validate required parameters
    if (!samApiKey) {
      return NextResponse.json({ 
        error: 'SAM API key is required' 
      }, { status: 400 });
    }
    
    // Set default date range if not provided (current year)
    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 1); // January 1st of current year
    
    // Format dates as MM/dd/yyyy for SAM.gov API
    const formatDateForSAM = (date: Date) => {
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    };
    
    // Convert date string to MM/dd/yyyy format if needed
    const normalizeDate = (dateStr: string | null | undefined): string | undefined => {
      if (!dateStr) return undefined;
      
      // If already in MM/dd/yyyy format, return as is
      if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(dateStr)) {
        return dateStr;
      }
      
      // If in YYYY-MM-DD format, convert to MM/dd/yyyy
      if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
        const [year, month, day] = dateStr.split('-');
        return `${month}/${day}/${year}`;
      }
      
      // Try to parse as Date and format
      const date = new Date(dateStr);
      if (!isNaN(date.getTime())) {
        return formatDateForSAM(date);
      }
      
      return undefined;
    };
    
    const defaultStartDate = formatDateForSAM(startOfYear);
    const defaultEndDate = formatDateForSAM(today);
    
    // Build search filters
    const filters: SAMSearchFilters = {
      keyword: keyword || undefined,
      startDate: normalizeDate(startDate) || defaultStartDate,
      endDate: normalizeDate(endDate) || defaultEndDate,
      naicsCode: naicsCode || undefined,
      state: state || undefined,
      agency: agency || undefined,
      type: type || undefined,
      setAside: setAside || undefined,
      active: active === 'true',
      limit: limit ? parseInt(limit) : 100, // Increased default limit for better search results
      offset: offset ? parseInt(offset) : 0,
      // Enhanced filters
      entityName: entityName || undefined,
      contractVehicle: contractVehicle || undefined,
      classificationCode: classificationCode || undefined,
      fundingSource: fundingSource || undefined,
      responseDeadline: {
        from: normalizeDate(responseDeadlineFrom) || undefined,
        to: normalizeDate(responseDeadlineTo) || undefined,
      },
      estimatedValue: {
        min: estimatedValueMin ? parseFloat(estimatedValueMin) : undefined,
        max: estimatedValueMax ? parseFloat(estimatedValueMax) : undefined,
      },
      hasAttachments: hasAttachments === 'true',
    };
    
    // Create cache key
    const cacheKey = JSON.stringify(filters);
    
    // Check cache first
    const cachedResult = searchResultsCache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        success: true,
        data: cachedResult.data,
        cached: true,
        timestamp: Date.now(),
      }, { status: 200 });
    }
    
    // Search SAM.gov
    if (!samApiKey) {
      return NextResponse.json({ error: 'SAM API key is required' }, { status: 400 });
    }
    const searchResult = await searchSAMOpportunities(filters, samApiKey);
    const opportunities = searchResult.opportunities;
    const totalRecords = searchResult.totalRecords;
    
    // Add opportunities to vector store for future semantic search
    if (opportunities.length > 0) {
      try {
        await Promise.all(
          opportunities.slice(0, 10).map(opp => vectorStoreServerUtils.addOpportunity(opp))
        );
      } catch (error) {
        console.warn('Failed to add opportunities to vector store:', error);
      }
    }
    
    // No client-side filtering - use SAM.gov API results directly
    const finalOpportunities = opportunities;
    
    // Build response
    const response: SAMSearchResponse = {
      opportunities: finalOpportunities,
      totalRecords: totalRecords,
      limit: filters.limit || 50,
      offset: filters.offset || 0,
      facets: {
        naicsCodes: [],
        states: [],
        agencies: [],
        types: [],
      },
    };
    
    // Cache the result
    searchResultsCache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // Return response
    return NextResponse.json({
      success: true,
      data: response,
      timestamp: Date.now(),
    }, { status: 200 });
    
  } catch (error) {
    console.error('SAM search API error:', error);
    
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

// Cleanup function to remove old cache entries
setInterval(() => {
  const now = Date.now();
  
  // Clean search results cache
  Array.from(searchResultsCache.entries()).forEach(([key, value]) => {
    if (now - value.timestamp > CACHE_DURATION) {
      searchResultsCache.delete(key);
    }
  });
}, 5 * 60 * 1000); // Run every 5 minutes

// Rate limit configuration for internal use only