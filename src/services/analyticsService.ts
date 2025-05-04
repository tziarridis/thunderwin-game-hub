
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, GameAnalytics } from '@/types';

/**
 * Analytics Service
 * Provides analytics data for the casino management dashboard
 */

export const getRevenueData = async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<number[]> => {
  try {
    let interval: string;
    let limit: number;
    
    switch (timeframe) {
      case 'day':
        interval = '1 hour';
        limit = 24;
        break;
      case 'week':
        interval = '1 day';
        limit = 7;
        break;
      case 'month':
        interval = '1 day';
        limit = 30;
        break;
      case 'year':
        interval = '1 month';
        limit = 12;
        break;
      default:
        interval = '1 day';
        limit = 7;
    }
    
    const { data, error } = await supabase.rpc('get_revenue_over_time', {
      p_interval: interval,
      p_limit: limit
    });
    
    if (error) throw error;
    
    return data.map((item: any) => item.revenue);
  } catch (error) {
    console.error('Error fetching revenue data:', error);
    return [];
  }
};

export const getUserActivityData = async (timeframe: 'day' | 'week' | 'month' | 'year'): Promise<AnalyticsData[]> => {
  try {
    let interval: string;
    let limit: number;
    
    switch (timeframe) {
      case 'day':
        interval = '1 hour';
        limit = 24;
        break;
      case 'week':
        interval = '1 day';
        limit = 7;
        break;
      case 'month':
        interval = '1 day';
        limit = 30;
        break;
      case 'year':
        interval = '1 month';
        limit = 12;
        break;
      default:
        interval = '1 day';
        limit = 7;
    }
    
    // In a real scenario, this would be a database call
    // For this example, we'll simulate data for demonstration
    const mockData: AnalyticsData[] = Array(limit).fill(0).map((_, i) => ({
      revenue: 5000 + Math.floor(Math.random() * 2000),
      activeUsers: 1000 + Math.floor(Math.random() * 500),
      newRegistrations: 50 + Math.floor(Math.random() * 30),
      conversionRate: 20 + Math.random() * 10,
      transactions: 2000 + Math.floor(Math.random() * 1000),
      averageBet: 20 + Math.random() * 15,
      retention: 60 + Math.random() * 20,
      churnRate: 5 + Math.random() * 5
    }));
    
    return mockData;
  } catch (error) {
    console.error('Error fetching user activity data:', error);
    return [];
  }
};

export const getTopGames = async (limit: number = 10): Promise<GameAnalytics[]> => {
  try {
    const { data, error } = await supabase.rpc('get_top_games_by_revenue', {
      p_limit: limit
    });
    
    if (error) throw error;
    
    if (!data || !data.length) {
      // Mock data for demonstration
      return [
        {
          gameId: "game-1",
          gameName: "Thunder Megaways",
          provider: "ThunderBall",
          totalBets: 54800,
          totalWins: 30446,
          netGamingRevenue: 24354,
          playerCount: 1245,
          averageBet: 8.92,
          rtp: 96.2
        },
        {
          gameId: "game-2",
          gameName: "Blackjack VIP",
          provider: "Evolution",
          totalBets: 42567,
          totalWins: 23799,
          netGamingRevenue: 18768,
          playerCount: 764,
          averageBet: 52.31,
          rtp: 99.4
        },
        {
          gameId: "game-3",
          gameName: "Lightning Roulette",
          provider: "Evolution",
          totalBets: 38900,
          totalWins: 22357,
          netGamingRevenue: 16543,
          playerCount: 982,
          averageBet: 35.28,
          rtp: 97.3
        }
      ];
    }
    
    return data.map((item: any) => ({
      gameId: item.game_id,
      gameName: item.game_name,
      provider: item.provider,
      totalBets: item.total_bets,
      totalWins: item.total_wins,
      netGamingRevenue: item.ngr,
      playerCount: item.player_count,
      averageBet: item.avg_bet,
      rtp: item.rtp
    }));
  } catch (error) {
    console.error('Error fetching top games:', error);
    return [];
  }
};

export const getBonusAnalytics = async (): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_bonus_analytics');
    
    if (error) throw error;
    
    if (!data || !data.length) {
      // Mock data for demonstration
      return [
        {
          bonusType: "Welcome Bonus",
          totalGiven: 12450,
          userCount: 342,
          averageValue: 36.4,
          wageringCompletePercentage: 48,
          roi: 135
        },
        {
          bonusType: "Reload Bonus",
          totalGiven: 8756,
          userCount: 623,
          averageValue: 14.05,
          wageringCompletePercentage: 67,
          roi: 182
        },
        {
          bonusType: "Cashback",
          totalGiven: 5432,
          userCount: 378,
          averageValue: 14.37,
          wageringCompletePercentage: 100,
          roi: 210
        }
      ];
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching bonus analytics:', error);
    return [];
  }
};

export const getPlayerRetentionData = async (): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_player_retention');
    
    if (error) throw error;
    
    if (!data || !data.length) {
      // Mock data for demonstration
      return {
        newPlayers: [120, 140, 160, 130, 150, 170, 160],
        retainedPlayers: [0, 84, 98, 112, 91, 105, 119],
        churnedPlayers: [0, 36, 42, 48, 39, 45, 51],
        retentionRate: [0, 70, 70, 70, 70, 70, 70],
        labels: ["Day 0", "Day 1", "Day 7", "Day 14", "Day 30", "Day 60", "Day 90"]
      };
    }
    
    return data;
  } catch (error) {
    console.error('Error fetching player retention data:', error);
    return null;
  }
};

export const getPaymentMethodDistribution = async (): Promise<any> => {
  try {
    const { data, error } = await supabase.rpc('get_payment_method_distribution');
    
    if (error) throw error;
    
    if (!data || !data.length) {
      // Mock data for demonstration
      return [
        { name: "Credit Card", value: 45 },
        { name: "PayPal", value: 30 },
        { name: "Bank Transfer", value: 10 },
        { name: "Crypto", value: 15 }
      ];
    }
    
    return data.map((item: any) => ({
      name: item.payment_method,
      value: item.percentage
    }));
  } catch (error) {
    console.error('Error fetching payment method distribution:', error);
    return [];
  }
};

export const analyticsService = {
  getRevenueData,
  getUserActivityData,
  getTopGames,
  getBonusAnalytics,
  getPlayerRetentionData,
  getPaymentMethodDistribution
};

export default analyticsService;
