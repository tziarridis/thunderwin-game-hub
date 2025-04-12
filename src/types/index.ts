// Game Types
export interface Game {
  id: string;
  title: string;
  provider: string;
  category: string;
  image?: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  isPopular: boolean;
  isNew: boolean;
  isFavorite: boolean;
  releaseDate: string;
  jackpot: boolean;
  description?: string;
  tags?: string[];
}

export interface GameProvider {
  id: string;
  name: string;
  logo: string;
  gamesCount: number;
  isPopular: boolean;
  description?: string;
  featured?: boolean;
}

// User Types
export interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  isAdmin?: boolean;
  avatar?: string;
  vipLevel?: number;
  createdAt?: string;
  lastLoginAt?: string;
  isVerified?: boolean;
  country?: string;
  fullName?: string;
  phoneNumber?: string;
  name?: string;
  status?: "Active" | "Pending" | "Inactive";
  joined?: string;
  role?: "user" | "admin";
  favoriteGames?: string[];
  password?: string; // Added for dbInitializer
}

// Transaction Types
export type TransactionType = "deposit" | "withdraw" | "bonus" | "bet" | "win";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  status: "pending" | "completed" | "failed";
  createdAt?: string;
  paymentMethod?: string;
  description?: string;
  gameId?: string;
  userName?: string;
  method?: string;
  date?: string;
  currency?: string;
}

// Bet Types
export interface Bet {
  id: string;
  userId: string;
  gameId: string;
  amount: number;
  winAmount: number | null;
  outcome: "win" | "loss" | "pending";
  timestamp: string;
}

export interface GameBet extends Bet {
  gameName: string;
  userName: string;
}

// Promotion Types
export interface Promotion {
  id: string;
  title: string;
  description: string;
  image?: string;
  imageUrl?: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  promotionType?: "welcome" | "deposit" | "noDeposit" | "cashback" | "tournament";
  terms?: string;
  category?: string;
  termsAndConditions?: string; // Added for compatibility
  type?: string; // Added for compatibility
  bonusCode?: string;
  minDeposit?: number;
  bonusPercentage?: number;
  maxBonusAmount?: number;
  wageringRequirements?: number;
  eligibleGames?: string[];
}

// Bonus Types
export interface Bonus {
  id: string;
  name: string;
  description: string;
  amount: number;
  type: BonusType;
  requirements: string;
  expiryDays: number;
  isActive: boolean;
  status?: "active" | "used" | "expired" | "completed";
  progress?: number;
  wagering?: number;
  expiresAt?: string;
  userId?: string;
  templateId?: string;
  isCompleted?: boolean;
  createdAt?: string; // Added for compatibility
}

export type BonusType = "deposit" | "free_spins" | "cashback" | "no_deposit" | "reload" | "loyalty";

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  bonusType?: BonusType;
  type?: BonusType; // Added for compatibility
  amount: number;
  wagering: number;
  expiryDays: number;
  isActive: boolean;
  percentage?: number;
  minDeposit?: number;
  maxBonus?: number;
  vipLevelRequired?: number;
  allowedGames?: string[] | string;
  code?: string;
  createdAt?: string;
}

// Affiliate Types
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  website?: string;
  commissionRate: number;
  balance: number;
  registeredDate: string;
  status: "active" | "pending" | "suspended";
  referrals: number;
  lastPayment?: string;
  code?: string;
  signups?: number;
  totalRevenue?: number;
  commission?: number;
  referredUsers?: number[];
  joinedDate?: string;
  totalCommissions?: number;
}

// VIP Types
export interface VipLevel {
  id: number | string;
  name: string;
  requirements?: string;
  benefits?: string[];
  cashbackRate: number;
  withdrawalLimit: number;
  personalManager?: boolean;
  customGifts?: boolean;
  specialPromotions?: boolean;
  level?: number;
  pointsRequired?: number;
  requiredPoints?: number;
  depositBonus?: number;
  depositBonusPercent?: number;
  birthdayBonus?: number;
  weeklyBonus?: number;
  dedicated?: boolean;
  fastWithdrawals?: boolean;
  color?: string;
  icon?: string;
  cashbackPercent?: number;
}

// KYC Types
export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  status: "pending" | "approved" | "rejected" | "verified";
  documentType: string;
  documentImage: string;
  submittedDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  comments?: string;
  email?: string;
  documentFiles?: string[];
  rejectionReason?: string;
  notes?: string;
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected",
  VERIFIED = "verified"
}

// Wallet Types
export interface OxaPayWallet {
  id: string;
  currency: string;
  address: string;
  status: string;
  balance: number;
}

// Dashboard Analytics Types
export interface DashboardStats {
  ggr: number;
  ngr: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalBets: number;
  totalWins: number;
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  bonusAmount: number;
  availableBalance: number;
  volume: number;
  taxes: number;
}

export interface GameStats {
  gameId: string;
  gameName: string;
  provider: string;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  uniquePlayers: number;
}

export interface ProviderStats {
  providerId: string;
  providerName: string;
  totalGames: number;
  totalBets: number;
  totalWins: number;
  netProfit: number;
  uniquePlayers: number;
}

export interface RegionStats {
  region: string;
  userCount: number;
  depositAmount: number;
  betAmount: number;
  winAmount: number;
  netProfit: number;
}
