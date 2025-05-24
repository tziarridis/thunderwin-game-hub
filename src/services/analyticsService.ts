import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, GameAnalytics, UserGrowthData } from '@/types/analytics';

export interface RealtimePlayerStats {
  totalOnline: number;
  totalPlaying: number;
  newSignups: number;
  totalDeposits: number;
  totalWithdrawals: number;
  activeSessions: number;
}

export interface RevenueAnalytics {
  totalRevenue: number;
  revenueByGame: Array<{ gameName: string; revenue: number }>;
  revenueByProvider: Array<{ providerName: string; revenue: number }>;
  revenueByDate: Array<{ date: string; revenue: number }>;
  ggr: number;
  ngr: number;
}

export interface ConversionAnalytics {
  registrationToDeposit: number;
  visitToRegistration: number;
  depositToSecondDeposit: number;
  bonusConversion: number;
}

export interface PlayerLifetimeValue {
  averageLTV: number;
  ltpBySegment: Array<{ segment: string; ltv: number }>;
  retentionRates: Array<{ period: string; rate: number }>;
}

class AnalyticsService {
  
  async getRealtimePlayerStats(): Promise<RealtimePlayerStats> {
    try {
      // In production, this would fetch real-time data
      const mockStats: RealtimePlayerStats = {
        totalOnline: 1247,
        totalPlaying: 892,
        newSignups: 34,
        totalDeposits: 2847,
        totalWithdrawals: 1249,
        activeSessions: 756
      };
      
      return mockStats;
    } catch (error) {
      console.error('Error fetching realtime player stats:', error);
      return {
        totalOnline: 0,
        totalPlaying: 0,
        newSignups: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        activeSessions: 0
      };
    }
  }
  
  async getRevenueAnalytics(dateRange: { start: string; end: string }): Promise<RevenueAnalytics> {
    try {
      // Mock revenue analytics data
      const mockData: RevenueAnalytics = {
        totalRevenue: 125000,
        revenueByGame: [
          { gameName: 'Sweet Bonanza', revenue: 25000 },
          { gameName: 'Wolf Gold', revenue: 18000 },
          { gameName: 'Gates of Olympus', revenue: 15000 },
          { gameName: 'Book of Dead', revenue: 12000 },
          { gameName: 'Starburst', revenue: 10000 }
        ],
        revenueByProvider: [
          { providerName: 'Pragmatic Play', revenue: 45000 },
          { providerName: 'Evolution', revenue: 32000 },
          { providerName: 'NetEnt', revenue: 28000 },
          { providerName: 'Play\'n GO', revenue: 20000 }
        ],
        revenueByDate: this.generateDailyRevenue(dateRange),
        ggr: 105000,
        ngr: 98000
      };
      
      return mockData;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }
  
  async getConversionAnalytics(): Promise<ConversionAnalytics> {
    try {
      const mockData: ConversionAnalytics = {
        registrationToDeposit: 32.5,
        visitToRegistration: 12.8,
        depositToSecondDeposit: 45.2,
        bonusConversion: 67.3
      };
      
      return mockData;
    } catch (error) {
      console.error('Error fetching conversion analytics:', error);
      throw error;
    }
  }
  
  async getPlayerLifetimeValue(): Promise<PlayerLifetimeValue> {
    try {
      const mockData: PlayerLifetimeValue = {
        averageLTV: 245.50,
        ltpBySegment: [
          { segment: 'VIP', ltv: 1250.00 },
          { segment: 'High Roller', ltv: 875.00 },
          { segment: 'Regular', ltv: 320.00 },
          { segment: 'Casual', ltv: 125.00 }
        ],
        retentionRates: [
          { period: '1 Day', rate: 85.2 },
          { period: '7 Days', rate: 68.4 },
          { period: '30 Days', rate: 42.1 },
          { period: '90 Days', rate: 28.7 }
        ]
      };
      
      return mockData;
    } catch (error) {
      console.error('Error fetching player lifetime value:', error);
      throw error;
    }
  }
  
  private generateDailyRevenue(dateRange: { start: string; end: string }) {
    const data = [];
    const startDate = new Date(dateRange.start);
    const endDate = new Date(dateRange.end);
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      data.push({
        date: d.toISOString().split('T')[0],
        revenue: Math.floor(Math.random() * 10000) + 5000
      });
    }
    
    return data;
  }
  
  async fetchDailyAnalytics(): Promise<AnalyticsData[]> {
    try {
      // In a real implementation, this would fetch from your analytics database
      // For now, we'll return mock data
      const mockData: AnalyticsData[] = [
        {
          date: "2023-01-01",
          revenue: 12500,
          activeUsers: 350,
          newUsers: 45,
          deposits: 7800,
          withdrawals: 4200,
          bets: 15600,
          wins: 12400
        },
        {
          date: "2023-01-02",
          revenue: 13200,
          activeUsers: 380,
          newUsers: 52,
          deposits: 8200,
          withdrawals: 3900,
          bets: 16400,
          wins: 13100
        },
        // More mock data would go here
      ];

      return mockData;
    } catch (error) {
      console.error("Error fetching daily analytics:", error);
      return [];
    }
  }

  async fetchGameAnalytics(): Promise<GameAnalytics[]> {
    try {
      // In a real implementation, this would fetch from your game analytics database
      // For now, we'll return mock data
      const mockData: GameAnalytics[] = [
        {
          gameName: "Slots Bonanza",
          totalBets: 45600,
          totalWins: 41200,
          uniquePlayers: 245,
          avgBetSize: 12.5,
          profitMargin: 9.6
        },
        {
          gameName: "Blackjack Pro",
          totalBets: 32400,
          totalWins: 30100,
          uniquePlayers: 178,
          avgBetSize: 25.3,
          profitMargin: 7.1
        },
        // More mock data would go here
      ];

      return mockData;
    } catch (error) {
      console.error("Error fetching game analytics:", error);
      return [];
    }
  }

  async fetchUserGrowthData(): Promise<UserGrowthData[]> {
    try {
      // Mock user growth data
      return [
        { date: "2023-01-01", active: 340, new: 45 },
        { date: "2023-01-02", active: 360, new: 52 },
        { date: "2023-01-03", active: 375, new: 48 },
        { date: "2023-01-04", active: 390, new: 55 },
        { date: "2023-01-05", active: 410, new: 63 },
      ];
    } catch (error) {
      console.error("Error fetching user growth data:", error);
      return [];
    }
  }

  async fetchBonusAnalytics() {
    try {
      // Mock bonus analytics data
      return {
        totalBonusesIssued: 450,
        bonusAmountAwarded: 25000,
        bonusTurnoverGenerated: 125000,
        wageringCompleted: 85000
      };
    } catch (error) {
      console.error("Error fetching bonus analytics:", error);
      return {
        totalBonusesIssued: 0,
        bonusAmountAwarded: 0,
        bonusTurnoverGenerated: 0,
        wageringCompleted: 0
      };
    }
  }
}

export const analyticsService = new AnalyticsService();
export default analyticsService;
