export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator', 
  USER = 'user',
  VIP = 'vip',
  SUPPORT = 'support',
  AFFILIATE = 'affiliate',
  MANAGER = 'manager',
  VIP_PLAYER = 'vip_player'
}

export type UserRoleType = UserRole;

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  status?: string;
  name?: string;
  vip_level_id?: string;
  last_sign_in_at?: string;
  is_active?: boolean;
  is_banned?: boolean;
  is_verified?: boolean;
  balance?: number;
  currency?: string;
  vipLevel?: number;
  vipPoints?: number;
  kycStatus?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
    currency?: string;
    language?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    bonus_points?: string | number;
    vip_level?: number;
    kyc_status?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: string;
    [key: string]: any;
  };
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  avatarUrl?: string;
  firstName?: string;
  lastName?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at?: string;
  role?: UserRole;
  status?: string;
  name?: string;
  vip_level_id?: string;
  last_sign_in_at?: string;
  is_active?: boolean;
  is_banned?: boolean;
  is_verified?: boolean;
  balance?: number;
  currency?: string;
  vipLevel?: number;
  vipPoints?: number;
  kycStatus?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
    currency?: string;
    language?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
    name?: string;
    bonus_points?: string | number;
    vip_level?: number;
    kyc_status?: string;
  };
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: string;
    [key: string]: any;
  };
}

export interface UserProfile {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DisplayUser {
  id: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatar_url?: string;
  role?: UserRole;
  status?: string;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
  };
}

export interface TransactionService {
  getUserTransactions: (userId: string) => Promise<Transaction[]>;
}

export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  currency: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'approved' | 'rejected' | 'processing';
  created_at: string;
  updated_at: string;
  provider_transaction_id?: string;
  provider?: string;
  description?: string;
  game_id?: string;
  round_id?: string;
  date?: string; // For backward compatibility
  player_id?: string; // For backward compatibility
}

// Create KYC-related types
export interface KycAttempt {
  id: string;
  user_id: string;
  status: string;
  documents?: any[];
  notes?: string;
  created_at: string;
}

// Define missing interfaces for Affiliate-related components
export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingCommission: number;
  totalEarned: number;
  conversionRate: number;
}

export interface AffiliateLink {
  id: string;
  code: string;
  url: string;
  clicks: number;
  signups: number;
}

export interface AffiliateEarning {
  id: string;
  amount: number;
  type: string;
  status: string;
  referredUser: string;
  date: string;
}
