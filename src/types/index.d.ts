export interface Game {
  id: string | number;
  slug?: string;
  title: string;
  provider: string; // provider slug
  category: string; // category slug
  image?: string; // URL to game image
  description?: string;
  rtp?: number;
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  lines?: number;
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean; // From DbGame
  show_home?: boolean; // From DbGame
  tags?: string[];
  jackpot?: boolean;
  releaseDate?: string; // ISO string or formatted
  views?: number;
  features?: string[];
  themes?: string[];
  game_id?: string; // Actual game identifier for the provider
  name?: string; // Often same as title
  providerName?: string;
  categoryName?: string;
  category_slugs?: string[] | string; // Can be array or single slug
  created_at?: string;
  updated_at?: string;
  provider_id?: string | number;
  provider_slug?: string;
  cover?: string;
  banner?: string;
  image_url?: string;
  status?: 'active' | 'inactive' | 'maintenance';
  game_code?: string;
  isFavorite?: boolean;
}

export interface DbGame {
  id: string; // uuid
  provider_id?: string | number | null; // uuid, references providers table
  game_id?: string | null; // external game id from provider
  game_code?: string | null; // another external game code
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  rtp?: number | null;
  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high' | null;
  lines?: number | null;
  min_bet?: number | null;
  max_bet?: number | null;
  features?: string[] | null; // Store as text[] in Postgres
  themes?: string[] | null; // Store as text[] in Postgres
  tags?: string[] | null; // Store as text[] in Postgres
  image_url?: string | null; // Primary image
  cover?: string | null; // Alternative image or thumbnail
  banner?: string | null; // Banner image for promotions etc.
  provider_slug?: string | null; // Denormalized for easier querying
  provider_name?: string | null; // Denormalized
  category_slugs?: string[] | string | null; // Denormalized, can be array or single
  category_names?: string[] | string | null; // Denormalized
  is_new?: boolean | null;
  is_popular?: boolean | null;
  is_featured?: boolean | null;
  show_home?: boolean | null;
  status?: 'active' | 'inactive' | 'maintenance' | null;
  release_date?: string | null; // ISO date string
  views?: number | null;
  has_lobby?: boolean | null;
  is_mobile?: boolean | null;
  has_freespins?: boolean | null;
  has_tables?: boolean | null;
  only_demo?: boolean | null;
  game_type?: string | null;
  technology?: string | null;
  distribution?: string | null;
  game_server_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Properties from 'games' table not explicitly listed above can be added if needed
}


export interface GameProvider {
  id: string | number; // uuid or other id type
  name: string;
  slug: string; // Unique slug for URL and identification
  logo?: string; // URL to provider logo
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  api_endpoint?: string;
  api_key?: string; // Sensitive, handle with care
  api_secret?: string; // Sensitive, handle with care
  created_at?: string;
  updated_at?: string;
  // Any other provider-specific fields
}

export interface GameCategory {
  id: string | number; // uuid or other id type
  name: string;
  slug: string; // Unique slug for URL and identification
  icon?: string; // Icon name or URL
  image?: string; // URL to category image
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
  // Any other category-specific fields
}

export interface User {
  id: string; // UUID from auth.users
  aud?: string;
  role?: string;
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    avatar_url?: string;
    email?: string;
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string;
    phone_verified?: boolean;
    picture?: string;
    provider_id?: string;
    sub?: string;
    username?: string;
    [key: string]: any;
  };
  identities?: any[];
  created_at?: string;
  updated_at?: string;

  // Custom fields from your public.users table
  username?: string; // This might be from user_metadata or your users table
  first_name?: string;
  last_name?: string;
  avatar_url?: string; // This might be from user_metadata or your users table
  status?: 'active' | 'inactive' | 'banned';
  // role_id?: number; // If you have roles in your users table
  // inviter_id?: string;
  // inviter_code?: string;
  language?: string;
  // cpf?: string; // Example of other custom fields
  // phone?: string; // Already in SupabaseUser, but can be in your users table too
  // banned?: boolean; // Example
  balance?: number; // Typically from Wallet, but added for convenience in some contexts
  currency?: string; // Typically from Wallet
  
  // Fields from the DB 'users' table
  affiliate_revenue_share_fake?: number | null;
  affiliate_cpa?: number;
  affiliate_baseline?: number;
  is_demo_agent?: boolean;
  role_id?: number; // This refers to your custom roles, not Supabase roles
  banned?: boolean;
  inviter_id?: string | null;
  affiliate_revenue_share?: number;
  inviter_code?: string | null;
  oauth_id?: string | null;
  oauth_type?: string | null;
  // cpf?: string | null; // Example for PII, ensure RLS protects it

  // Fields from `wallets` that might be merged for convenience, like in `UserMenu`
  vip_level?: number;
  vip_points?: number;

  // Ensure all fields used in UserForm are here or handled correctly
  // For UserForm: isActive (maps to status), vipLevel (maps to vip_level)
  // country, city, address, birthdate, kycStatus, twoFactorEnabled, emailVerified
  // These might need to be part of user_metadata or a separate profile table linked to users
  country?: string;
  city?: string;
  address?: string;
  birthdate?: string; // ISO date string
  kyc_status?: 'pending' | 'approved' | 'rejected' | 'not_submitted'; // Example
  two_factor_enabled?: boolean;
  // email_verified is often part of Supabase user object or user_metadata
}


export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  balance_bonus_rollover?: number;
  balance_deposit_rollover?: number;
  balance_withdrawal?: number;
  balance_bonus: number;
  balance_cryptocurrency: number;
  balance_demo?: number;
  refer_rewards: number;
  hide_balance: boolean;
  active: boolean;
  total_bet: number;
  total_won: number;
  total_lose: number;
  last_won: number;
  last_lose: number;
  vip_level?: number;
  vip_points?: number;
  created_at?: string;
  updated_at?: string;
  deposit_limit_daily?: number;
  deposit_limit_weekly?: number;
  deposit_limit_monthly?: number;
  exclusion_until?: string | null;
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_period?: string;
  currency: string;
  symbol: string;
}

export interface DbWallet extends Omit<Wallet, 'id' | 'user_id' | 'created_at' | 'updated_at'> {
  id: string; // uuid
  user_id: string; // uuid, foreign key to users.id
  // All other fields from Wallet are assumed to be here
  created_at: string; // timestamp with time zone
  updated_at: string; // timestamp with time zone
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: import('@supabase/supabase-js').Session | null;
  loading: boolean;
  wallet: Wallet | null; // Use the Wallet interface
  login: (credentials: { email?: string; password?: string; provider?: 'google' | 'discord' | 'github' }) => Promise<{ error: Error | null }>;
  register: (credentials: { email?: string; password?: string; username?: string; [key: string]: any }) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>;
  refreshUser: () => Promise<void>;
  updateUserMetadata: (metadata: Partial<User['user_metadata']>) => Promise<{ data: { user: User | null } | null; error: Error | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  refreshWalletBalance: () => Promise<void>; // Added
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  language?: string;
  // any other options required by the game provider
}

export interface VipLevel {
  id: string | number;
  level: number;
  name: string;
  min_points: number;
  max_points?: number | null; // Null for the highest level
  cashback_percentage?: number;
  bonus_percentage?: number;
  benefits_description?: string;
  icon?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Bonus {
  id: string | number;
  name: string;
  description: string;
  type: 'deposit' | 'free_spins' | 'cashback' | 'tournament_prize' | 'vip_reward';
  amount?: number; // For fixed amount bonuses
  percentage?: number; // For percentage-based bonuses
  max_amount?: number; // Max bonus amount for percentage bonuses
  wagering_requirement?: number; // e.g., 30 for 30x
  valid_until?: string; // ISO date string
  status: 'active' | 'expired' | 'used' | 'upcoming';
  games_allowed?: string[]; // Array of game IDs or slugs
  min_deposit?: number; // Minimum deposit to claim (if applicable)
  promo_code?: string;
  vip_level_required?: number; // Minimum VIP level to claim
  created_at?: string;
  updated_at?: string;
}

export interface Affiliate {
  id: string; // user_id of the affiliate
  username?: string;
  email?: string;
  referral_code: string;
  total_referred_users: number;
  total_commission_earned: number;
  commission_rate_cpa?: number; // Cost Per Acquisition
  commission_rate_revenue_share?: number; // Percentage
  status: 'active' | 'pending' | 'suspended';
  created_at: string;
  updated_at: string;
  // You might have more detailed stats in separate tables or joined
  clicks?: number;
  registrations?: number;
  depositing_players?: number;
}

export interface KycDocument {
  id: string;
  user_id: string;
  document_type: 'id_card' | 'passport' | 'driver_license' | 'utility_bill' | 'bank_statement';
  file_url: string; // URL to the stored document in Supabase Storage
  status: 'pending_review' | 'approved' | 'rejected';
  rejection_reason?: string;
  uploaded_at: string;
  reviewed_at?: string;
  reviewed_by?: string; // Admin user ID
}

export interface KycStatus {
    status: 'not_started' | 'pending' | 'approved' | 'rejected' | 'resubmit_required';
    message?: string;
    lastChecked?: string;
    documents?: KycDocument[]; // Optional: if you want to include submitted docs info
}

export interface UserProfile extends User { // Assuming UserProfile extends base User type
  first_name?: string;
  last_name?: string;
  // Add other profile specific fields
}

export type Session = import('@supabase/supabase-js').Session;
export type SupabaseUser = import('@supabase/supabase-js').User;
