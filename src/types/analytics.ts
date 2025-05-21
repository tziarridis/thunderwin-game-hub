
// Basic placeholder types for dashboard data
// These should be refined based on actual data structure from dashboardService

export interface OverviewData {
  totalRevenue?: number;
  revenueChange?: number;
  activeUsers?: number;
  activeUsersChange?: number;
  newSignups?: number;
  newSignupsChange?: number;
  totalBets?: number;
  totalBetsChange?: number;
  // Add other overview metrics as needed
}

export interface RevenueDataPoint {
  date: string; // e.g., '2024-05-21'
  revenue: number;
}

export interface UserStatsDataPoint {
  date: string;
  activeUsers: number;
  newSignups: number;
}

export interface GamePopularityDataPoint {
  gameName: string;
  betCount: number;
  gameId?: string;
}

export interface TransactionVolumeDataPoint {
  date: string;
  depositVolume: number;
  withdrawalVolume: number;
}

// This was referenced by dashboardService in AdminDashboard before.
// If getDashboardStats is the sole method, this might be its return type.
export interface DashboardStats {
  overview: OverviewData;
  revenueOverTime: RevenueDataPoint[];
  userActivity: UserStatsDataPoint[];
  topGames: GamePopularityDataPoint[];
  transactionVolume: TransactionVolumeDataPoint[];
  // any other stats
}
