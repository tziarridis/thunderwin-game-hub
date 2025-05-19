export interface User {
  id: string;
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
  user_metadata?: {
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
    username?: string; // Added username
    first_name?: string;
    last_name?: string;
    // Custom fields
    kyc_status?: KycStatus; // Use the KycStatus type
    kyc_rejection_reason?: string;
    date_of_birth?: string;
    address_line1?: string;
    address_line2?: string;
    city?: string;
    state_province_region?: string;
    postal_code?: string;
    country?: string;
    [key: string]: any; 
  };
  identities?: Array<{
    identity_id: string;
    id: string;
    user_id: string;
    identity_data?: {
      [key: string]: any;
    };
    provider: string;
    last_sign_in_at: string;
    created_at: string;
    updated_at: string;
    email?: string; // if identity provider is email
  }>;
  created_at?: string;
  updated_at?: string;
  // Custom fields from your users table
  banned?: boolean;
  inviter_id?: string | null;
  affiliate_revenue_share?: number;
  inviter_code?: string | null;
  status?: string; // 'active', 'pending_verification', etc.
  language?: string; // e.g., 'en', 'es'
  currency?: string; // e.g., 'USD', 'EUR'
  // VIP fields
  vip_level?: number;
  vip_points?: number;
  // Responsible Gambling fields
  deposit_limit_daily?: number | null;
  deposit_limit_weekly?: number | null;
  deposit_limit_monthly?: number | null;
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_until?: string | null; // ISO date string
  // Wallet related fields (consider if these should be in a separate Wallet type)
  balance?: number; 
  // Optional profile fields
  username?: string;
  avatar_url?: string; // This one is common
  first_name?: string;
  last_name?: string;
  cpf?: string; // Example for specific regions
  // Computed or related fields (optional, might be populated on client)
  isAdmin?: boolean; 
  isAffiliate?: boolean;
  stats?: UserStats; // User game statistics
  // Other fields as defined in your public.users table
  role_id?: number;
  is_demo_agent?: boolean;
  affiliate_cpa?: number;
  affiliate_baseline?: number;
  oauth_id?: string | null;
  oauth_type?: string | null;
}

export type KycStatus = 'not_started' | 'pending' | 'approved' | 'rejected' | 'resubmit_required';


export interface UserStats {
  gamesPlayed: number;
  totalWagered: number;
  totalWon: number;
  winRate: number; // Percentage
  favoriteGame?: string; // Name or ID
  lastPlayed?: string; // Date string
  // Add more stats as needed
}


export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  balance_bonus?: number;
  currency: string; // e.g. 'USD', 'EUR', 'BTC'
  symbol: string; // e.g. '$', '€', '฿'
  active?: boolean;
  is_bonus_wallet?: boolean;
  created_at?: string;
  updated_at?: string;
  // Responsible gambling limits tied to wallet
  deposit_limit_daily?: number | null;
  deposit_limit_weekly?: number | null;
  deposit_limit_monthly?: number | null;
  // Other wallet specific fields from your wallets table
  balance_bonus_rollover?: number;
  balance_deposit_rollover?: number;
  balance_withdrawal?: number;
  balance_cryptocurrency?: number;
  balance_demo?: number;
  refer_rewards?: number;
  hide_balance?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
  last_won?: number;
  last_lose?: number;
  vip_level?: number;
  vip_points?: number;
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_until?: string | null;
  exclusion_period?: string;
}


export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  login: (credentials: { email?: string; password?: string; provider?: 'google' | 'discord' | 'github' }) => Promise<{ error: Error | null }>;
  register: (credentials: { email?: string; password?: string; username?: string; [key: string]: any }) => Promise<{ error: Error | null }>;
  logout: () => Promise<{ error: Error | null }>; // Added logout
  refreshUser: () => Promise<void>;
  updateUserMetadata: (metadata: Partial<User['user_metadata']>) => Promise<{ data: any; error: Error | null }>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  wallet: Wallet | null;
  refreshWalletBalance: () => Promise<void>;
}

export interface GameProvider {
  id: string | number; // Can be UUID (string) from DB or number from some APIs
  name: string;
  slug: string; // Add slug for routing/filtering
  logo?: string;
  description?: string;
  status: 'active' | 'inactive' | 'maintenance';
  games_count?: number; // Optional: number of games from this provider
  api_endpoint?: string; // For backend use primarily
  // Any other relevant fields
  type?: 'aggregator' | 'direct'; // Example
  region_restrictions?: string[];
}

export interface GameCategory {
  id: string | number; // Can be UUID (string) from DB or number from some APIs
  name: string;
  slug: string;
  description?: string;
  icon?: string; // e.g., Lucide icon name or URL
  image?: string; // URL for a representative image
  status: 'active' | 'inactive';
  game_count?: number;
  parent_category_id?: string | number | null; // For subcategories
  order?: number; // For sorting
}

export interface Game {
  id: string | number; // Game's unique ID (can be string UUID or number from provider)
  slug: string;        // URL-friendly identifier
  title: string;
  provider: string;    // Provider's slug or ID
  providerName?: string; // Display name of the provider
  category: string;    // Category slug or ID (can be an array if multi-category)
  categoryName?: string; // Display name of the category
  category_slugs?: string[] | string; // Can be an array of slugs or single slug
  image?: string;       // URL for the game's thumbnail/cover
  banner?: string;      // URL for a larger banner image (optional)
  description?: string;
  rtp?: number;         // Return to Player percentage
  volatility?: 'low' | 'medium' | 'high' | ''; // Game volatility
  tags?: string[];      // e.g., ["popular", "new", "jackpot"]
  features?: string[];  // e.g., ["free_spins", "bonus_game", "multipliers"]
  themes?: string[];    // e.g., ["adventure", "fruits", "mythology"]
  releaseDate?: string; // ISO date string
  isFavorite?: boolean; // Whether the current user has favorited this game
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  views?: number;
  
  // Technical details (often from provider or DB)
  game_id?: string;       // Provider's specific game ID/code
  game_code?: string;     // Internal game code, if different from slug/id
  provider_id?: string | number; // ID of the provider in your system
  
  // Gameplay details
  minBet?: number;
  maxBet?: number;
  lines?: number;         // Paylines for slots
  jackpot_current_amount?: number; // If it's a progressive jackpot game
  jackpot?: boolean; // Simplified jackpot flag
  
  // For launching
  launch_url?: string; // If pre-fetched or available
  
  // From DbGame if different
  name?: string; // Alias for title if source uses 'name'
  cover?: string; // Alias for image if source uses 'cover'
  image_url?: string; // Another alias for image
  created_at?: string;
  updated_at?: string;
  provider_slug?: string; // Ensure this is present

  // For admin/backend
  meta_data?: Record<string, any>; // For any other provider-specific data
}


export interface DbGame {
  id: string; // Assuming UUID
  provider_id?: string | null; // UUID, FK to providers table
  provider_slug?: string | null; // Denormalized for easier querying
  provider_name?: string | null; // Denormalized
  category_ids?: string[] | null; // Array of UUIDs, FK to categories table
  category_slugs?: string[] | string | null; // Denormalized
  category_names?: string[] | string | null; // Denormalized
  
  title: string;
  slug: string; // Unique slug for URL
  game_id?: string | null; // External game ID from provider
  game_code?: string | null; // Internal game code/identifier

  description?: string | null;
  image_url?: string | null; // Main display image
  cover?: string | null; // Often used for card display
  banner?: string | null; // For game detail pages or promotions

  rtp?: number | null;
  volatility?: 'low' | 'medium' | 'high' | '' | null;
  status: 'active' | 'inactive' | 'maintenance'; // Ensure this matches DB enum/check constraint
  
  tags?: string[] | null; // Stored as array in Postgres
  features?: string[] | null; // Stored as array
  themes?: string[] | null; // Stored as array

  is_featured?: boolean;
  is_new?: boolean;
  is_popular?: boolean;
  show_home?: boolean; // To show on homepage grid

  views?: number;
  release_date?: string | null; // ISO date string
  
  min_bet?: number | null;
  max_bet?: number | null;
  lines?: number | null;
  jackpot_amount?: number | null;


  // Technical details from provider
  // game_server_url?: string | null;
  // technology?: string | null; // e.g., HTML5, Flash (legacy)
  // has_lobby?: boolean;
  // is_mobile?: boolean;
  // has_freespins?: boolean;
  // has_tables?: boolean; // For table games
  // only_demo?: boolean;
  // distribution?: string | null; // e.g., 'direct', 'aggregator'
  
  meta_data?: Record<string, any> | null; // JSONB for extra fields

  created_at: string; // ISO date string
  updated_at: string; // ISO date string
}


export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  playerId: string;
  currency: string;
  language?: string; // e.g., 'en', 'es'
  platform?: 'web' | 'mobile'; // Or 'desktop', 'tablet'
  returnUrl?: string; // URL to return to after game session
  token?: string; // Session token if required by provider
  [key: string]: any; // Allow other provider-specific options
}

export interface Transaction {
  id: string; // Transaction UUID
  user_id: string; // User UUID
  wallet_id?: string; // Wallet UUID if applicable
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus_credit' | 'bonus_debit' | 'adjustment_credit' | 'adjustment_debit' | 'jackpot_win' | 'affiliate_commission';
  amount: number; // Can be positive or negative
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled' | 'processing';
  description?: string; // e.g., "Bet on Starburst slot", "Withdrawal to Visa **** 1234"
  created_at: string; // ISO date string
  updated_at: string; // ISO date string

  // Optional fields depending on transaction type
  provider?: string; // Payment provider or game provider
  game_id?: string; // If 'bet' or 'win'
  round_id?: string; // Game round ID
  payment_method?: string;
  external_transaction_id?: string; // ID from payment gateway or game provider
  balance_before?: number;
  balance_after?: number;
  bonus_id?: string; // If related to a bonus
  notes?: string; // Admin notes
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'deposit_match' | 'free_spins' | 'cashback' | 'tournament' | 'reload_bonus' | 'no_deposit_bonus' | 'other';
  image_url?: string;
  start_date: string; // ISO date string
  end_date: string | null; // ISO date string, or null for ongoing
  terms_and_conditions: string;
  status: 'active' | 'expired' | 'upcoming' | 'draft';
  eligibility?: {
    type: 'all_users' | 'new_users' | 'existing_users' | 'vip_level';
    min_deposit?: number;
    min_vip_level?: string; // e.g., 'gold', 'platinum'
    excluded_countries?: string[];
  };
  bonus_details?: {
    // Deposit Match
    percentage?: number;
    max_amount?: number;
    currency?: string;
    // Free Spins
    free_spins_count?: number;
    game_id?: string; // Game ID for free spins
    game_slug?: string; // Game slug for free spins
    spin_value?: number;
    // Cashback
    // percentage?: number; // (already there)
    calculation_period?: 'daily' | 'weekly' | 'monthly';
    // Tournament
    prize_pool?: number;
    // currency?: string; // (already there)
    // No Deposit
    // amount?: number; // (already there)
    // currency?: string; // (already there)
  };
  wagering_requirement?: number; // e.g., 35 for 35x
  max_bet_while_active?: number;
  validity_days?: number; // How long the bonus/spins are valid after claiming
  cta_text?: string; // Call to action button text, e.g., "Claim Now"
  claimed_by_user?: boolean; // UI state, not usually DB
  usage_limit_per_user?: number; // Default 1
  total_usage_limit?: number; // Total times promo can be claimed overall
}

export interface VipLevel {
  id: string;
  name: string;
  required_points: number;
  description?: string;
  icon?: string; // Lucide icon name or URL
  benefits?: string[]; // Array of benefit descriptions
  monthly_cashback_percentage?: number;
  dedicated_support?: boolean;
  // other fields
}

export interface Bonus {
  id: string;
  name:string;
  description?: string;
  type: 'deposit' | 'free_spins' | 'cashback' | 'loyalty_points'; // Example types
  amount?: number; // For cash bonuses or percentage
  currency?: string;
  free_spins_count?: number;
  game_id?: string; // For spins on a specific game
  wagering_requirement?: number; // e.g., 30 for 30x
  validity_days?: number;
  vip_level_id?: string | null; // Link to VIP level
  is_active: boolean;
  code?: string | null; // Optional bonus code
  start_date?: string | null; // ISO date string
  end_date?: string | null; // ISO date string
  // Any other fields relevant to bonuses
  max_bonus_amount?: number;
  min_deposit_for_bonus?: number;
}

// For Dashboard
export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDeposits: number;
  totalWithdrawals: number;
  totalWagered: number;
  totalGGR: number; // Gross Gaming Revenue
  gamesPlayed: number;
  newSignupsToday: number;
  averageSessionTime: string; // e.g., "25 min"
  mostPopularGame: { name: string; plays: number };
  recentTransactions: Transaction[]; // Limited list
  // Add more as needed
}

export interface DbWallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol: string;
  active: boolean;
  created_at: string;
  updated_at: string;
  // ... any other fields from your wallets table
}
