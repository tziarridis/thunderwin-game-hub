
import { supabase } from '@/integrations/supabase/client';

export interface PlayerSegment {
  id: string;
  userId: string;
  segmentType: string;
  segmentValue: string;
  confidenceScore: number;
  calculatedAt: string;
}

export interface ABTest {
  id: string;
  testName: string;
  description?: string;
  testConfig: any;
  status: string;
  startDate: string;
  endDate?: string;
  participants?: number;
  conversionRate?: number;
}

export interface PlayerLTV {
  id: string;
  userId: string;
  predictedLtv: number;
  currentValue: number;
  ltvSegment: string;
  calculationMethod: string;
  factors: any;
}

export interface ChurnPrediction {
  id: string;
  userId: string;
  churnProbability: number;
  churnRiskLevel: string;
  predictionFactors: any;
  recommendedActions: string[];
}

class AdvancedAnalyticsService {
  
  async getDashboardMetrics(): Promise<any> {
    try {
      // Get basic metrics from transactions and users
      const { data: revenueData } = await supabase
        .from('transactions')
        .select('amount')
        .eq('status', 'completed')
        .eq('type', 'deposit');

      const { data: userData } = await supabase
        .from('users')
        .select('id, created_at');

      const { data: ltvData } = await supabase
        .from('player_ltv')
        .select('predicted_ltv, current_value');

      const { data: churnData } = await supabase
        .from('churn_predictions')
        .select('churn_risk_level');

      const totalRevenue = revenueData?.reduce((sum, t) => sum + (t.amount || 0), 0) || 0;
      const activePlayers = userData?.length || 0;
      const avgLTV = ltvData?.length ? 
        ltvData.reduce((sum, ltv) => sum + (ltv.predicted_ltv || 0), 0) / ltvData.length : 0;

      const highRiskChurn = churnData?.filter(c => c.churn_risk_level === 'high').length || 0;
      const mediumRiskChurn = churnData?.filter(c => c.churn_risk_level === 'medium').length || 0;
      const lowRiskChurn = churnData?.filter(c => c.churn_risk_level === 'low').length || 0;

      return {
        totalRevenue,
        activePlayers,
        avgLTV,
        conversionRate: 12.5, // Mock data
        revenueGrowth: 15.2, // Mock data
        playerGrowth: 8.7, // Mock data
        highRiskChurn,
        mediumRiskChurn,
        lowRiskChurn
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return {};
    }
  }

  async getPlayerSegments(): Promise<PlayerSegment[]> {
    try {
      const { data, error } = await supabase
        .from('player_segments')
        .select('*')
        .order('calculated_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map(segment => ({
        id: segment.id,
        userId: segment.user_id,
        segmentType: segment.segment_type,
        segmentValue: segment.segment_value,
        confidenceScore: segment.confidence_score,
        calculatedAt: segment.calculated_at
      })) || [];
    } catch (error) {
      console.error('Error fetching player segments:', error);
      return [];
    }
  }

  async getActiveABTests(): Promise<ABTest[]> {
    try {
      const { data, error } = await supabase
        .from('ab_tests')
        .select(`
          *,
          ab_test_participants!inner(count)
        `)
        .in('status', ['active', 'draft'])
        .order('created_at', { ascending: false });

      if (error) throw error;

      return data?.map(test => {
        const config = test.test_config as any;
        const participantCount = Array.isArray(test.ab_test_participants) 
          ? test.ab_test_participants.length 
          : 0;

        return {
          id: test.id,
          testName: test.test_name,
          description: test.description,
          testConfig: config,
          status: test.status,
          startDate: test.start_date,
          endDate: test.end_date,
          participants: participantCount,
          conversionRate: Math.random() * 15 // Mock conversion rate
        };
      }) || [];
    } catch (error) {
      console.error('Error fetching A/B tests:', error);
      return [];
    }
  }

  async getPlayerLTVAnalysis(): Promise<PlayerLTV[]> {
    try {
      const { data, error } = await supabase
        .from('player_ltv')
        .select('*')
        .order('predicted_ltv', { ascending: false })
        .limit(20);

      if (error) throw error;

      return data?.map(ltv => ({
        id: ltv.id,
        userId: ltv.user_id,
        predictedLtv: ltv.predicted_ltv,
        currentValue: ltv.current_value,
        ltvSegment: ltv.ltv_segment,
        calculationMethod: ltv.calculation_method,
        factors: ltv.factors
      })) || [];
    } catch (error) {
      console.error('Error fetching LTV analysis:', error);
      return [];
    }
  }

  async calculatePlayerLTV(userId: string): Promise<PlayerLTV | null> {
    try {
      // Get player transaction history
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('player_id', userId)
        .eq('status', 'completed');

      if (!transactions || transactions.length === 0) {
        return null;
      }

      // Calculate current value
      const deposits = transactions.filter(t => t.type === 'deposit');
      const currentValue = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);

      // Simple LTV prediction (in production, use ML models)
      const avgMonthlyDeposit = currentValue / Math.max(1, this.getMonthsSinceFirstDeposit(transactions));
      const predictedLifespanMonths = 12; // Assume 12 months average lifespan
      const predictedLtv = avgMonthlyDeposit * predictedLifespanMonths;

      // Determine segment
      let ltvSegment = 'low';
      if (predictedLtv > 1000) ltvSegment = 'high';
      else if (predictedLtv > 500) ltvSegment = 'medium';

      // Save to database
      const { data, error } = await supabase
        .from('player_ltv')
        .upsert({
          user_id: userId,
          predicted_ltv: predictedLtv,
          current_value: currentValue,
          ltv_segment: ltvSegment,
          calculation_method: 'simple_average',
          factors: {
            avg_monthly_deposit: avgMonthlyDeposit,
            total_deposits: deposits.length,
            account_age_months: this.getMonthsSinceFirstDeposit(transactions)
          },
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select()
        .single();

      if (error) throw error;

      return {
        id: data.id,
        userId: data.user_id,
        predictedLtv: data.predicted_ltv,
        currentValue: data.current_value,
        ltvSegment: data.ltv_segment,
        calculationMethod: data.calculation_method,
        factors: data.factors
      };
    } catch (error) {
      console.error('Error calculating player LTV:', error);
      return null;
    }
  }

  async predictPlayerChurn(userId: string): Promise<ChurnPrediction | null> {
    try {
      // Get recent player activity
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('player_id', userId) // Assuming player_id in transactions is the same as user_id
        .gte('created_at', thirtyDaysAgo.toISOString());

      // Corrected table name from 'user_sessions' to 'game_sessions'
      const { data: recentSessions } = await supabase
        .from('game_sessions') 
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', thirtyDaysAgo.toISOString()); // Assuming 'started_at' for game_sessions

      // Simple churn prediction logic (replace with ML model in production)
      let churnScore = 0;
      
      // Factor 1: Recent activity
      if (!recentTransactions || recentTransactions.length === 0) churnScore += 0.3;
      if (!recentSessions || recentSessions.length < 5) churnScore += 0.2;

      // Factor 2: Declining trend
      const weeklyActivity = this.calculateWeeklyActivity(recentSessions || []);
      if (weeklyActivity.isDecreasing) churnScore += 0.3;

      // Factor 3: Support tickets or complaints
      // (Would check support_tickets table in real implementation)
      
      let riskLevel = 'low';
      if (churnScore > 0.7) riskLevel = 'high';
      else if (churnScore > 0.4) riskLevel = 'medium';

      const recommendedActions = this.getChurnPreventionActions(riskLevel, churnScore);

      // Save prediction
      const { data, error } = await supabase
        .from('churn_predictions')
        .upsert({
          user_id: userId,
          churn_probability: churnScore,
          churn_risk_level: riskLevel,
          prediction_factors: {
            recent_transactions: recentTransactions?.length || 0,
            recent_sessions: recentSessions?.length || 0,
            activity_trend: weeklyActivity.trend
          },
          recommended_actions: recommendedActions as any[], // Cast to any[] if Supabase type is Json[]
          model_version: 'v1.0',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
        .select()
        .single();

      if (error) throw error;

      // Ensure recommendedActions is string[]
      let finalRecommendedActions: string[] = [];
      if (Array.isArray(data.recommended_actions)) {
        finalRecommendedActions = data.recommended_actions.map(String);
      }


      return {
        id: data.id,
        userId: data.user_id,
        churnProbability: data.churn_probability,
        churnRiskLevel: data.churn_risk_level,
        predictionFactors: data.prediction_factors,
        recommendedActions: finalRecommendedActions
      };
    } catch (error) {
      console.error('Error predicting churn:', error);
      return null;
    }
  }

  async segmentPlayer(userId: string): Promise<void> {
    try {
      // Get player data for segmentation
      const { data: user } = await supabase
        .from('users')
        .select('created_at')
        .eq('id', userId)
        .single();

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('player_id', userId)
        .eq('status', 'completed');

      if (!user || !transactions) return;

      // Calculate segments
      const segments = this.calculatePlayerSegments(user, transactions);

      // Save segments
      for (const segment of segments) {
        await supabase
          .from('player_segments')
          .upsert({
            user_id: userId,
            segment_type: segment.type,
            segment_value: segment.value,
            confidence_score: segment.confidence,
            calculated_at: new Date().toISOString(),
            valid_until: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
          });
      }
    } catch (error) {
      console.error('Error segmenting player:', error);
    }
  }

  private getMonthsSinceFirstDeposit(transactions: any[]): number {
    if (!transactions.length) return 1;
    
    const firstDeposit = transactions
      .filter(t => t.type === 'deposit')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    
    if (!firstDeposit) return 1;
    
    const months = (Date.now() - new Date(firstDeposit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(1, Math.round(months));
  }

  private calculateWeeklyActivity(sessions: any[]): { isDecreasing: boolean; trend: string } {
    if (sessions.length < 14) return { isDecreasing: false, trend: 'insufficient_data' };

    const weeks = this.groupSessionsByWeek(sessions);
    const weeklyTotals = weeks.map(week => week.length);
    
    if (weeklyTotals.length < 2) return { isDecreasing: false, trend: 'insufficient_data' };

    const recentWeek = weeklyTotals[weeklyTotals.length - 1];
    const previousWeek = weeklyTotals[weeklyTotals.length - 2];
    
    return {
      isDecreasing: recentWeek < previousWeek * 0.7, // 30% decrease
      trend: recentWeek > previousWeek ? 'increasing' : 'decreasing'
    };
  }

  private groupSessionsByWeek(sessions: any[]): any[][] {
    const weeks: any[][] = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) {
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekSessions = sessions.filter(session => {
        const sessionDate = new Date(session.created_at);
        return sessionDate >= weekStart && sessionDate < weekEnd;
      });
      
      weeks.unshift(weekSessions);
    }
    
    return weeks;
  }

  private getChurnPreventionActions(riskLevel: string, churnScore: number): string[] {
    const actions: string[] = [];
    
    if (riskLevel === 'high') {
      actions.push('Send personalized bonus offer');
      actions.push('Reach out via customer support');
      actions.push('Offer VIP upgrade');
    } else if (riskLevel === 'medium') {
      actions.push('Send re-engagement email');
      actions.push('Offer free spins');
      actions.push('Show personalized game recommendations');
    } else {
      actions.push('Continue standard marketing');
      actions.push('Monitor activity');
    }
    
    return actions;
  }

  private calculatePlayerSegments(user: any, transactions: any[]): any[] {
    const segments = [];
    const deposits = transactions.filter(t => t.type === 'deposit');
    const totalDeposited = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);
    
    // Value segment
    if (totalDeposited > 1000) {
      segments.push({ type: 'value', value: 'high_value', confidence: 0.95 });
    } else if (totalDeposited > 100) {
      segments.push({ type: 'value', value: 'medium_value', confidence: 0.85 });
    } else {
      segments.push({ type: 'value', value: 'low_value', confidence: 0.75 });
    }
    
    // Activity segment
    const accountAge = (Date.now() - new Date(user.created_at).getTime()) / (1000 * 60 * 60 * 24);
    if (accountAge < 7) {
      segments.push({ type: 'lifecycle', value: 'new', confidence: 0.9 });
    } else if (accountAge < 30) {
      segments.push({ type: 'lifecycle', value: 'developing', confidence: 0.8 });
    } else {
      segments.push({ type: 'lifecycle', value: 'established', confidence: 0.85 });
    }
    
    return segments;
  }
}

export const advancedAnalyticsService = new AdvancedAnalyticsService();
export default advancedAnalyticsService;

