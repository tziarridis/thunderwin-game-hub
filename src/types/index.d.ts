// Ensure these are available or defined in user.d.ts and re-exported here if needed
export type { LoginCredentials, RegisterCredentials, UserRole, UserProfile, UserContextType, DisplayUser } from './user'; 
export type { Wallet, WalletContextType, Transaction as WalletTransaction, CoinBalance } from './wallet'; // Assuming WalletTransaction is an alias if Transaction is generic
export type { KycStatus, KycDocument, KycAttempt, KycRequest } from './kyc';
export type { Bonus, UserBonus, BonusType, BonusStatus } from './bonus';
export type { Promotion, PromotionType } from './promotion';
export type { Game, GameCategory, GameProvider, GameTag, DisplayGame, GameSession, GameLaunchOptions, FavoriteGame } from './game';
export type { Transaction, TransactionStatus, TransactionType, DateRange } from './transaction'; // Added DateRange
export type { VIPLevel, VIPBenefit } from './vip';
export type { SiteSettings } from './settings';
export type { Notification } from './notification';
export type { AffiliateStats, AffiliateLink, AffiliateEarning } from './affiliate';
export type { SupportTicket, SupportMessage, FaqItem } from './support';
export type { AppError } from './error';
export type { CMSContent, Banner, PageContent } from './cms';

// It's common to have a generic User type, ensure it's comprehensive
// and AppUser in AuthContext extends or uses it.
export interface User {
  id: string;
  username: string | null;
  email: string | null;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  role?: UserRole; // Application-specific role
  created_at: string; // Changed to string (ISO date string)
  updated_at: string; // Changed to string (ISO date string)
  last_sign_in_at?: string | null;
  
  // Financials
  balance?: number;
  currency?: string; // e.g., 'USD'

  // KYC
  kyc_status?: KycStatus;
  is_verified?: boolean; // Email or KYC verified

  // Status & Flags
  status?: UserStatus; // e.g., 'active', 'inactive', 'banned'
  is_banned?: boolean;
  is_active?: boolean; // General active status

  // Gaming related
  favorite_game_ids?: string[];
  vip_level_id?: string; // Reference to VIPLevel
  
  // Extended profile data (can be in a separate 'profiles' table)
  // Already in UserProfile, but some might be denormalized on User for quick access
  phone_number?: string;
  date_of_birth?: string; // ISO date string
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postal_code?: string;
    country?: string;
  };
  
  // Metadata from Supabase or other systems
  app_metadata?: Record<string, any>;
  user_metadata?: Record<string, any>;

  // Admin/Staff flags
  is_staff?: boolean;
  is_admin?: boolean; // Redundant if role covers this, but can be a quick flag
  roles?: UserRole[]; // For multiple roles if applicable

  // Other application specific fields
  referral_code?: string;
  referred_by?: string;
  // Add other fields from your 'users' table in Supabase
}

export type UserStatus = 'active' | 'inactive' | 'pending_verification' | 'banned' | 'restricted' | 'deleted';

declare global {
  interface Window {
    ethereum?: any;
  }
}
