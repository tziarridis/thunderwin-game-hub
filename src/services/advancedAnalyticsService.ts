import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types'; // Ensure Json is available

// Define specific types for dashboard metrics
export interface DashboardMetrics {
  totalRevenue: number;
  activePlayers: number;
  avgLTV: number;
  conversionRate: number;
  revenueGrowth: number;
  playerGrowth: number;
  highRiskChurn: number;
  mediumRiskChurn: number;
  lowRiskChurn: number;
  // Add other metrics if any
}

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
  testConfig: Record<string, any>;
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
  factors: Record<string, any>; 
}

export interface ChurnPrediction {
  id: string;
  userId: string;
  churnProbability: number;
  churnRiskLevel: string;
  predictionFactors: Record<string, any>;
  recommendedActions: string[];
}

// Specific type for transaction data used in LTV calculation
interface LTVTransaction {
  amount: number | null; 
  type: string;
  created_at: string;
}

// Specific type for session data used in churn prediction
interface PlayerSession {
  id: string;
  user_id: string;
  game_id: string;
  started_at: string;
  ended_at?: string | null;
}

// Specific type for user data in segmentation
interface SegmentationUser {
  created_at: string;
}

interface CalculatedSegment {
  type: string;
  value: string;
  confidence: number;
}

class AdvancedAnalyticsService {
  
  async getDashboardMetrics(): Promise<DashboardMetrics> {
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
      return { // Return a default structure on error
        totalRevenue: 0,
        activePlayers: 0,
        avgLTV: 0,
        conversionRate: 0,
        revenueGrowth: 0,
        playerGrowth: 0,
        highRiskChurn: 0,
        mediumRiskChurn: 0,
        lowRiskChurn: 0
      };
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
        const config = test.test_config as Record<string, any>; // Cast to Record<string, any>
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
        factors: ltv.factors as Record<string, any> // Cast factors to Record<string, any>
      })) || [];
    } catch (error) {
      console.error('Error fetching LTV analysis:', error);
      return [];
    }
  }

  async calculatePlayerLTV(userId: string): Promise<PlayerLTV | null> {
    try {
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at')
        .eq('player_id', userId) 
        .eq('status', 'completed') as { data: LTVTransaction[] | null; error: any }; 

      if (!transactions || transactions.length === 0) {
        return null;
      }
      const deposits = transactions.filter(t => t.type === 'deposit');
      const currentValue = deposits.reduce((sum, t) => sum + (t.amount || 0), 0);

      const avgMonthlyDeposit = currentValue / Math.max(1, this.getMonthsSinceFirstDeposit(transactions));
      const predictedLifespanMonths = 12; 
      const predictedLtv = avgMonthlyDeposit * predictedLifespanMonths;

      let ltvSegment = 'low';
      if (predictedLtv > 1000) ltvSegment = 'high';
      else if (predictedLtv > 500) ltvSegment = 'medium';

      const factors = {
        avg_monthly_deposit: avgMonthlyDeposit,
        total_deposits: deposits.length,
        account_age_months: this.getMonthsSinceFirstDeposit(transactions)
      };

      const { data, error } = await supabase
        .from('player_ltv')
        .upsert({
          user_id: userId,
          predicted_ltv: predictedLtv,
          current_value: currentValue,
          ltv_segment: ltvSegment,
          calculation_method: 'simple_average',
          factors: factors as unknown as Json, // Ensure factors is compatible with Json for upsert
          expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() 
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
        factors: data.factors as Record<string, any> 
      };

    } catch (error) {
      console.error('Error calculating player LTV:', error);
      return null;
    }
  }

  async predictPlayerChurn(userId: string): Promise<ChurnPrediction | null> {
    try {
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      
      const { data: recentTransactions } = await supabase
        .from('transactions')
        .select('*') 
        .eq('player_id', userId) 
        .gte('created_at', thirtyDaysAgo.toISOString()) as { data: LTVTransaction[] | null; error: any };

      const { data: recentSessions } = await supabase
        .from('game_sessions') 
        .select('*')
        .eq('user_id', userId)
        .gte('started_at', thirtyDaysAgo.toISOString()) as { data: PlayerSession[] | null; error: any };
      
      let churnScore = 0;
      
      if (!recentTransactions || recentTransactions.length === 0) churnScore += 0.3;
      if (!recentSessions || recentSessions.length < 5) churnScore += 0.2;

      const weeklyActivity = this.calculateWeeklyActivity(recentSessions || []);
      if (weeklyActivity.isDecreasing) churnScore += 0.3;
      
      let riskLevel = 'low';
      if (churnScore > 0.7) riskLevel = 'high';
      else if (churnScore > 0.4) riskLevel = 'medium';

      const recommendedActions = this.getChurnPreventionActions(riskLevel, churnScore);

      const predictionFactors = {
        recent_transactions: recentTransactions?.length || 0,
        recent_sessions: recentSessions?.length || 0,
        activity_trend: weeklyActivity.trend
      };

      const { data, error } = await supabase
        .from('churn_predictions')
        .upsert({
          user_id: userId,
          churn_probability: churnScore,
          churn_risk_level: riskLevel,
          prediction_factors: predictionFactors as unknown as Json, 
          recommended_actions: recommendedActions as unknown as Json, 
          model_version: 'v1.0',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      let finalRecommendedActions: string[] = [];
      if (Array.isArray(data.recommended_actions)) {
        finalRecommendedActions = data.recommended_actions.map(String);
      } else if (data.recommended_actions && typeof data.recommended_actions === 'object') {
        // If it's an object, attempt to extract string values if appropriate
        // This part might need adjustment based on actual data structure if not an array
        finalRecommendedActions = Object.values(data.recommended_actions).map(String);
      }


      return {
        id: data.id,
        userId: data.user_id,
        churnProbability: data.churn_probability,
        churnRiskLevel: data.churn_risk_level,
        predictionFactors: data.prediction_factors as Record<string, any>, 
        recommendedActions: finalRecommendedActions
      };
    } catch (error) {
      console.error('Error predicting churn:', error);
      return null;
    }
  }

  async segmentPlayer(userId: string): Promise<void> {
    try {
      const { data: user } = await supabase
        .from('users')
        .select('created_at') // Select specific fields needed for SegmentationUser
        .eq('id', userId)
        .single() as { data: SegmentationUser | null; error: any };

      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type, created_at') // Select specific fields for LTVTransaction
        .eq('player_id', userId)
        .eq('status', 'completed') as { data: LTVTransaction[] | null; error: any };

      if (!user || !transactions) return;

      const segments = this.calculatePlayerSegments(user, transactions);

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

  private getMonthsSinceFirstDeposit(transactions: LTVTransaction[]): number {
    if (!transactions.length) return 1;
    
    const firstDeposit = transactions
      .filter(t => t.type === 'deposit')
      .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())[0];
    
    if (!firstDeposit) return 1;
    
    const months = (Date.now() - new Date(firstDeposit.created_at).getTime()) / (1000 * 60 * 60 * 24 * 30);
    return Math.max(1, Math.round(months));
  }

  private calculateWeeklyActivity(sessions: PlayerSession[]): { isDecreasing: boolean; trend: string } {
    if (sessions.length < 14) return { isDecreasing: false, trend: 'insufficient_data' }; // Assuming 2 weeks of data for trend

    const weeks = this.groupSessionsByWeek(sessions); // Pass PlayerSession[]
    const weeklyTotals = weeks.map(week => week.length);
    
    if (weeklyTotals.length < 2) return { isDecreasing: false, trend: 'insufficient_data' };

    const recentWeek = weeklyTotals[weeklyTotals.length - 1];
    const previousWeek = weeklyTotals[weeklyTotals.length - 2];
    
    return {
      isDecreasing: recentWeek < previousWeek * 0.7, 
      trend: recentWeek > previousWeek ? 'increasing' : (recentWeek < previousWeek ? 'decreasing' : 'stable')
    };
  }

  private groupSessionsByWeek(sessions: PlayerSession[]): PlayerSession[][] {
    const weeks: PlayerSession[][] = [];
    const now = new Date();
    
    for (let i = 0; i < 4; i++) { // Group for last 4 weeks
      const weekStart = new Date(now.getTime() - (i + 1) * 7 * 24 * 60 * 60 * 1000);
      const weekEnd = new Date(now.getTime() - i * 7 * 24 * 60 * 60 * 1000);
      
      const weekSessions = sessions.filter(session => {
        // Assuming 'started_at' for PlayerSession as game_sessions might not have 'created_at'
        const sessionDate = new Date(session.started_at); 
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

  private calculatePlayerSegments(user: SegmentationUser, transactions: LTVTransaction[]): CalculatedSegment[] {
    const segments: CalculatedSegment[] = [];
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
