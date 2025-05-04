
export interface AnalyticsData {
  date: string;
  revenue: number;
  activeUsers: number;
  newUsers: number;
  deposits: number;
  withdrawals: number;
  bets: number;
  wins: number;
  totalUsers?: number;
}

export interface GameAnalytics {
  gameName: string;
  totalBets: number;
  totalWins: number;
  uniquePlayers: number;
  avgBetSize: number;
  profitMargin: number;
}

export interface UserGrowthData {
  date: string;
  active: number;
  new: number;
}
