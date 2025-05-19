export interface Affiliate {
  id: string | number;
  username?: string;
  total_referred_users?: number;
  total_commission_earned?: number;
  referral_code?: string;
  status?: string;
  commission_rate?: number; 
  commission_rate_cpa?: number;
  commission_rate_revenue_share?: number;
  // other fields
}

export interface User {
  id: string; // From Supabase auth
  aud?: string; // From Supabase auth
  email?: string; // From Supabase auth
  app_metadata?: { provider?: string; providers?: string[]; [key: string]: any }; // From Supabase auth
  user_metadata?: {
    // Standard Supabase user_metadata fields
    avatar_url?: string;
    email?: string; // Can be duplicated here
    email_verified?: boolean;
    full_name?: string;
    iss?: string;
    name?: string; // Often same as full_name or username
    picture?: string; // Often same as avatar_url
    provider_id?: string;
    sub?: string; // Usually the user ID

    // Custom fields from your users table or for profile
    first_name?: string;
    last_name?: string;
    username?: string; // Can also be a top-level field
    currency?: string;
    language?: string;
    country?: string; // Custom
    city?: string; // Custom
    address?: string; // Custom
    birthdate?: string; // Custom (ISO string date YYYY-MM-DD)
    kyc_status?: 'pending' | 'approved' | 'rejected' | 'none'; // Custom
    two_factor_enabled?: boolean; // Custom
    [key: string]: any; // Allow other custom fields
  };
  created_at?: string; // From Supabase auth
  updated_at?: string; // From Supabase auth & users table

  // Fields from your custom 'users' table if merged or separate profile
  username?: string; // This can be from users table, ensure consistency
  role?: 'user' | 'admin' | 'editor'; // Example roles, from users table
  vip_level?: number; // From users table
  banned?: boolean; // From users table
  status?: string; // e.g. 'active', 'pending', from users table
  phone?: string; // From users table

  stats?: { // User activity stats
    totalBets?: number;
    totalWagered?: number;
    totalWins?: number;
  };
}

export interface Game {
  // ... other fields
  id: string | number; // Can be DB id or external game_id
  title: string;
  providerName?: string; 
  provider_slug?: string; 
  provider?: string; 
  categoryName?: string; 
  category_slugs?: string[] | string; 
  category?: string; 
  image?: string; // URL for the game image/thumbnail
  image_url?: string; // Alternative if image is not used
  cover?: string; // Larger image or banner
  banner?: string;
  rtp?: number | string;
  volatility?: string;
  slug?: string; // URL-friendly identifier
  tags?: string[]; // e.g., "new", "popular", "jackpot", "bonus-buy", "demo_playable"
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  description?: string;
  minBet?: number | string;
  maxBet?: number | string;
  lines?: number | string;
  features?: string[]; // Game features like "free spins", "multipliers"
  themes?: string[]; // Game themes like "egypt", "fantasy"
  status?: string; // e.g., "active", "disabled"
  game_id?: string; // External game ID from provider
  game_code?: string; // External game code from provider, often same as game_id
  release_date?: string; // ISO string date
  provider_id?: string; // Internal DB link to a provider table
}

export interface DbGame { // Raw DB representation
  id: string | number;
  title: string;
  provider_slug?: string;
  category_slugs?: string[] | string; 
  image_url?: string;
  cover?: string;
  banner?: string;
  description?: string;
  rtp?: number;
  volatility?: string;
  min_bet?: number | string;
  max_bet?: number | string;
  lines?: number | string;
  features?: string[]; 
  themes?: string[];
  tags?: string[];
  status?: string;
  slug?: string;
  game_id?: string; 
  game_code?: string; 
  provider_id?: string; 
  is_new?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  release_date?: string;
  provider_name?: string; 
  category_names?: string[]; 
}


export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol?: string;
  vip_level?: number; // Added from Supabase table schema
  vip_points?: number; // Added from Supabase table schema
  // ... other wallet fields from your Supabase 'wallets' table
  balance_bonus_rollover?: number;
  balance_deposit_rollover?: number;
  balance_withdrawal?: number;
  balance_bonus?: number;
  balance_cryptocurrency?: number;
  balance_demo?: number;
  refer_rewards?: number;
  hide_balance?: boolean;
  active?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
  last_won?: number;
  last_lose?: number;
  deposit_limit_daily?: number;
  deposit_limit_weekly?: number;
  deposit_limit_monthly?: number;
  exclusion_until?: string; // timestamp
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_period?: string;
  created_at?: string; // timestamp
  updated_at?: string; // timestamp
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string;
  currency?: string;
  platform?: string; // e.g., 'web', 'mobile'
  language?: string; // e.g., 'en', 'es'
  returnUrl?: string; // URL to redirect after game session
  // Provider specific options can be added here
  [key: string]: any;
}

export interface Transaction {
  id: string | number;
  user_id: string; // This should reference your app's user ID (e.g., from users table or auth.users)
  amount: number | string;
  currency?: string;
  type?: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund' | 'rollback' | string; // String for flexibility
  status?: 'pending' | 'completed' | 'failed' | 'cancelled' | string;
  created_at?: string; // ISO timestamp
  updated_at?: string; // ISO timestamp
  provider?: string; // e.g., 'PragmaticPlay', 'PaymentGatewayName', 'ManualAdjustment'
  game_id?: string; // External game ID if transaction is game-related
  gameName?: string; // Display name of the game
  round_id?: string; // Game round identifier
  details?: string | object; // Can be JSON string or object for additional info
  balance_after?: number; // User's balance after this transaction
  // Fields from your Supabase 'transactions' table
  player_id?: string; // This might be redundant if user_id is already your internal user ID
  session_id?: string; // Game session ID
  balance_before?: number;
}

// New Type Definitions
export interface GameCategory {
  id: string | number;
  name: string;
  slug: string;
  icon?: string; // URL or Lucide icon name
  image?: string; // URL for a background or illustrative image
  game_count?: number; // Optional: number of games in this category
}

export interface GameProvider {
  id: string | number; // Can be DB id or slug
  name: string;
  slug?: string; // URL-friendly identifier
  logo?: string; // URL to the provider's logo
  game_count?: number; // Optional: number of games from this provider
  description?: string;
  status?: 'active' | 'inactive';
}

export interface Promotion {
  id: string | number;
  title: string;
  description: string;
  image_url?: string; // URL for the promotion banner/image
  cta_link?: string; // Call to action link (e.g., /deposit, /games/somegame)
  cta_text?: string; // Text for the call to action button (e.g., "Claim Now", "Play Game")
  start_date?: string; // ISO timestamp
  end_date?: string; // ISO timestamp
  terms_conditions_link?: string; // Link to detailed terms
  type?: 'deposit-bonus' | 'free-spins' | 'cashback' | 'tournament' | string;
  status?: 'active' | 'expired' | 'upcoming';
  tags?: string[]; // e.g., "welcome-offer", "slots-only"
}
