// Ensuring these types are defined and exported

export interface OverviewData {
  totalRevenue?: number;
  revenueChange?: number; // Percentage or absolute
  activeUsers?: number;
  activeUsersChange?: number;
  newSignups?: number;
  newSignupsChange?: number;
  totalBets?: number;
  totalBetsChange?: number;
  avgBetAmount?: number;
  conversionRate?: number; // e.g. signups to depositing users
  // Add other overview metrics as needed
}

export interface RevenueDataPoint {
  date: string; // e.g., '2023-05-21' or 'May' for monthly
  revenue: number;
  previousPeriodRevenue?: number; // For comparison
}

export interface UserActivityDataPoint {
  date: string;
  activeUsers: number;
  newSignups: number;
  returningUsers?: number;
}

export interface GamePopularityDataPoint {
  gameId?: string; // Use internal game ID if available
  gameName: string;
  betCount: number;
  totalWagered?: number;
  payoutRate?: number; // GGR or RTP observed
  uniquePlayers?: number;
}

export interface TransactionVolumeDataPoint {
  date: string;
  depositVolume: number;
  withdrawalVolume: number;
  netVolume?: number; // Deposits - Withdrawals
  depositCount?: number;
  withdrawalCount?: number;
}

export interface AffiliatePerformanceDataPoint {
  affiliateId: string;
  affiliateName: string;
  clicks: number;
  registrations: number;
  depositingUsers: number;
  commissionEarned: number;
}

export interface DashboardStats {
  overview: OverviewData;
  revenueOverTime: RevenueDataPoint[];
  userActivity: UserActivityDataPoint[];
  topGames: GamePopularityDataPoint[];
  transactionVolume: TransactionVolumeDataPoint[];
  affiliateSummary?: AffiliatePerformanceDataPoint[]; // Optional
  // any other stats
}

// Added missing types from errors
export interface AnalyticsData extends DashboardStats {} // Alias or extend as needed
export interface GameAnalytics {
  topGames: GamePopularityDataPoint[];
  // other game-specific analytics
}
export interface UserGrowthData {
  userActivity: UserActivityDataPoint[];
  // other user growth metrics
}
