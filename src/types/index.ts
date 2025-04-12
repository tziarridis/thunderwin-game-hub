
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
  imageUrl: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  promotionType: "welcome" | "deposit" | "noDeposit" | "cashback" | "tournament";
  terms: string;
  image?: string;
  category?: string;
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
}

export type BonusType = "deposit" | "free_spins" | "cashback" | "no_deposit" | "reload" | "loyalty";

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  bonusType: BonusType;
  amount: number;
  wagering: number;
  expiryDays: number;
  isActive: boolean;
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
}

// VIP Types
export interface VipLevel {
  id: number;
  name: string;
  requirements: string;
  benefits: string[];
  cashbackRate: number;
  withdrawalLimit: number;
  personalManager: boolean;
  customGifts: boolean;
  specialPromotions: boolean;
}

// KYC Types
export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  status: "pending" | "approved" | "rejected";
  documentType: string;
  documentImage: string;
  submittedDate: string;
  reviewDate?: string;
  reviewedBy?: string;
  comments?: string;
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  APPROVED = "approved",
  REJECTED = "rejected"
}

// Wallet Types
export interface OxaPayWallet {
  id: string;
  currency: string;
  address: string;
  status: string;
  balance: number;
}
