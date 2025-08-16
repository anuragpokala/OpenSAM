/**
 * Chat RAG (Retrieval-Augmented Generation) utilities
 * Integrates opportunity matching with chat flow
 */

import { vectorStoreServerUtils as vectorStoreUtils } from './vectorStore-server';
import { getEmbeddingService } from './embed';
import { chatCache } from './chat-cache';
import { 
  rankOpportunitiesByAccuracy, 
  validateResponseAccuracy, 
  enhanceContextWithAccuracy,
  EnhancedOpportunity 
} from './chat-accuracy';
import { EnhancedRAG, MultiSourceContext } from './enhanced-rag';
import { CompanyProfile, SAMOpportunity } from '@/types';

export interface RAGContext {
  companyProfile: CompanyProfile;
  opportunities: Array<{
    opportunity: SAMOpportunity;
    score: number;
  }>;
  query: string;
}

export interface RAGPrompt {
  systemPrompt: string;
  userPrompt: string;
  context: RAGContext;
}

/**
 * Build RAG prompt with company profile and matching opportunities
 */
export function buildRAGPrompt(
  userQuestion: string,
  companyProfile: CompanyProfile,
  opportunities: Array<{ opportunity: SAMOpportunity; score: number }>,
  maxOpportunities: number = 5
): RAGPrompt {
  // Format company profile
  const profileText = formatCompanyProfile(companyProfile);
  
  // Format top opportunities
  const opportunitiesText = opportunities
    .slice(0, maxOpportunities)
    .map((item, index) => {
      const opp = item.opportunity;
      return `${index + 1}. ${opp.title} – ${opp.synopsis} (relevance: ${Math.round(item.score * 100)}%)`;
    })
    .join('\n');

  const systemPrompt = `You are an AI assistant specializing in government contracting opportunities. You have access to a company profile and relevant opportunities from SAM.gov.

COMPANY PROFILE:
${profileText}

TOP OPPORTUNITIES:
${opportunitiesText}

Please provide helpful, accurate advice about these opportunities and how they relate to the company profile. Consider:
- Relevance to the company's capabilities and NAICS codes
- Set-aside opportunities that match the company's business type
- Geographic considerations
- Technical requirements alignment
- Past performance relevance

Be specific and actionable in your recommendations.`;

  const userPrompt = `USER QUESTION:
${userQuestion}`;

  return {
    systemPrompt,
    userPrompt,
    context: {
      companyProfile,
      opportunities,
      query: userQuestion
    }
  };
}

/**
 * Format company profile for RAG context
 */
function formatCompanyProfile(profile: CompanyProfile): string {
  const sections = [
    `Company: ${profile.entityName}`,
    `Description: ${profile.description}`,
    `NAICS Codes: ${profile.naicsCodes?.join(', ') || 'None'}`,
    `Capabilities: ${profile.capabilities?.join(', ') || 'None'}`,
    `Business Types: ${profile.businessTypes?.join(', ') || 'None'}`,
    `Past Performance: ${profile.pastPerformance?.join('; ') || 'None'}`,
    `Certifications: ${profile.certifications?.join(', ') || 'None'}`
  ];

  // Add AI-enhanced information if available
  if (profile.aiEnhanced) {
    sections.push(
      `Industry: ${profile.aiEnhanced.industry}`,
      `Company Size: ${profile.aiEnhanced.companySize}`,
      `Enhanced Description: ${profile.aiEnhanced.enhancedDescription}`,
      `Key Products: ${profile.aiEnhanced.keyProducts?.join(', ') || 'None'}`,
      `Target Markets: ${profile.aiEnhanced.targetMarkets?.join(', ') || 'None'}`,
      `Competitive Advantages: ${profile.aiEnhanced.competitiveAdvantages?.join(', ') || 'None'}`
    );
  }

  return sections.join('\n');
}

function getMatchScoreCacheKey(companyId: string, opportunityId: string) {
  return `opensam-matchscore-${companyId}-${opportunityId}`;
}

function getCachedMatchScore(companyId: string, opportunityId: string): number | null {
  if (typeof window === 'undefined') return null;
  const key = getMatchScoreCacheKey(companyId, opportunityId);
  const cached = localStorage.getItem(key);
  if (!cached) return null;
  try {
    const { score, timestamp } = JSON.parse(cached);
    // 7 days expiry
    if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
      return score;
    }
    localStorage.removeItem(key);
    return null;
  } catch {
    return null;
  }
}

function setCachedMatchScore(companyId: string, opportunityId: string, score: number) {
  if (typeof window === 'undefined') return;
  const key = getMatchScoreCacheKey(companyId, opportunityId);
  localStorage.setItem(key, JSON.stringify({ score, timestamp: Date.now() }));
}

/**
 * Find matching opportunities for a company profile
 */
export async function findMatchingOpportunities(
  companyProfile: CompanyProfile,
  query?: string,
  limit: number = 5
): Promise<Array<{ opportunity: SAMOpportunity; score: number }>> {
  try {
    // Check cache first
    const searchQuery = query || companyProfile.description || companyProfile.entityName || '';
    const cachedResults = chatCache.getVectorSearch(searchQuery, companyProfile.id, limit);
    
    if (cachedResults) {
      console.log('🎯 Using cached vector search results');
      return cachedResults.results;
    }

    if (query) {
      // Text-based search
      const embeddingService = getEmbeddingService();
      const queryVector = await embeddingService.getEmbedding(query);
      
      const results = await vectorStoreUtils.searchVectors(
        queryVector,
        'sam_opportunities',
        limit,
        { type: 'opportunity' }
      );

      const mappedResults = results.map(result => {
        const opportunity = {
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
        } as SAMOpportunity;
        // --- Caching logic ---
        let score = getCachedMatchScore(companyProfile.id, opportunity.id);
        if (score === null) {
          // Convert similarity to percent (if needed)
          score = Math.round((result.score ?? 0) * 100);
          setCachedMatchScore(companyProfile.id, opportunity.id, score);
        }
        return { opportunity, score };
      });
      
      // Cache the results
      chatCache.setVectorSearch(searchQuery, companyProfile.id, limit, {
        results: mappedResults,
        queryHash: searchQuery
      });
      
      return mappedResults;
    } else {
      // Profile-based matching
      const matches = await vectorStoreUtils.findMatchingOpportunities(companyProfile, limit);
      const results = matches.map(({ opportunity, score }) => {
        let cachedScore = getCachedMatchScore(companyProfile.id, opportunity.id);
        if (cachedScore === null) {
          cachedScore = Math.round((score ?? 0) * 100);
          setCachedMatchScore(companyProfile.id, opportunity.id, cachedScore);
        }
        return { opportunity, score: cachedScore };
      });
      
      // Cache the results
      chatCache.setVectorSearch(searchQuery, companyProfile.id, limit, {
        results,
        queryHash: searchQuery
      });
      
      return results;
    }
  } catch (error) {
    console.error('Failed to find matching opportunities:', error);
    return [];
  }
}

/**
 * Enhanced chat function with RAG integration
 */
export async function chatWithRAG(
  userMessage: string,
  companyProfile: CompanyProfile,
  llmFunction: (systemPrompt: string, userPrompt: string) => Promise<string>
): Promise<{
  response: string;
  context: RAGContext;
  opportunities: Array<{ opportunity: SAMOpportunity; score: number }>;
  accuracyMetrics?: {
    accuracy: number;
    issues: string[];
    suggestions: string[];
  };
  enhancedContext?: MultiSourceContext;
}> {
  try {
    // Use Enhanced RAG for multi-source context
    const enhancedRAG = EnhancedRAG.getInstance();
    const multiSourceContext = await enhancedRAG.buildMultiSourceContext(userMessage, companyProfile);
    
    // Build enhanced prompt with comprehensive context
    const enhancedPrompt = enhancedRAG.buildEnhancedPrompt(userMessage, multiSourceContext);
    
    // Get LLM response with enhanced context
    const response = await llmFunction(enhancedPrompt.systemPrompt, enhancedPrompt.userPrompt);
    
    // Validate response accuracy
    const accuracyMetrics = validateResponseAccuracy(response, multiSourceContext.opportunities, userMessage);
    
    console.log('🎯 Enhanced RAG response accuracy:', {
      score: Math.round(accuracyMetrics.accuracy * 100),
      issues: accuracyMetrics.issues.length,
      suggestions: accuracyMetrics.suggestions.length,
      contextSources: Object.keys(multiSourceContext).length
    });
    
    return {
      response,
      context: {
        opportunities: multiSourceContext.opportunities,
        companyProfile: multiSourceContext.companyProfile
      },
      opportunities: multiSourceContext.opportunities,
      accuracyMetrics,
      enhancedContext: multiSourceContext
    };
  } catch (error) {
    console.error('Enhanced RAG chat error:', error);
    throw error;
  }
}

/**
 * Get opportunity details for RAG context
 */
export function getOpportunityDetails(opportunity: SAMOpportunity): string {
  const details = [
    `Title: ${opportunity.title}`,
    `Synopsis: ${opportunity.synopsis}`,
    `NAICS Code: ${opportunity.naicsCode}`,
    `Type: ${opportunity.type}`,
    `Set-Aside: ${opportunity.typeOfSetAsideDescription}`,
    `Response Deadline: ${opportunity.responseDeadLine}`,
    `Location: ${opportunity.placeOfPerformance?.state?.name || 'Not specified'}`,
    `Estimated Value: ${opportunity.estimatedValue ? `$${opportunity.estimatedValue.toLocaleString()}` : 'Not specified'}`
  ];

  return details.join('\n');
}

/**
 * Analyze opportunity fit for company
 */
export function analyzeOpportunityFit(
  opportunity: SAMOpportunity,
  companyProfile: CompanyProfile
): {
  naicsMatch: boolean;
  setAsideMatch: boolean;
  locationMatch: boolean;
  capabilityMatch: boolean;
  overallScore: number;
} {
  // NAICS code match
  const naicsMatch = companyProfile.naicsCodes?.includes(opportunity.naicsCode) || false;
  
  // Set-aside match
  const setAsideMatch = companyProfile.businessTypes?.some(type => 
    opportunity.typeOfSetAsideDescription?.toLowerCase().includes(type.toLowerCase())
  ) || false;
  
  // Location match (simplified - could be enhanced with distance calculation)
  const locationMatch = opportunity.placeOfPerformance?.state?.name === companyProfile.contactInfo?.state;
  
  // Capability match (simple keyword matching)
  const opportunityText = `${opportunity.title} ${opportunity.synopsis}`.toLowerCase();
  const capabilityMatch = companyProfile.capabilities?.some(capability =>
    opportunityText.includes(capability.toLowerCase())
  ) || false;
  
  // Calculate overall score
  const scores = [naicsMatch, setAsideMatch, locationMatch, capabilityMatch];
  const overallScore = scores.filter(Boolean).length / scores.length;
  
  return {
    naicsMatch,
    setAsideMatch,
    locationMatch,
    capabilityMatch,
    overallScore
  };
} 