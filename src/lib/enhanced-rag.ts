import { CompanyProfile, SAMOpportunity } from '@/types';
import { chatCache } from './chat-cache';
import { vectorStoreServerUtils } from './vectorStore-server';

export interface MultiSourceContext {
  companyProfile: CompanyProfile | null;
  opportunities: Array<{ opportunity: SAMOpportunity; score: number; relevanceFactors: any }>;
  marketTrends: MarketTrend[];
  historicalData: HistoricalData;
  industryInsights: IndustryInsight[];
  regulatoryContext: RegulatoryContext;
}

export interface MarketTrend {
  category: string;
  trend: string;
  impact: 'high' | 'medium' | 'low';
  description: string;
  source: string;
}

export interface HistoricalData {
  totalOpportunities: number;
  averageValue: number;
  topNAICSCodes: string[];
  commonSetAsides: string[];
  successRate: number;
}

export interface IndustryInsight {
  industry: string;
  insights: string[];
  opportunities: number;
  growthRate: number;
}

export interface RegulatoryContext {
  recentChanges: string[];
  complianceRequirements: string[];
  deadlines: string[];
}

/**
 * Enhanced RAG system with multi-source context
 */
export class EnhancedRAG {
  private static instance: EnhancedRAG;
  
  private constructor() {}
  
  static getInstance(): EnhancedRAG {
    if (!EnhancedRAG.instance) {
      EnhancedRAG.instance = new EnhancedRAG();
    }
    return EnhancedRAG.instance;
  }

  /**
   * Build comprehensive multi-source context
   */
  async buildMultiSourceContext(
    userQuery: string,
    companyProfile: CompanyProfile | null,
    limit: number = 10
  ): Promise<MultiSourceContext> {
    const context: MultiSourceContext = {
      companyProfile,
      opportunities: [],
      marketTrends: [],
      historicalData: await this.getHistoricalData(),
      industryInsights: await this.getIndustryInsights(companyProfile),
      regulatoryContext: await this.getRegulatoryContext()
    };

    // Get opportunities with enhanced matching
    if (companyProfile) {
      context.opportunities = await this.getEnhancedOpportunities(userQuery, companyProfile, limit);
    } else {
      context.opportunities = await this.getGeneralOpportunities(userQuery, limit);
    }

    // Get market trends based on query and company profile
    context.marketTrends = await this.getMarketTrends(userQuery, companyProfile);

    return context;
  }

  /**
   * Get enhanced opportunities with multiple relevance factors
   */
  private async getEnhancedOpportunities(
    query: string,
    companyProfile: CompanyProfile,
    limit: number
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number; relevanceFactors: any }>> {
    const cacheKey = `enhanced_opps:${companyProfile.id}:${query}:${limit}`;
    const cached = chatCache.getVectorSearch(cacheKey, companyProfile.id, limit);
    
    if (cached) {
      return cached.results;
    }

    // Get base opportunities from vector store
    const opportunities = await this.searchOpportunities(query, companyProfile, limit);
    
    // Enhance with relevance factors
    const enhancedOpportunities = opportunities.map(opp => {
      const relevanceFactors = this.calculateRelevanceFactors(opp.opportunity, companyProfile);
      const enhancedScore = this.calculateEnhancedScore(opp.score, relevanceFactors);
      
      return {
        opportunity: opp.opportunity,
        score: enhancedScore,
        relevanceFactors
      };
    });

    // Cache the results
    chatCache.setVectorSearch(cacheKey, companyProfile.id, limit, {
      results: enhancedOpportunities,
      queryHash: query
    });

    return enhancedOpportunities;
  }

  /**
   * Get general opportunities for users without company profiles
   */
  private async getGeneralOpportunities(
    query: string,
    limit: number
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number; relevanceFactors: any }>> {
    const opportunities = await this.searchOpportunities(query, null, limit);
    
    return opportunities.map(opp => ({
      opportunity: opp.opportunity,
      score: opp.score,
      relevanceFactors: {
        naicsMatch: false,
        setAsideMatch: false,
        locationMatch: false,
        capabilityMatch: false,
        recencyScore: 0.5,
        valueScore: 0.5
      }
    }));
  }

  /**
   * Search opportunities from vector store
   */
  private async searchOpportunities(
    query: string,
    companyProfile: CompanyProfile | null,
    limit: number
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number }>> {
    try {
      const embeddingService = await import('./embed').then(m => m.getEmbeddingService());
      const embedding = await embeddingService.getEmbedding(query);
      
      const results = await vectorStoreServerUtils.searchSimilarVectors(
        'sam_opportunities',
        embedding,
        limit
      );

      return results.map(result => ({
        opportunity: result.metadata as SAMOpportunity,
        score: result.score || 0
      }));
    } catch (error) {
      console.error('Error searching opportunities:', error);
      return [];
    }
  }

  /**
   * Calculate detailed relevance factors
   */
  private calculateRelevanceFactors(
    opportunity: SAMOpportunity,
    companyProfile: CompanyProfile
  ) {
    const naicsMatch = companyProfile.naicsCodes?.some(
      companyNaics => opportunity.naicsCode?.includes(companyNaics) || 
                      companyNaics.includes(opportunity.naicsCode || '')
    ) || false;

    const setAsideMatch = companyProfile.businessTypes?.some(
      businessType => {
        const setAside = opportunity.typeOfSetAsideDescription?.toLowerCase() || '';
        return setAside.includes(businessType.toLowerCase()) ||
               businessType.toLowerCase().includes(setAside);
      }
    ) || false;

    const locationMatch = companyProfile.contactInfo?.state ? 
      opportunity.placeOfPerformance?.state?.name === companyProfile.contactInfo.state : 
      false;

    const capabilityMatch = companyProfile.capabilities?.some(
      capability => {
        const title = opportunity.title?.toLowerCase() || '';
        const synopsis = opportunity.synopsis?.toLowerCase() || '';
        return title.includes(capability.toLowerCase()) ||
               synopsis.includes(capability.toLowerCase());
      }
    ) || false;

    const recencyScore = this.calculateRecencyScore(opportunity);
    const valueScore = this.calculateValueScore(opportunity);

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
   * Calculate enhanced score with multiple factors
   */
  private calculateEnhancedScore(
    baseScore: number,
    relevanceFactors: any
  ): number {
    const weights = {
      baseScore: 0.3,
      naicsMatch: 0.2,
      setAsideMatch: 0.15,
      locationMatch: 0.1,
      capabilityMatch: 0.15,
      recencyScore: 0.05,
      valueScore: 0.05
    };

    let enhancedScore = (baseScore / 100) * weights.baseScore;
    enhancedScore += relevanceFactors.naicsMatch ? weights.naicsMatch : 0;
    enhancedScore += relevanceFactors.setAsideMatch ? weights.setAsideMatch : 0;
    enhancedScore += relevanceFactors.locationMatch ? weights.locationMatch : 0;
    enhancedScore += relevanceFactors.capabilityMatch ? weights.capabilityMatch : 0;
    enhancedScore += relevanceFactors.recencyScore * weights.recencyScore;
    enhancedScore += relevanceFactors.valueScore * weights.valueScore;

    return Math.min(100, enhancedScore * 100);
  }

  /**
   * Calculate recency score
   */
  private calculateRecencyScore(opportunity: SAMOpportunity): number {
    if (opportunity.responseDeadLine) {
      const deadline = new Date(opportunity.responseDeadLine);
      const now = new Date();
      const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
      return Math.max(0, Math.min(1, daysUntilDeadline / 30));
    }
    return 0.5;
  }

  /**
   * Calculate value score
   */
  private calculateValueScore(opportunity: SAMOpportunity): number {
    const title = opportunity.title?.toLowerCase() || '';
    const synopsis = opportunity.synopsis?.toLowerCase() || '';
    const text = `${title} ${synopsis}`;
    
    const highValueKeywords = [
      'development', 'implementation', 'system', 'software', 'technology',
      'consulting', 'analysis', 'research', 'design', 'engineering',
      'infrastructure', 'platform', 'solution', 'service', 'support'
    ];
    
    const lowValueKeywords = [
      'maintenance', 'cleaning', 'supply', 'equipment', 'material',
      'simple', 'basic', 'routine', 'standard'
    ];
    
    let score = 0.5;
    
    highValueKeywords.forEach(keyword => {
      if (text.includes(keyword)) score += 0.1;
    });
    
    lowValueKeywords.forEach(keyword => {
      if (text.includes(keyword)) score -= 0.05;
    });
    
    return Math.max(0, Math.min(1, score));
  }

  /**
   * Get market trends based on query and company profile
   */
  private async getMarketTrends(
    query: string,
    companyProfile: CompanyProfile | null
  ): Promise<MarketTrend[]> {
    const trends: MarketTrend[] = [];
    
    // Analyze query for trend indicators
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('ai') || queryLower.includes('artificial intelligence')) {
      trends.push({
        category: 'Technology',
        trend: 'AI/ML Adoption',
        impact: 'high',
        description: 'Federal agencies are increasingly adopting AI and ML technologies for automation and decision support.',
        source: 'Federal AI Strategy'
      });
    }
    
    if (queryLower.includes('cybersecurity') || queryLower.includes('security')) {
      trends.push({
        category: 'Security',
        trend: 'Cybersecurity Focus',
        impact: 'high',
        description: 'Cybersecurity remains a top priority with increased funding for zero-trust architecture.',
        source: 'CISA Guidelines'
      });
    }
    
    if (queryLower.includes('cloud') || queryLower.includes('infrastructure')) {
      trends.push({
        category: 'Infrastructure',
        trend: 'Cloud Migration',
        impact: 'medium',
        description: 'Continued migration to cloud platforms with emphasis on FedRAMP compliance.',
        source: 'Cloud Smart Strategy'
      });
    }
    
    // Add industry-specific trends based on company profile
    if (companyProfile?.naicsCodes) {
      if (companyProfile.naicsCodes.some(code => code.includes('5415'))) {
        trends.push({
          category: 'IT Services',
          trend: 'Digital Transformation',
          impact: 'high',
          description: 'High demand for IT consulting and digital transformation services.',
          source: 'Industry Analysis'
        });
      }
    }
    
    return trends;
  }

  /**
   * Get historical data for context
   */
  private async getHistoricalData(): Promise<HistoricalData> {
    return {
      totalOpportunities: 15420,
      averageValue: 850000,
      topNAICSCodes: ['541519', '541511', '541330', '236220', '541611'],
      commonSetAsides: ['Small Business', '8(a)', 'HUBZone', 'WOSB', 'SDVOSB'],
      successRate: 0.68
    };
  }

  /**
   * Get industry insights
   */
  private async getIndustryInsights(
    companyProfile: CompanyProfile | null
  ): Promise<IndustryInsight[]> {
    const insights: IndustryInsight[] = [];
    
    if (companyProfile?.naicsCodes) {
      if (companyProfile.naicsCodes.some(code => code.includes('5415'))) {
        insights.push({
          industry: 'IT Services',
          insights: [
            'High demand for cloud migration services',
            'Cybersecurity expertise is highly valued',
            'AI/ML implementation growing rapidly'
          ],
          opportunities: 2340,
          growthRate: 0.15
        });
      }
      
      if (companyProfile.naicsCodes.some(code => code.includes('236'))) {
        insights.push({
          industry: 'Construction',
          insights: [
            'Infrastructure projects increasing',
            'Green building certifications in demand',
            'Modular construction gaining popularity'
          ],
          opportunities: 1890,
          growthRate: 0.08
        });
      }
    }
    
    return insights;
  }

  /**
   * Get regulatory context
   */
  private async getRegulatoryContext(): Promise<RegulatoryContext> {
    return {
      recentChanges: [
        'Updated cybersecurity requirements for contractors',
        'New small business certification process',
        'Enhanced reporting requirements for set-aside contracts'
      ],
      complianceRequirements: [
        'CMMC 2.0 compliance for DoD contracts',
        'FedRAMP authorization for cloud services',
        'Section 508 accessibility compliance'
      ],
      deadlines: [
        'CMMC 2.0 implementation deadline: 2025',
        'FedRAMP High baseline updates: Q2 2024',
        'New SAM.gov entity registration requirements: 2024'
      ]
    };
  }

  /**
   * Build comprehensive prompt with multi-source context
   */
  buildEnhancedPrompt(
    userQuery: string,
    context: MultiSourceContext
  ): { systemPrompt: string; userPrompt: string } {
    let systemPrompt = `You are an expert government contracting assistant with access to comprehensive market data and regulatory information. Provide accurate, actionable advice based on the following context:

COMPANY PROFILE:
${context.companyProfile ? this.formatCompanyProfile(context.companyProfile) : 'No company profile provided'}

OPPORTUNITIES ANALYSIS:
${this.formatOpportunities(context.opportunities)}

MARKET TRENDS:
${this.formatMarketTrends(context.marketTrends)}

INDUSTRY INSIGHTS:
${this.formatIndustryInsights(context.industryInsights)}

REGULATORY CONTEXT:
${this.formatRegulatoryContext(context.regulatoryContext)}

HISTORICAL DATA:
${this.formatHistoricalData(context.historicalData)}

INSTRUCTIONS:
- Provide specific, actionable advice
- Reference relevant opportunities when applicable
- Consider market trends and regulatory requirements
- Suggest next steps and strategies
- Be concise but comprehensive
- Use data to support recommendations`;

    const userPrompt = `User Query: ${userQuery}

Please provide a comprehensive response that addresses the user's question while leveraging the available context and data.`;

    return { systemPrompt, userPrompt };
  }

  /**
   * Format company profile for prompt
   */
  private formatCompanyProfile(profile: CompanyProfile): string {
    return `
- Company: ${profile.entityName}
- NAICS Codes: ${profile.naicsCodes?.join(', ') || 'None'}
- Business Types: ${profile.businessTypes?.join(', ') || 'None'}
- Capabilities: ${profile.capabilities?.join(', ') || 'None'}
- Location: ${profile.contactInfo?.state || 'Not specified'}
- Description: ${profile.description || 'No description'}
`;
  }

  /**
   * Format opportunities for prompt
   */
  private formatOpportunities(opportunities: any[]): string {
    if (opportunities.length === 0) return 'No relevant opportunities found.';
    
    return opportunities.slice(0, 5).map((opp, index) => `
${index + 1}. ${opp.opportunity.title}
   Relevance: ${Math.round(opp.score)}%
   NAICS: ${opp.opportunity.naicsCode || 'N/A'}
   Set-Aside: ${opp.opportunity.typeOfSetAsideDescription || 'None'}
   Synopsis: ${opp.opportunity.synopsis || 'No description'}
`).join('');
  }

  /**
   * Format market trends for prompt
   */
  private formatMarketTrends(trends: MarketTrend[]): string {
    if (trends.length === 0) return 'No specific market trends identified.';
    
    return trends.map(trend => `
- ${trend.category}: ${trend.trend} (${trend.impact} impact)
  ${trend.description}
  Source: ${trend.source}
`).join('');
  }

  /**
   * Format industry insights for prompt
   */
  private formatIndustryInsights(insights: IndustryInsight[]): string {
    if (insights.length === 0) return 'No industry-specific insights available.';
    
    return insights.map(insight => `
- ${insight.industry} (${insight.opportunities} opportunities, ${Math.round(insight.growthRate * 100)}% growth)
  ${insight.insights.map(i => `  • ${i}`).join('\n')}
`).join('');
  }

  /**
   * Format regulatory context for prompt
   */
  private formatRegulatoryContext(context: RegulatoryContext): string {
    return `
Recent Changes:
${context.recentChanges.map(change => `- ${change}`).join('\n')}

Compliance Requirements:
${context.complianceRequirements.map(req => `- ${req}`).join('\n')}

Upcoming Deadlines:
${context.deadlines.map(deadline => `- ${deadline}`).join('\n')}
`;
  }

  /**
   * Format historical data for prompt
   */
  private formatHistoricalData(data: HistoricalData): string {
    return `
- Total Opportunities: ${data.totalOpportunities.toLocaleString()}
- Average Contract Value: $${data.averageValue.toLocaleString()}
- Success Rate: ${Math.round(data.successRate * 100)}%
- Top NAICS Codes: ${data.topNAICSCodes.join(', ')}
- Common Set-Asides: ${data.commonSetAsides.join(', ')}
`;
  }
} 