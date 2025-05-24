// Re-export enums and extended types
export * from './enums';
export * from './extended';

export interface Game {
  id: string;
  name: string;
  title: string;
  provider: string;
  category: string;
  image: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  features: string[];
  tags: string[];
  isFavorite?: boolean;
  url?: string;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  jackpot?: boolean;
  releaseDate?: string;
}

export interface User {
  id: string;
  name: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatar?: string;
  vipLevel: number;
  isVerified: boolean;
  status: "Active" | "Pending" | "Inactive";
  joined: string;
  role: "admin" | "user";
  favoriteGames: string[];
  phone?: string;
  referralCode?: string;
  referredBy?: string;
  ipAddress?: string;
  lastLogin?: string;
  createdAt?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatarUrl?: string;
  vipLevel: number;
  isVerified: boolean;
}

export interface GameProvider {
  id: string | number;
  name: string;
  logo?: string;
  description?: string;
  status?: string;
  gamesCount?: number;
  isPopular?: boolean;
  featured?: boolean;
}

export interface Affiliate {
  id: string;
  userId: string;
  userName: string;
  name: string;
  email: string;
  website?: string;
  code: string;
  referredUsers: number;
  totalCommissions: number;
  commission: number;
  signups: number;
  totalRevenue: number;
  joinedDate: string;
  payoutMethod: string;
  payoutDetails: string;
  status: 'active' | 'pending' | 'suspended';
  joined: string;
  referralCode: string;
}

export interface VipLevel {
  id: number | string;
  level: number;
  name: string;
  pointsRequired: number;
  requiredPoints?: number; // Add for backward compatibility
  benefits: string[];
  cashbackRate: number;
  withdrawalLimit: number;
  bonuses: {
    depositMatch: number;
    freeSpins: number;
    birthdayBonus: number;
  };
  icon?: string;
  color?: string;
  // Additional properties
  personalManager?: boolean;
  customGifts?: boolean;
  specialPromotions?: boolean;
  requirements?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: string;
  bonusAmount?: number;
  bonusType?: string;
  targetAudience?: string[];
  code?: string;
  minDeposit?: number;
  wageringRequirement?: number;
  promotionType?: string;
  category?: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalBets: number;
  avgBetSize: number;
  registrationConversion: number;
  depositConversion: number;
  // Add missing properties
  ggr: number;
  ngr: number;
  volume: number;
  bonusAmount: number;
  taxes: number;
  totalDeposits: number;
  totalWithdrawals: number;
  availableBalance: number;
}

export interface GameStats {
  mostPlayed: { name: string; count: number }[];
  highestWin: { name: string; amount: number }[];
  popularCategories: { name: string; count: number }[];
  // Add missing properties
  totalBets: number;
  totalWins: number;
  netProfit: number;
  gameName?: string;
  uniquePlayers: number;
}

export interface ProviderStats {
  revenue: { name: string; amount: number }[];
  bets: { name: string; count: number }[];
  winRate: { name: string; rate: number }[];
  // Add missing properties
  totalBets: number;
  totalWins: number;
  netProfit: number;
  providerName?: string;
  totalGames: number;
  uniquePlayers: number;
}

export interface RegionStats {
  usersByCountry: { country: string; users: number }[];
  revenueByCountry: { country: string; revenue: number }[];
  activeSessionsByRegion: { region: string; sessions: number }[];
  // Add missing properties
  depositAmount: number;
  betAmount: number;
  netProfit: number;
  region?: string;
  userCount: number;
  winAmount?: number;
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  documentNumber: string;
  submissionDate: string;
  status: KycStatus;
  verificationDate?: string;
  rejectionReason?: string;
  documentUrls: string[];
  // Add for backward compatibility
  email?: string;
  submittedDate?: string;
  documentImage?: string;
  documentFiles?: string[];
}

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  type: string;
  value: number; 
  minDeposit?: number;
  wageringRequirement: number;
  durationDays: number;
  forVipLevels: number[];
  isActive: boolean;
  bonusType?: string;
  
  // Additional properties for VipBonusManagement
  amount?: number;
  wagering?: number;
  expiryDays?: number;
  percentage?: number;
  maxBonus?: number;
  vipLevelRequired?: number | string;
  allowedGames?: string;
  code?: string;
}

export interface Transaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description?: string;
  referenceId?: string;
  paymentMethod?: string;
  balance?: number;
  gameId?: string;
  bonusId?: string;
}

export interface Bonus {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  status: "active" | "used" | "expired";
  expiryDate: string;
  createdAt: string;
  wageringRequirement: number;
  progress: number;
  code?: string;
  description?: string;
}

// Type for VipBonusManagement
export interface BonusTemplateFormData {
  id?: string;
  name: string;
  description: string;
  type: string;
  value: number;
  minDeposit?: number;
  wageringRequirement: number;
  durationDays: number;
  forVipLevels: number[];
  isActive: boolean;
  bonusType?: string;
  // Additional properties
  amount?: number;
  percentage?: number;
  wagering?: number;
  expiryDays?: number;
  maxBonus?: number;
  vipLevelRequired?: number | string;
  allowedGames?: string;
  code?: string;
}

export interface MetaMaskDepositProps {
  amount: number;
  onSuccess: () => void;
  onError: (error: Error) => void;
}

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

export interface UserBonus {
  id: string;
  userId: string;
  bonusId: string;
  status: 'active' | 'used' | 'expired';
  dateIssued: string;
  expiryDate: string;
  amount: number;
  wageringRequirement: number;
  wageringCompleted: number;
  type: string;
}
