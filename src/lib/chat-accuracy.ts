import { CompanyProfile, SAMOpportunity } from '@/types';
import { chatCache } from './chat-cache';

export interface AccuracyEnhancement {
  type: 'context_expansion' | 'response_validation' | 'opportunity_ranking' | 'freshness_check';
  description: string;
  impact: 'high' | 'medium' | 'low';
}

export interface EnhancedOpportunity {
  opportunity: SAMOpportunity;
  score: number;
  relevanceFactors: {
    naicsMatch: boolean;
    setAsideMatch: boolean;
    locationMatch: boolean;
    capabilityMatch: boolean;
    recencyScore: number;
    valueScore: number;
  };
  overallRelevance: number;
}

/**
 * Enhanced opportunity ranking with multiple relevance factors
 */
export function rankOpportunitiesByAccuracy(
  opportunities: Array<{ opportunity: SAMOpportunity; score: number }>,
  companyProfile: CompanyProfile
): EnhancedOpportunity[] {
  return opportunities.map(({ opportunity, score }) => {
    const relevanceFactors = analyzeOpportunityRelevance(opportunity, companyProfile);
    const overallRelevance = calculateOverallRelevance(relevanceFactors, score);
    
    return {
      opportunity,
      score,
      relevanceFactors,
      overallRelevance
    };
  }).sort((a, b) => b.overallRelevance - a.overallRelevance);
}

/**
 * Analyze opportunity relevance to company profile
 */
function analyzeOpportunityRelevance(
  opportunity: SAMOpportunity,
  companyProfile: CompanyProfile
) {
  // NAICS Code Matching
  const naicsMatch = companyProfile.naicsCodes?.some(
    companyNaics => opportunity.naicsCode?.includes(companyNaics) || 
                    companyNaics.includes(opportunity.naicsCode || '')
  ) || false;

  // Set-Aside Matching
  const setAsideMatch = companyProfile.businessTypes?.some(
    businessType => {
      const setAside = opportunity.typeOfSetAsideDescription?.toLowerCase() || '';
      return setAside.includes(businessType.toLowerCase()) ||
             businessType.toLowerCase().includes(setAside);
    }
  ) || false;

  // Location Matching (if company has location data)
  const locationMatch = companyProfile.contactInfo?.state ? 
    opportunity.placeOfPerformance?.state?.name === companyProfile.contactInfo.state : 
    false;

  // Capability Matching
  const capabilityMatch = companyProfile.capabilities?.some(
    capability => {
      const title = opportunity.title?.toLowerCase() || '';
      const synopsis = opportunity.synopsis?.toLowerCase() || '';
      return title.includes(capability.toLowerCase()) ||
             synopsis.includes(capability.toLowerCase());
    }
  ) || false;

  // Recency Score (newer opportunities get higher scores)
  const recencyScore = calculateRecencyScore(opportunity);

  // Value Score (higher value opportunities get higher scores)
  const valueScore = calculateValueScore(opportunity);

  return {
    naicsMatch,
    setAsideMatch,
    locationMatch,
    capabilityMatch,
    recencyScore,
    valueScore
  };
}

/**
 * Calculate recency score based on opportunity date
 */
function calculateRecencyScore(opportunity: SAMOpportunity): number {
  // If we have a response deadline, use that
  if (opportunity.responseDeadLine) {
    const deadline = new Date(opportunity.responseDeadLine);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    // Higher score for opportunities with more time remaining
    return Math.max(0, Math.min(1, daysUntilDeadline / 30));
  }
  
  // Default to 0.5 if no date available
  return 0.5;
}

/**
 * Calculate value score based on opportunity type and description
 */
function calculateValueScore(opportunity: SAMOpportunity): number {
  const title = opportunity.title?.toLowerCase() || '';
  const synopsis = opportunity.synopsis?.toLowerCase() || '';
  const text = `${title} ${synopsis}`;
  
  // Keywords that suggest higher value opportunities
  const highValueKeywords = [
    'development', 'implementation', 'system', 'software', 'technology',
    'consulting', 'analysis', 'research', 'design', 'engineering',
    'infrastructure', 'platform', 'solution', 'service', 'support'
  ];
  
  // Keywords that suggest lower value opportunities
  const lowValueKeywords = [
    'maintenance', 'cleaning', 'supply', 'equipment', 'material',
    'simple', 'basic', 'routine', 'standard'
  ];
  
  let score = 0.5; // Base score
  
  // Add points for high-value keywords
  highValueKeywords.forEach(keyword => {
    if (text.includes(keyword)) score += 0.1;
  });
  
  // Subtract points for low-value keywords
  lowValueKeywords.forEach(keyword => {
    if (text.includes(keyword)) score -= 0.05;
  });
  
  return Math.max(0, Math.min(1, score));
}

/**
 * Calculate overall relevance score
 */
function calculateOverallRelevance(
  relevanceFactors: any,
  originalScore: number
): number {
  const weights = {
    naicsMatch: 0.25,
    setAsideMatch: 0.20,
    locationMatch: 0.15,
    capabilityMatch: 0.20,
    recencyScore: 0.10,
    valueScore: 0.10
  };
  
  let weightedScore = 0;
  
  // Add weighted scores for each factor
  weightedScore += relevanceFactors.naicsMatch ? weights.naicsMatch : 0;
  weightedScore += relevanceFactors.setAsideMatch ? weights.setAsideMatch : 0;
  weightedScore += relevanceFactors.locationMatch ? weights.locationMatch : 0;
  weightedScore += relevanceFactors.capabilityMatch ? weights.capabilityMatch : 0;
  weightedScore += relevanceFactors.recencyScore * weights.recencyScore;
  weightedScore += relevanceFactors.valueScore * weights.valueScore;
  
  // Combine with original vector similarity score
  const originalWeight = 0.3;
  const enhancedWeight = 0.7;
  
  return (originalScore / 100) * originalWeight + weightedScore * enhancedWeight;
}

/**
 * Validate response accuracy
 */
export function validateResponseAccuracy(
  response: string,
  opportunities: EnhancedOpportunity[],
  userQuestion: string
): {
  accuracy: number;
  issues: string[];
  suggestions: string[];
} {
  const issues: string[] = [];
  const suggestions: string[] = [];
  let accuracy = 1.0;
  
  // Check if response mentions specific opportunities
  const mentionedOpportunities = opportunities.filter(opp => 
    response.toLowerCase().includes(opp.opportunity.title?.toLowerCase() || '')
  );
  
  if (mentionedOpportunities.length === 0 && opportunities.length > 0) {
    issues.push('Response does not mention specific opportunities');
    accuracy -= 0.2;
    suggestions.push('Include specific opportunity titles in response');
  }
  
  // Check if response provides actionable advice
  const actionableKeywords = [
    'apply', 'submit', 'contact', 'deadline', 'requirements',
    'qualify', 'eligible', 'match', 'relevant', 'consider'
  ];
  
  const hasActionableAdvice = actionableKeywords.some(keyword => 
    response.toLowerCase().includes(keyword)
  );
  
  if (!hasActionableAdvice) {
    issues.push('Response lacks actionable advice');
    accuracy -= 0.15;
    suggestions.push('Provide specific next steps or recommendations');
  }
  
  // Check if response addresses the user's question
  const questionKeywords = userQuestion.toLowerCase().split(' ');
  const responseKeywords = response.toLowerCase().split(' ');
  const keywordOverlap = questionKeywords.filter(keyword => 
    responseKeywords.some(respKeyword => respKeyword.includes(keyword))
  ).length;
  
  const questionRelevance = keywordOverlap / questionKeywords.length;
  if (questionRelevance < 0.3) {
    issues.push('Response may not directly address the question');
    accuracy -= 0.1;
    suggestions.push('Ensure response directly answers the user\'s question');
  }
  
  // Check for factual accuracy indicators
  const factualIndicators = [
    'according to', 'based on', 'data shows', 'records indicate',
    'sam.gov', 'federal', 'government', 'contract'
  ];
  
  const hasFactualIndicators = factualIndicators.some(indicator => 
    response.toLowerCase().includes(indicator)
  );
  
  if (!hasFactualIndicators) {
    issues.push('Response lacks factual grounding');
    accuracy -= 0.1;
    suggestions.push('Reference specific data or regulations');
  }
  
  return {
    accuracy: Math.max(0, accuracy),
    issues,
    suggestions
  };
}

/**
 * Enhance context with additional relevant information
 */
export function enhanceContextWithAccuracy(
  opportunities: EnhancedOpportunity[],
  companyProfile: CompanyProfile
): string {
  const topOpportunities = opportunities.slice(0, 3);
  
  let enhancedContext = 'RELEVANT OPPORTUNITIES:\n';
  
  topOpportunities.forEach((opp, index) => {
    const { opportunity, relevanceFactors } = opp;
    
    enhancedContext += `${index + 1}. ${opportunity.title}\n`;
    enhancedContext += `   Relevance: ${Math.round(opp.overallRelevance * 100)}%\n`;
    enhancedContext += `   NAICS Match: ${relevanceFactors.naicsMatch ? 'Yes' : 'No'}\n`;
    enhancedContext += `   Set-Aside Match: ${relevanceFactors.setAsideMatch ? 'Yes' : 'No'}\n`;
    enhancedContext += `   Location Match: ${relevanceFactors.locationMatch ? 'Yes' : 'No'}\n`;
    enhancedContext += `   Capability Match: ${relevanceFactors.capabilityMatch ? 'Yes' : 'No'}\n`;
    enhancedContext += `   Recency Score: ${Math.round(relevanceFactors.recencyScore * 100)}%\n`;
    enhancedContext += `   Value Score: ${Math.round(relevanceFactors.valueScore * 100)}%\n`;
    enhancedContext += `   Synopsis: ${opportunity.synopsis}\n\n`;
  });
  
  return enhancedContext;
}

/**
 * Get accuracy enhancement recommendations
 */
export function getAccuracyEnhancements(): AccuracyEnhancement[] {
  return [
    {
      type: 'opportunity_ranking',
      description: 'Enhanced opportunity ranking with multiple relevance factors',
      impact: 'high'
    },
    {
      type: 'response_validation',
      description: 'Response accuracy validation and quality checks',
      impact: 'medium'
    },
    {
      type: 'context_expansion',
      description: 'Enhanced context with detailed opportunity analysis',
      impact: 'high'
    },
    {
      type: 'freshness_check',
      description: 'Cache freshness validation for up-to-date responses',
      impact: 'medium'
    }
  ];
} 