
import { supabase } from '@/integrations/supabase/client';

export interface PlayerSegment {
  id: string;
  userId: string;
  segmentType: string;
  segmentValue: string;
  confidenceScore: number;
}

export interface ABTest {
  id: string;
  testName: string;
  description?: string;
  testConfig: any;
  startDate: string;
  endDate?: string;
  status: 'draft' | 'active' | 'completed' | 'paused';
  successMetrics: any;
}

export interface PlayerLTV {
  userId: string;
  predictedLtv: number;
  currentValue: number;
  ltvSegment: string;
  calculationMethod: string;
  factors: any;
}

export interface ChurnPrediction {
  userId: string;
  churnProbability: number;
  churnRiskLevel: 'low' | 'medium' | 'high';
  predictionFactors: any;
  recommendedActions: string[];
}

class AdvancedAnalyticsService {

  async segmentPlayers(): Promise<void> {
    try {
      // Get all active users
      const { data: users } = await supabase
        .from('users')
        .select('id')
        .eq('status', 'active');

      if (!users) return;

      for (const user of users) {
        await this.calculatePlayerSegments(user.id);
      }
    } catch (error) {
      console.error('Error segmenting players:', error);
    }
  }

  async calculatePlayerSegments(userId: string): Promise<PlayerSegment[]> {
    try {
      const segments = [];

      // Value segment based on total deposits/activity
      const valueSegment = await this.calculateValueSegment(userId);
      if (valueSegment) {
        segments.push(valueSegment);
      }

      // Activity segment based on frequency
      const activitySegment = await this.calculateActivitySegment(userId);
      if (activitySegment) {
        segments.push(activitySegment);
      }

      // Risk segment based on behavior
      const riskSegment = await this.calculateRiskSegment(userId);
      if (riskSegment) {
        segments.push(riskSegment);
      }

      // Store segments in database
      for (const segment of segments) {
        await this.storePlayerSegment(segment);
      }

      return segments;
    } catch (error) {
      console.error('Error calculating player segments:', error);
      return [];
    }
  }

  async calculatePlayerLTV(userId: string): Promise<PlayerLTV> {
    try {
      // Get player's transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId)
        .order('created_at', { ascending: true });

      const currentValue = this.calculateCurrentValue(transactions || []);
      const ltvFactors = await this.analyzeLTVFactors(userId, transactions || []);
      const predictedLtv = this.predictLTV(ltvFactors);
      const ltvSegment = this.categorizeLTVSegment(predictedLtv);

      const ltv: PlayerLTV = {
        userId,
        predictedLtv,
        currentValue,
        ltvSegment,
        calculationMethod: 'behavioral_cohort_analysis',
        factors: ltvFactors
      };

      // Store LTV calculation
      await supabase
        .from('player_ltv')
        .upsert({
          user_id: userId,
          predicted_ltv: predictedLtv,
          current_value: currentValue,
          ltv_segment: ltvSegment,
          calculation_method: 'behavioral_cohort_analysis',
          factors: ltvFactors,
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        });

      return ltv;
    } catch (error) {
      console.error('Error calculating player LTV:', error);
      throw error;
    }
  }

  async predictChurn(userId: string): Promise<ChurnPrediction> {
    try {
      const churnFactors = await this.analyzeChurnFactors(userId);
      const churnProbability = this.calculateChurnProbability(churnFactors);
      const riskLevel = this.categorizeChurnRisk(churnProbability);
      const recommendedActions = this.generateChurnPreventionActions(churnFactors, riskLevel);

      const prediction: ChurnPrediction = {
        userId,
        churnProbability,
        churnRiskLevel: riskLevel,
        predictionFactors: churnFactors,
        recommendedActions
      };

      // Store churn prediction
      await supabase
        .from('churn_predictions')
        .upsert({
          user_id: userId,
          churn_probability: churnProbability,
          churn_risk_level: riskLevel,
          prediction_factors: churnFactors,
          recommended_actions: recommendedActions,
          model_version: 'v1.0',
          expires_at: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() // 3 days
        });

      return prediction;
    } catch (error) {
      console.error('Error predicting churn:', error);
      throw error;
    }
  }

  async createABTest(testConfig: {
    name: string;
    description?: string;
    variants: any[];
    targetSegments: string[];
    successMetrics: any;
    duration: number;
  }): Promise<ABTest> {
    try {
      const startDate = new Date();
      const endDate = new Date(startDate.getTime() + testConfig.duration);

      const { data, error } = await supabase
        .from('ab_tests')
        .insert({
          test_name: testConfig.name,
          description: testConfig.description,
          test_config: {
            variants: testConfig.variants,
            allocation: this.calculateVariantAllocation(testConfig.variants)
          },
          start_date: startDate.toISOString(),
          end_date: endDate.toISOString(),
          status: 'draft',
          target_segments: testConfig.targetSegments,
          success_metrics: testConfig.successMetrics
        })
        .select()
        .single();

      if (error) throw error;

      return this.mapABTest(data);
    } catch (error) {
      console.error('Error creating A/B test:', error);
      throw error;
    }
  }

  async enrollUserInABTest(testId: string, userId: string): Promise<string> {
    try {
      // Check if user is already enrolled
      const { data: existing } = await supabase
        .from('ab_test_participants')
        .select('variant')
        .eq('test_id', testId)
        .eq('user_id', userId)
        .single();

      if (existing) {
        return existing.variant;
      }

      // Get test configuration
      const { data: test } = await supabase
        .from('ab_tests')
        .select('test_config, target_segments')
        .eq('id', testId)
        .single();

      if (!test) throw new Error('Test not found');

      // Check if user matches target segments
      const userSegments = await this.getUserSegments(userId);
      const matchesTarget = this.checkSegmentMatch(userSegments, test.target_segments);

      if (!matchesTarget) {
        return 'control'; // Default to control if not in target segment
      }

      // Assign variant based on allocation
      const variant = this.assignVariant(test.test_config.variants, userId);

      // Enroll user
      await supabase
        .from('ab_test_participants')
        .insert({
          test_id: testId,
          user_id: userId,
          variant
        });

      return variant;
    } catch (error) {
      console.error('Error enrolling user in A/B test:', error);
      return 'control';
    }
  }

  async trackConversion(testId: string, userId: string, conversionValue: number = 0): Promise<void> {
    try {
      await supabase
        .from('ab_test_participants')
        .update({
          converted: true,
          conversion_value: conversionValue
        })
        .eq('test_id', testId)
        .eq('user_id', userId);
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }

  async logPerformanceMetric(
    metricType: string,
    metricName: string,
    value: number,
    tags: Record<string, any> = {},
    source: string = 'application'
  ): Promise<void> {
    try {
      await supabase
        .from('performance_metrics')
        .insert({
          metric_type: metricType,
          metric_name: metricName,
          value,
          tags,
          source
        });
    } catch (error) {
      console.error('Error logging performance metric:', error);
    }
  }

  async logError(
    errorType: string,
    errorMessage: string,
    stackTrace?: string,
    context: any = {},
    userId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('error_logs')
        .insert({
          error_type: errorType,
          error_message: errorMessage,
          stack_trace: stackTrace,
          user_id: userId,
          additional_context: context,
          request_url: window.location.href,
          user_agent: navigator.userAgent
        });
    } catch (error) {
      console.error('Error logging error:', error);
    }
  }

  private async calculateValueSegment(userId: string): Promise<PlayerSegment | null> {
    try {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('total_bet, balance')
        .eq('user_id', userId)
        .single();

      if (!wallet) return null;

      const totalValue = wallet.total_bet + wallet.balance;
      let segment = 'low_value';
      let confidence = 0.8;

      if (totalValue > 10000) {
        segment = 'whale';
        confidence = 0.95;
      } else if (totalValue > 1000) {
        segment = 'high_value';
        confidence = 0.9;
      } else if (totalValue > 100) {
        segment = 'medium_value';
        confidence = 0.85;
      }

      return {
        id: '',
        userId,
        segmentType: 'value',
        segmentValue: segment,
        confidenceScore: confidence
      };
    } catch (error) {
      console.error('Error calculating value segment:', error);
      return null;
    }
  }

  private async calculateActivitySegment(userId: string): Promise<PlayerSegment | null> {
    // Mock implementation - analyze user activity patterns
    return {
      id: '',
      userId,
      segmentType: 'activity',
      segmentValue: 'regular',
      confidenceScore: 0.8
    };
  }

  private async calculateRiskSegment(userId: string): Promise<PlayerSegment | null> {
    const { data: wallet } = await supabase
      .from('wallets')
      .select('aml_risk_score')
      .eq('user_id', userId)
      .single();

    if (!wallet) return null;

    let segment = 'low_risk';
    if (wallet.aml_risk_score > 70) segment = 'high_risk';
    else if (wallet.aml_risk_score > 40) segment = 'medium_risk';

    return {
      id: '',
      userId,
      segmentType: 'risk',
      segmentValue: segment,
      confidenceScore: 0.9
    };
  }

  private async storePlayerSegment(segment: PlayerSegment): Promise<void> {
    await supabase
      .from('player_segments')
      .upsert({
        user_id: segment.userId,
        segment_type: segment.segmentType,
        segment_value: segment.segmentValue,
        confidence_score: segment.confidenceScore,
        valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      });
  }

  private calculateCurrentValue(transactions: any[]): number {
    return transactions
      .filter(t => t.type === 'deposit')
      .reduce((sum, t) => sum + parseFloat(t.amount), 0);
  }

  private async analyzeLTVFactors(userId: string, transactions: any[]): Promise<any> {
    return {
      averageDepositAmount: this.calculateAverageDeposit(transactions),
      depositFrequency: this.calculateDepositFrequency(transactions),
      gamePreference: await this.getGamePreferences(userId),
      accountAge: await this.getAccountAge(userId),
      bonusUsage: await this.getBonusUsagePattern(userId)
    };
  }

  private predictLTV(factors: any): number {
    // Simplified LTV prediction model
    const baseValue = factors.averageDepositAmount * 12; // Annualized
    const frequencyMultiplier = Math.min(factors.depositFrequency, 2);
    const loyaltyBonus = factors.accountAge > 365 ? 1.2 : 1.0;
    
    return baseValue * frequencyMultiplier * loyaltyBonus;
  }

  private categorizeLTVSegment(ltv: number): string {
    if (ltv > 5000) return 'platinum';
    if (ltv > 1000) return 'gold';
    if (ltv > 500) return 'silver';
    return 'bronze';
  }

  private async analyzeChurnFactors(userId: string): Promise<any> {
    // Mock churn factor analysis
    return {
      daysSinceLastLogin: Math.floor(Math.random() * 30),
      depositDeclineRate: Math.random(),
      supportTickets: Math.floor(Math.random() * 5),
      gameEngagement: Math.random(),
      bonusDeclineRate: Math.random()
    };
  }

  private calculateChurnProbability(factors: any): number {
    let probability = 0;
    
    // Days since last login
    if (factors.daysSinceLastLogin > 14) probability += 0.3;
    else if (factors.daysSinceLastLogin > 7) probability += 0.15;
    
    // Deposit decline
    if (factors.depositDeclineRate > 0.5) probability += 0.25;
    
    // Support issues
    if (factors.supportTickets > 2) probability += 0.2;
    
    // Game engagement
    if (factors.gameEngagement < 0.3) probability += 0.25;
    
    return Math.min(probability, 1.0);
  }

  private categorizeChurnRisk(probability: number): 'low' | 'medium' | 'high' {
    if (probability > 0.7) return 'high';
    if (probability > 0.4) return 'medium';
    return 'low';
  }

  private generateChurnPreventionActions(factors: any, riskLevel: string): string[] {
    const actions = [];
    
    if (riskLevel === 'high') {
      actions.push('Send personalized retention offer');
      actions.push('Assign dedicated account manager');
      actions.push('Provide exclusive bonuses');
    } else if (riskLevel === 'medium') {
      actions.push('Send re-engagement email');
      actions.push('Offer deposit bonus');
      actions.push('Recommend popular games');
    }
    
    return actions;
  }

  private calculateVariantAllocation(variants: any[]): any {
    const allocation = {};
    const equalShare = 1 / variants.length;
    
    variants.forEach(variant => {
      allocation[variant.name] = variant.allocation || equalShare;
    });
    
    return allocation;
  }

  private async getUserSegments(userId: string): Promise<string[]> {
    const { data: segments } = await supabase
      .from('player_segments')
      .select('segment_value')
      .eq('user_id', userId);

    return segments?.map(s => s.segment_value) || [];
  }

  private checkSegmentMatch(userSegments: string[], targetSegments: string[]): boolean {
    if (targetSegments.length === 0) return true; // No targeting
    return targetSegments.some(target => userSegments.includes(target));
  }

  private assignVariant(variants: any[], userId: string): string {
    // Use user ID for consistent assignment
    const hash = this.hashUserId(userId);
    const index = hash % variants.length;
    return variants[index].name;
  }

  private hashUserId(userId: string): number {
    let hash = 0;
    for (let i = 0; i < userId.length; i++) {
      const char = userId.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  private calculateAverageDeposit(transactions: any[]): number {
    const deposits = transactions.filter(t => t.type === 'deposit');
    if (deposits.length === 0) return 0;
    return deposits.reduce((sum, t) => sum + parseFloat(t.amount), 0) / deposits.length;
  }

  private calculateDepositFrequency(transactions: any[]): number {
    const deposits = transactions.filter(t => t.type === 'deposit');
    if (deposits.length < 2) return 0;
    
    const firstDeposit = new Date(deposits[0].created_at);
    const lastDeposit = new Date(deposits[deposits.length - 1].created_at);
    const daysDiff = (lastDeposit.getTime() - firstDeposit.getTime()) / (1000 * 60 * 60 * 24);
    
    return deposits.length / Math.max(daysDiff, 1);
  }

  private async getGamePreferences(userId: string): Promise<any> {
    // Mock game preferences analysis
    return { primaryCategory: 'slots', diversityScore: 0.7 };
  }

  private async getAccountAge(userId: string): Promise<number> {
    const { data: user } = await supabase
      .from('users')
      .select('created_at')
      .eq('id', userId)
      .single();

    if (!user) return 0;
    
    const createdAt = new Date(user.created_at);
    return (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  }

  private async getBonusUsagePattern(userId: string): Promise<any> {
    // Mock bonus usage analysis
    return { acceptanceRate: 0.8, completionRate: 0.6 };
  }

  private mapABTest(data: any): ABTest {
    return {
      id: data.id,
      testName: data.test_name,
      description: data.description,
      testConfig: data.test_config,
      startDate: data.start_date,
      endDate: data.end_date,
      status: data.status,
      successMetrics: data.success_metrics
    };
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;
