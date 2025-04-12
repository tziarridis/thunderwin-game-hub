
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

// VIP Level interface - Updated with ALL properties used in VipBonusManagement.tsx
export interface VipLevel {
  id: string;
  name: string;
  level: number;
  requiredPoints: number; 
  pointsRequired: number; // Alternative name used in VipBonusManagement
  cashbackPercent: number;
  cashbackRate: number; // Alternative name used in VipBonusManagement
  depositBonusPercent: number;
  depositBonus: number; // Alternative name used in VipBonusManagement
  withdrawalLimit: number;
  birthdayBonus: number;
  weeklyBonus: number;
  benefits: string[];
  description: string;
  color: string;
  dedicated: boolean;
  fastWithdrawals: boolean;
  exclusivePromos: boolean;
  specialEvents: boolean;
  customizedOffers: boolean;
  icon: string;
}

// Bonus interface - Updated with ALL properties used in components
export interface Bonus {
  id: string;
  userId: string;
  title?: string;
  description: string;
  name?: string; // Alternative name used in components
  amount: number;
  wagerRequired?: number;
  wagerCompleted?: number;
  wagering?: number; // Alternative name used in components
  progress?: number; // Used in BonusHub
  expiresAt: string;
  status?: "active" | "completed" | "expired";
  isCompleted?: boolean; // Alternative used in BonusHub
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip" | "freespin";
  bonusCode?: string;
  code?: string; // Alternative name used in components
  createdAt: string; // Used in BonusHub
  templateId?: string; // Reference to the template
  percentage?: number; // Used in components
  maxBonus?: number; // Maximum bonus amount
}

// Bonus Template interface - Updated with ALL properties used in components
export interface BonusTemplate {
  id: string;
  title?: string;
  description: string;
  name?: string; // Alternative name used in components
  amount: number;
  wagerMultiplier?: number;
  wagering?: number; // Alternative name used in components
  duration?: number;
  expiryDays?: number; // Alternative name used in components
  minDeposit?: number;
  isActive?: boolean;
  active?: boolean; // Alternative name used in components
  requiredVipLevel?: number;
  vipLevelRequired?: number; // Alternative name used in components
  type: "deposit" | "free_spin" | "cashback" | "loyalty" | "vip" | "freespin";
  bonusCode?: string;
  code?: string; // Alternative name used in components
  percentage?: number; // Used in components for deposit percent
  maxBonus?: number; // Maximum bonus amount
  allowedGames?: string; // Used in admin component
  createdAt?: string; // Timestamp when created
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
