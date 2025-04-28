
export interface Game {
  id: string;
  name: string;
  title?: string; // For backward compatibility
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
  
  // Additional properties needed by components
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

// Previously missing type definitions
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
  // Add missing properties used in VipLevelManager
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
  // Add missing properties used in Dashboard
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
}

export interface ProviderStats {
  revenue: { name: string; amount: number }[];
  bets: { name: string; count: number }[];
  winRate: { name: string; rate: number }[];
}

export interface RegionStats {
  usersByCountry: { country: string; users: number }[];
  revenueByCountry: { country: string; revenue: number }[];
  activeSessionsByRegion: { region: string; sessions: number }[];
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
}

export type KycStatus = 'pending' | 'approved' | 'rejected' | 'additional_info_required';

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
}
