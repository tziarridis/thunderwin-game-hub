
// Main data types for the casino application

export interface User {
  id: string;
  name: string;
  email: string;
  status: 'Active' | 'Pending' | 'Inactive';
  balance: number;
  joined: string;
  favoriteGames?: string[];
  role?: 'user' | 'admin';
  username?: string;
  password?: string;
  vipLevel?: number;
  isVerified?: boolean;
  avatarUrl?: string;
  affiliateCode?: string; // Referral code that brought this user
  kycStatus?: string;
  kycSubmittedAt?: string;
  kycVerifiedAt?: string;
  kycRejectionReason?: string;
}

export interface Game {
  id: string;
  title: string;
  image: string;
  provider: string;
  category: 'slots' | 'live' | 'table' | 'crash' | 'jackpot';
  isPopular?: boolean;
  isNew?: boolean;
  rtp: number;
  minBet: number;
  maxBet: number;
  volatility: 'Low' | 'Medium' | 'High';
  releaseDate: string;
  description?: string;
  features?: string[];
  isFavorite?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  userName: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win';
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled';
  method: string;
  date: string;
  gameId?: string;
  gameName?: string;
}

export interface GameBet {
  id: string;
  gameId: string;
  userId: string;
  amount: number;
  result: 'win' | 'loss';
  winAmount: number;
  date: string;
}

// Game provider integration interface
export interface GameProvider {
  id: string;
  name: string;
  logo: string;
  gamesCount: number;
  isActive: boolean;
}

// Affiliate interface
export interface Affiliate {
  id: string;
  name: string;
  email: string;
  website?: string;
  referralCode: string;
  commission: number;
  signups: number;
  totalRevenue: number;
  status: "active" | "inactive" | "pending";
  joinedDate: string;
}

// VIP Level interface
export interface VipLevel {
  id: number;
  name: string;
  requiredPoints: number;
  cashbackPercent: number;
  depositBonusPercent: number;
  withdrawalLimit: number;
  benefits: string[];
  description: string;
  color: string;
}

// Bonus interface
export interface Bonus {
  id: string;
  userId: string;
  title: string;
  description: string;
  amount: number;
  wagerRequired: number;
  wagerCompleted: number;
  expiresAt: string;
  status: "active" | "completed" | "expired";
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip";
  bonusCode?: string;
}

// Bonus Template interface
export interface BonusTemplate {
  id: string;
  title: string;
  description: string;
  amount: number;
  wagerMultiplier: number;
  duration: number; // in days
  minDeposit: number;
  isActive: boolean;
  requiredVipLevel: number;
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip";
  bonusCode?: string;
}

// KYC Request interface
export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  status: string;
  submittedAt: string;
  data: {
    fullName: string;
    dateOfBirth: string;
    nationality: string;
    address: string;
    city: string;
    zipCode: string;
    country: string;
    phoneNumber: string;
    documentType: string;
    documentFront: string;
    documentBack: string;
    selfie: string;
  };
  reviewedBy?: string;
  reviewedAt?: string;
  rejectionReason?: string;
}

// Database schemas (simulated for LocalStorage)
export interface DatabaseSchemas {
  users: User[];
  games: Game[];
  transactions: Transaction[];
  bets: GameBet[];
  providers: GameProvider[];
  supportTickets: SupportTicket[];
  autoResponses: AutoResponse[];
  affiliates: Affiliate[];
  promotions: Promotion[];
  vipLevels: VipLevel[];
  bonusTemplates: BonusTemplate[];
  userBonuses: Bonus[];
  kycRequests: KycRequest[];
}

// Platform settings
export interface PlatformSettings {
  general: {
    siteName: string;
    siteUrl: string;
    supportEmail: string;
    maintenance: boolean;
  };
  security: {
    maxLoginAttempts: number;
    sessionTimeout: number;
    forcePasswordChange: number;
    requireTwoFactor: boolean;
    ipWhitelist: string;
  };
  notifications: {
    emailNotifications: boolean;
    loginAlerts: boolean;
    withdrawalAlerts: boolean;
    depositAlerts: boolean;
    maintenanceAlerts: boolean;
  };
  limits: {
    minDeposit: number;
    maxDeposit: number;
    minWithdrawal: number;
    maxWithdrawal: number;
    dailyWithdrawalLimit: number;
  };
  database: {
    backupSchedule: 'hourly' | 'daily' | 'weekly' | 'monthly';
    retentionDays: number;
    compression: boolean;
    autoCleanup: boolean;
  };
}

// Audit log entry
export interface AuditLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'debug';
  category: 'security' | 'user' | 'system' | 'payment' | 'game' | 'admin';
  message: string;
  user?: string;
  ipAddress?: string;
  details?: string;
}

// OxaPay related types
export interface OxaPayWallet {
  id: string;
  address: string;
  created_at: string;
  status: string;
  amount: number;
  currency: string;
  paid_amount: number;
  expiration_time: string;
}

export interface OxaPayTransaction extends Transaction {
  walletId: string;
  walletAddress: string;
}

// Promotion interface
export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  endDate: string;
  isActive: boolean;
  category?: string;
}

// Import support types to consolidate everything
import { SupportTicket, SupportMessage, AutoResponse } from './support';
export { type SupportTicket, type SupportMessage, type AutoResponse };
