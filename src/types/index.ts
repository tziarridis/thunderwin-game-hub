
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

// Database schemas (simulated for LocalStorage)
export interface DatabaseSchemas {
  users: User[];
  games: Game[];
  transactions: Transaction[];
  bets: GameBet[];
  providers: GameProvider[];
  supportTickets: SupportTicket[];
  autoResponses: AutoResponse[];
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

// Import support types to consolidate everything
import { SupportTicket, SupportMessage, AutoResponse } from './support';
export { type SupportTicket, type SupportMessage, type AutoResponse };
