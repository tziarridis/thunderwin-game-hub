
import { supabase } from '@/integrations/supabase/client';
import { cacheService } from './cacheService';

export interface OptimizedDashboardMetrics {
  daily: DailyMetric[];
  gamePerformance: GamePerformanceMetric[];
  providerAnalytics: ProviderAnalytic[];
  realTimeStats: {
    totalOnline: number;
    totalPlaying: number;
    activeSessions: number;
  };
}

interface DailyMetric {
  date: string;
  totalTransactions: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  uniquePlayers: number;
}

interface GamePerformanceMetric {
  gameId: string;
  gameName: string;
  providerId: string;
  totalTransactions: number;
  totalBets: number;
  totalWins: number;
  uniquePlayers: number;
  totalSessions: number;
  avgSessionDuration: number;
}

interface ProviderAnalytic {
  id: string;
  name: string;
  totalTransactions: number;
  totalBets: number;
  totalWins: number;
  uniquePlayers: number;
  totalGames: number;
}

class OptimizedAnalyticsService {
  
  async getDashboardMetrics(useCache: boolean = true): Promise<OptimizedDashboardMetrics> {
    const cacheKey = 'dashboard_metrics';
    
    if (useCache) {
      const cached = cacheService.get<OptimizedDashboardMetrics>(cacheKey);
      if (cached) {
        console.log('Returning cached dashboard metrics');
        return cached;
      }
    }

    try {
      console.log('Fetching fresh dashboard metrics');
      const [daily, gamePerformance, providerAnalytics, realTimeStats] = await Promise.all([
        this.getDailyMetrics(),
        this.getGamePerformanceMetrics(),
        this.getProviderAnalytics(),
        this.getRealTimeStats()
      ]);

      const metrics: OptimizedDashboardMetrics = {
        daily,
        gamePerformance,
        providerAnalytics,
        realTimeStats
      };

      // Cache for 2 minutes
      cacheService.set(cacheKey, metrics, 2 * 60 * 1000);
      
      return metrics;
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      throw error;
    }
  }

  private async getDailyMetrics(): Promise<DailyMetric[]> {
    try {
      // Use edge function that handles materialized view access
      const { data, error } = await supabase.functions.invoke('get_daily_metrics');
      
      if (error) {
        console.warn('Edge function error, using direct fallback:', error);
        return this.getDailyMetricsFallback();
      }

      if (data?.data) {
        return data.data.map((row: any) => ({
          date: row.date,
          totalTransactions: row.total_transactions || 0,
          totalDeposits: row.total_deposits || 0,
          totalWithdrawals: row.total_withdrawals || 0,
          totalBets: row.total_bets || 0,
          totalWins: row.total_wins || 0,
          uniquePlayers: row.unique_players || 0
        }));
      }

      return this.getDailyMetricsFallback();
    } catch (error) {
      console.error('Error fetching daily metrics:', error);
      return this.getDailyMetricsFallback();
    }
  }

  private async getDailyMetricsFallback(): Promise<DailyMetric[]> {
    try {
      console.log('Using direct database fallback for daily metrics');
      const { data, error } = await supabase
        .from('transactions')
        .select('created_at, type, amount, player_id')
        .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())
        .limit(10000);

      if (error) {
        console.error('Error in fallback query:', error);
        return [];
      }

      // Group by date and calculate metrics
      const dailyData = new Map<string, any>();
      
      data.forEach(transaction => {
        const date = transaction.created_at.split('T')[0];
        
        if (!dailyData.has(date)) {
          dailyData.set(date, {
            date,
            totalTransactions: 0,
            totalDeposits: 0,
            totalWithdrawals: 0,
            totalBets: 0,
            totalWins: 0,
            uniquePlayers: new Set()
          });
        }
        
        const dayData = dailyData.get(date)!;
        dayData.totalTransactions++;
        dayData.uniquePlayers.add(transaction.player_id);
        
        switch (transaction.type) {
          case 'deposit':
            dayData.totalDeposits += Number(transaction.amount);
            break;
          case 'withdraw':
            dayData.totalWithdrawals += Number(transaction.amount);
            break;
          case 'bet':
            dayData.totalBets += Number(transaction.amount);
            break;
          case 'win':
            dayData.totalWins += Number(transaction.amount);
            break;
        }
      });

      return Array.from(dailyData.values()).map(item => ({
        ...item,
        uniquePlayers: item.uniquePlayers.size
      })).sort((a, b) => b.date.localeCompare(a.date));
    } catch (error) {
      console.error('Error in daily metrics fallback:', error);
      return [];
    }
  }

  private async getGamePerformanceMetrics(): Promise<GamePerformanceMetric[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get_game_performance');
      
      if (error) {
        console.warn('Game performance edge function error:', error);
        return [];
      }

      if (data?.data) {
        return data.data.map((row: any) => ({
          gameId: row.game_id,
          gameName: row.game_name,
          providerId: row.provider_id,
          totalTransactions: row.total_transactions || 0,
          totalBets: Number(row.total_bets) || 0,
          totalWins: Number(row.total_wins) || 0,
          uniquePlayers: row.unique_players || 0,
          totalSessions: row.total_sessions || 0,
          avgSessionDuration: Number(row.avg_session_duration) || 0
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching game performance metrics:', error);
      return [];
    }
  }

  private async getProviderAnalytics(): Promise<ProviderAnalytic[]> {
    try {
      const { data, error } = await supabase.functions.invoke('get_provider_analytics');
      
      if (error) {
        console.warn('Provider analytics edge function error:', error);
        return [];
      }

      if (data?.data) {
        return data.data.map((row: any) => ({
          id: row.id,
          name: row.name,
          totalTransactions: row.total_transactions || 0,
          totalBets: Number(row.total_bets) || 0,
          totalWins: Number(row.total_wins) || 0,
          uniquePlayers: row.unique_players || 0,
          totalGames: row.total_games || 0
        }));
      }

      return [];
    } catch (error) {
      console.error('Error fetching provider analytics:', error);
      return [];
    }
  }

  private async getRealTimeStats() {
    try {
      const { data, error } = await supabase
        .from('realtime_player_stats')
        .select('*')
        .single();

      if (error && error.code !== 'PGRST116') {
        console.warn('Error fetching real-time stats:', error);
        return {
          totalOnline: 0,
          totalPlaying: 0,
          activeSessions: 0
        };
      }

      return {
        totalOnline: data?.total_online || 0,
        totalPlaying: data?.total_playing || 0,
        activeSessions: data?.active_sessions || 0
      };
    } catch (error) {
      console.error('Error fetching real-time stats:', error);
      return {
        totalOnline: 0,
        totalPlaying: 0,
        activeSessions: 0
      };
    }
  }

  async refreshMaterializedViews(): Promise<void> {
    try {
      const { error } = await supabase.rpc('refresh_analytics_views');
      
      if (error) {
        console.error('Error refreshing materialized views:', error);
      } else {
        console.log('Materialized views refreshed successfully');
        // Clear related caches
        cacheService.delete('dashboard_metrics');
      }
    } catch (error) {
      console.error('Error calling refresh function:', error);
    }
  }

  // Get cached analytics with real-time updates
  async getCachedAnalytics(forceRefresh: boolean = false) {
    return this.getDashboardMetrics(!forceRefresh);
  }
}

export const optimizedAnalyticsService = new OptimizedAnalyticsService();
export default optimizedAnalyticsService;
