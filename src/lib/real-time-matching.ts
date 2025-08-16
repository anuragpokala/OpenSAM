import { CompanyProfile, SAMOpportunity } from '@/types';
import { chatCache } from './chat-cache';
import { vectorStoreServerUtils } from './vectorStore-server';

export interface MatchAlert {
  id: string;
  companyProfileId: string;
  opportunity: SAMOpportunity;
  matchScore: number;
  relevanceFactors: MatchRelevanceFactors;
  alertType: 'high_match' | 'new_opportunity' | 'deadline_approaching' | 'set_aside_match';
  priority: 'high' | 'medium' | 'low';
  timestamp: number;
  read: boolean;
  actionTaken?: string;
}

export interface MatchRelevanceFactors {
  naicsMatch: boolean;
  setAsideMatch: boolean;
  locationMatch: boolean;
  capabilityMatch: boolean;
  recencyScore: number;
  valueScore: number;
  deadlineUrgency: number;
}

export interface MatchingConfig {
  checkInterval: number; // milliseconds
  minMatchScore: number; // 0-100
  maxAlertsPerProfile: number;
  enableNotifications: boolean;
  autoRefresh: boolean;
}

/**
 * Real-time opportunity matching system
 */
export class RealTimeMatcher {
  private static instance: RealTimeMatcher;
  private alerts: Map<string, MatchAlert[]> = new Map();
  private config: MatchingConfig;
  private intervalId: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  private constructor() {
    this.config = {
      checkInterval: 5 * 60 * 1000, // 5 minutes
      minMatchScore: 70,
      maxAlertsPerProfile: 10,
      enableNotifications: true,
      autoRefresh: true
    };
  }

  static getInstance(): RealTimeMatcher {
    if (!RealTimeMatcher.instance) {
      RealTimeMatcher.instance = new RealTimeMatcher();
    }
    return RealTimeMatcher.instance;
  }

  /**
   * Start real-time matching for a company profile
   */
  async startMatching(companyProfile: CompanyProfile): Promise<void> {
    if (this.isRunning) {
      console.log('Real-time matching already running');
      return;
    }

    this.isRunning = true;
    console.log(`🚀 Starting real-time matching for ${companyProfile.entityName}`);

    // Initial match
    await this.performMatch(companyProfile);

    // Set up interval for continuous matching
    this.intervalId = setInterval(async () => {
      await this.performMatch(companyProfile);
    }, this.config.checkInterval);
  }

  /**
   * Stop real-time matching
   */
  stopMatching(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    console.log('🛑 Stopped real-time matching');
  }

  /**
   * Perform matching for a company profile
   */
  private async performMatch(companyProfile: CompanyProfile): Promise<void> {
    try {
      console.log(`🔍 Performing real-time match for ${companyProfile.entityName}`);
      
      // Get recent opportunities
      const opportunities = await this.getRecentOpportunities();
      
      // Match opportunities with company profile
      const matches = await this.matchOpportunities(companyProfile, opportunities);
      
      // Generate alerts for high-quality matches
      const alerts = this.generateAlerts(companyProfile, matches);
      
      // Store alerts
      this.storeAlerts(companyProfile.id, alerts);
      
      // Send notifications if enabled
      if (this.config.enableNotifications && alerts.length > 0) {
        this.sendNotifications(alerts);
      }

      console.log(`✅ Found ${matches.length} matches, generated ${alerts.length} alerts`);
    } catch (error) {
      console.error('Error in real-time matching:', error);
    }
  }

  /**
   * Get recent opportunities from vector store
   */
  private async getRecentOpportunities(): Promise<SAMOpportunity[]> {
    try {
      // Get all opportunities from vector store
      const results = await vectorStoreServerUtils.getAllVectors('sam_opportunities');
      
      return results.map(result => result.metadata as SAMOpportunity);
    } catch (error) {
      console.error('Error getting recent opportunities:', error);
      return [];
    }
  }

  /**
   * Match opportunities with company profile
   */
  private async matchOpportunities(
    companyProfile: CompanyProfile,
    opportunities: SAMOpportunity[]
  ): Promise<Array<{ opportunity: SAMOpportunity; score: number; factors: MatchRelevanceFactors }>> {
    const matches: Array<{ opportunity: SAMOpportunity; score: number; factors: MatchRelevanceFactors }> = [];

    for (const opportunity of opportunities) {
      const factors = this.calculateRelevanceFactors(opportunity, companyProfile);
      const score = this.calculateMatchScore(factors);
      
      if (score >= this.config.minMatchScore) {
        matches.push({
          opportunity,
          score,
          factors
        });
      }
    }

    // Sort by score (highest first)
    return matches.sort((a, b) => b.score - a.score);
  }

  /**
   * Calculate relevance factors for an opportunity
   */
  private calculateRelevanceFactors(
    opportunity: SAMOpportunity,
    companyProfile: CompanyProfile
  ): MatchRelevanceFactors {
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

    // Location Matching
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

    // Recency Score
    const recencyScore = this.calculateRecencyScore(opportunity);

    // Value Score
    const valueScore = this.calculateValueScore(opportunity);

    // Deadline Urgency
    const deadlineUrgency = this.calculateDeadlineUrgency(opportunity);

    return {
      naicsMatch,
      setAsideMatch,
      locationMatch,
      capabilityMatch,
      recencyScore,
      valueScore,
      deadlineUrgency
    };
  }

  /**
   * Calculate overall match score
   */
  private calculateMatchScore(factors: MatchRelevanceFactors): number {
    const weights = {
      naicsMatch: 0.25,
      setAsideMatch: 0.20,
      locationMatch: 0.15,
      capabilityMatch: 0.20,
      recencyScore: 0.10,
      valueScore: 0.10
    };

    let score = 0;
    score += factors.naicsMatch ? weights.naicsMatch : 0;
    score += factors.setAsideMatch ? weights.setAsideMatch : 0;
    score += factors.locationMatch ? weights.locationMatch : 0;
    score += factors.capabilityMatch ? weights.capabilityMatch : 0;
    score += factors.recencyScore * weights.recencyScore;
    score += factors.valueScore * weights.valueScore;

    return Math.min(100, score * 100);
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
   * Calculate deadline urgency
   */
  private calculateDeadlineUrgency(opportunity: SAMOpportunity): number {
    if (!opportunity.responseDeadLine) return 0;
    
    const deadline = new Date(opportunity.responseDeadLine);
    const now = new Date();
    const daysUntilDeadline = (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysUntilDeadline <= 0) return 1; // Past deadline
    if (daysUntilDeadline <= 7) return 0.9; // Very urgent
    if (daysUntilDeadline <= 14) return 0.7; // Urgent
    if (daysUntilDeadline <= 30) return 0.5; // Moderate
    return 0.3; // Not urgent
  }

  /**
   * Generate alerts from matches
   */
  private generateAlerts(
    companyProfile: CompanyProfile,
    matches: Array<{ opportunity: SAMOpportunity; score: number; factors: MatchRelevanceFactors }>
  ): MatchAlert[] {
    const alerts: MatchAlert[] = [];
    const existingAlerts = this.alerts.get(companyProfile.id) || [];
    const existingOpportunityIds = new Set(existingAlerts.map(alert => alert.opportunity.id));

    for (const match of matches) {
      // Skip if we already have an alert for this opportunity
      if (existingOpportunityIds.has(match.opportunity.id)) continue;

      const alert = this.createAlert(companyProfile, match);
      if (alert) {
        alerts.push(alert);
      }
    }

    return alerts;
  }

  /**
   * Create an alert from a match
   */
  private createAlert(
    companyProfile: CompanyProfile,
    match: { opportunity: SAMOpportunity; score: number; factors: MatchRelevanceFactors }
  ): MatchAlert | null {
    const { opportunity, score, factors } = match;
    
    // Determine alert type and priority
    let alertType: MatchAlert['alertType'] = 'new_opportunity';
    let priority: MatchAlert['priority'] = 'medium';

    if (score >= 90) {
      alertType = 'high_match';
      priority = 'high';
    } else if (factors.setAsideMatch) {
      alertType = 'set_aside_match';
      priority = 'high';
    } else if (factors.deadlineUrgency >= 0.7) {
      alertType = 'deadline_approaching';
      priority = 'high';
    }

    return {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      companyProfileId: companyProfile.id,
      opportunity,
      matchScore: score,
      relevanceFactors: factors,
      alertType,
      priority,
      timestamp: Date.now(),
      read: false
    };
  }

  /**
   * Store alerts for a company profile
   */
  private storeAlerts(companyProfileId: string, newAlerts: MatchAlert[]): void {
    const existingAlerts = this.alerts.get(companyProfileId) || [];
    const allAlerts = [...existingAlerts, ...newAlerts];
    
    // Keep only the most recent alerts up to the limit
    const sortedAlerts = allAlerts.sort((a, b) => b.timestamp - a.timestamp);
    const limitedAlerts = sortedAlerts.slice(0, this.config.maxAlertsPerProfile);
    
    this.alerts.set(companyProfileId, limitedAlerts);
  }

  /**
   * Send notifications for alerts
   */
  private sendNotifications(alerts: MatchAlert[]): void {
    if (!this.config.enableNotifications) return;

    alerts.forEach(alert => {
      const message = this.formatAlertMessage(alert);
      console.log(`🔔 Alert: ${message}`);
      
      // In a real implementation, this would send browser notifications
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification('OpenSAM Opportunity Match', {
          body: message,
          icon: '/favicon.ico'
        });
      }
    });
  }

  /**
   * Format alert message
   */
  private formatAlertMessage(alert: MatchAlert): string {
    const { opportunity, matchScore, alertType } = alert;
    
    switch (alertType) {
      case 'high_match':
        return `High match (${Math.round(matchScore)}%): ${opportunity.title}`;
      case 'set_aside_match':
        return `Set-aside opportunity: ${opportunity.title}`;
      case 'deadline_approaching':
        return `Deadline approaching: ${opportunity.title}`;
      case 'new_opportunity':
        return `New opportunity (${Math.round(matchScore)}%): ${opportunity.title}`;
      default:
        return `Opportunity match: ${opportunity.title}`;
    }
  }

  /**
   * Get alerts for a company profile
   */
  getAlerts(companyProfileId: string): MatchAlert[] {
    return this.alerts.get(companyProfileId) || [];
  }

  /**
   * Mark alert as read
   */
  markAlertAsRead(alertId: string, companyProfileId: string): void {
    const alerts = this.alerts.get(companyProfileId);
    if (alerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.read = true;
      }
    }
  }

  /**
   * Mark alert as action taken
   */
  markAlertActionTaken(alertId: string, companyProfileId: string, action: string): void {
    const alerts = this.alerts.get(companyProfileId);
    if (alerts) {
      const alert = alerts.find(a => a.id === alertId);
      if (alert) {
        alert.actionTaken = action;
        alert.read = true;
      }
    }
  }

  /**
   * Clear alerts for a company profile
   */
  clearAlerts(companyProfileId: string): void {
    this.alerts.delete(companyProfileId);
  }

  /**
   * Update matching configuration
   */
  updateConfig(newConfig: Partial<MatchingConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart matching if interval changed
    if (this.isRunning && newConfig.checkInterval) {
      this.stopMatching();
      // Note: Would need to restart with the company profile
    }
  }

  /**
   * Get matching statistics
   */
  getStats(): {
    isRunning: boolean;
    totalAlerts: number;
    activeProfiles: number;
    lastCheck: number;
  } {
    const totalAlerts = Array.from(this.alerts.values()).reduce(
      (sum, alerts) => sum + alerts.length, 0
    );
    
    return {
      isRunning: this.isRunning,
      totalAlerts,
      activeProfiles: this.alerts.size,
      lastCheck: Date.now()
    };
  }
} 