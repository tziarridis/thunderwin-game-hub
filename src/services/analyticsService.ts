
import { supabase } from '@/integrations/supabase/client';
import { AnalyticsData, GameAnalytics, UserGrowthData } from '@/types/analytics';

export const fetchDailyAnalytics = async (): Promise<AnalyticsData[]> => {
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
};

export const fetchGameAnalytics = async (): Promise<GameAnalytics[]> => {
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
};

export const fetchUserGrowthData = async (): Promise<UserGrowthData[]> => {
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
};

export const fetchBonusAnalytics = async () => {
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
};

export const analyticsService = {
  fetchDailyAnalytics,
  fetchGameAnalytics,
  fetchUserGrowthData,
  fetchBonusAnalytics
};

export default analyticsService;
