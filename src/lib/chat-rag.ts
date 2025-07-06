/**
 * Chat RAG (Retrieval-Augmented Generation) utilities
 * Integrates opportunity matching with chat flow
 */

import { vectorStoreUtils } from './vectorStore';
import { getEmbeddingService } from './embed';
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
    `NAICS Codes: ${profile.naicsCodes.join(', ')}`,
    `Capabilities: ${profile.capabilities.join(', ')}`,
    `Business Types: ${profile.businessTypes.join(', ')}`,
    `Past Performance: ${profile.pastPerformance.join('; ')}`,
    `Certifications: ${profile.certifications.join(', ')}`
  ];

  // Add AI-enhanced information if available
  if (profile.aiEnhanced) {
    sections.push(
      `Industry: ${profile.aiEnhanced.industry}`,
      `Company Size: ${profile.aiEnhanced.companySize}`,
      `Enhanced Description: ${profile.aiEnhanced.enhancedDescription}`,
      `Key Products: ${profile.aiEnhanced.keyProducts.join(', ')}`,
      `Target Markets: ${profile.aiEnhanced.targetMarkets.join(', ')}`,
      `Competitive Advantages: ${profile.aiEnhanced.competitiveAdvantages.join(', ')}`
    );
  }

  return sections.join('\n');
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

      return results.map(result => ({
        opportunity: {
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
        } as SAMOpportunity,
        score: result.score
      }));
    } else {
      // Profile-based matching
      return await vectorStoreUtils.findMatchingOpportunities(companyProfile, limit);
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
}> {
  try {
    // Find matching opportunities
    const opportunities = await findMatchingOpportunities(companyProfile, userMessage);
    
    // Build RAG prompt
    const ragPrompt = buildRAGPrompt(userMessage, companyProfile, opportunities);
    
    // Get LLM response
    const response = await llmFunction(ragPrompt.systemPrompt, ragPrompt.userPrompt);
    
    return {
      response,
      context: ragPrompt.context,
      opportunities
    };
  } catch (error) {
    console.error('RAG chat error:', error);
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
  const naicsMatch = companyProfile.naicsCodes.includes(opportunity.naicsCode);
  
  // Set-aside match
  const setAsideMatch = companyProfile.businessTypes.some(type => 
    opportunity.typeOfSetAsideDescription?.toLowerCase().includes(type.toLowerCase())
  );
  
  // Location match (simplified - could be enhanced with distance calculation)
  const locationMatch = opportunity.placeOfPerformance?.state?.name === companyProfile.contactInfo.state;
  
  // Capability match (simple keyword matching)
  const opportunityText = `${opportunity.title} ${opportunity.synopsis}`.toLowerCase();
  const capabilityMatch = companyProfile.capabilities.some(capability =>
    opportunityText.includes(capability.toLowerCase())
  );
  
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