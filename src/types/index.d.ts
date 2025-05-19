export interface Game {
  id: string | number; // Keep as is, handle conversion to string where string is strictly needed
  title: string;
  provider?: string;
  provider_slug?: string; // Added
  providerName?: string;
  category?: string;
  category_slugs?: string[] | string; // Added
  categoryName?: string;
  image?: string;
  cover?: string; // Added
  image_url?: string; // from DbGame
  description?: string;
  rtp?: number | string; // Allow string for initial data, parse to number
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  lines?: number;
  features?: string[];
  themes?: string[];
  tags?: string[];
  isFavorite?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean; // Added
  show_home?: boolean; // Added
  status?: string; // 'active', 'inactive', 'maintenance'
  slug?: string;
  views?: number;
  release_date?: string; // Or Date
  created_at?: string;
  updated_at?: string;
  banner?: string; // Added
  game_id?: string; // External game ID from provider
  game_code?: string; // External game code for provider
  provider_id?: string; // From DbGame
  // Deprecated, use providerName or provider_slug
  // provider_name?: string; 
  // category_name?: string;
  // releaseDate?: string; // use release_date
}

export interface DbGame {
  id: string; // uuid
  title: string;
  provider_id?: string; // uuid, fkey to providers table
  provider_slug?: string; // denormalized or joined
  category_ids?: string[]; // uuids, if many-to-many for categories
  category_slugs?: string[] | string; // array or comma-separated string for multiple categories
  description?: string;
  rtp?: number;
  volatility?: 'low' | 'low-medium' | 'medium' | 'medium-high' | 'high' | string; // Enforce enum if possible
  min_bet?: number;
  max_bet?: number;
  lines?: number;
  features?: string[]; // Store as JSONB array in DB
  themes?: string[]; // Store as JSONB array in DB
  tags?: string[]; // Store as JSONB array in DB
  image_url?: string; // Main display image
  cover?: string; // Alternative cover/thumbnail
  banner?: string; // For promotional banners
  status: 'active' | 'inactive' | 'maintenance' | string; // Game status
  is_new?: boolean;
  is_popular?: boolean;
  is_featured?: boolean; // For editor picks, homepage features
  show_home?: boolean; // Specifically for a "show on homepage" section
  slug: string; // URL-friendly identifier
  views?: number;
  release_date?: string; // ISO date string
  game_id?: string; // External game ID from provider
  game_code?: string; // External game code for provider if different from game_id
  // Timestamps
  created_at?: string;
  updated_at?: string;
  // Fields that might be on Game but not directly on DbGame if they are from joins
  provider_name?: string;
  category_names?: string[];
}


export interface GameProvider {
  id: string; // Typically UUID
  name: string;
  slug: string; // URL-friendly identifier
  logo?: string;
  description?: string;
  status: 'active' | 'inactive' | 'pending'; // Provider status
  // API related fields might be here or in a more secure config
  api_endpoint?: string;
  // api_key?: string; // Sensitive, manage carefully
  // api_secret?: string; // Sensitive, manage carefully
  created_at?: string;
  updated_at?: string;
  // Potentially a list of game IDs or a way to query games by this provider
  games_count?: number;
}

export interface GameCategory {
  id: string; // Typically UUID
  name: string;
  slug: string; // URL-friendly identifier
  description?: string;
  icon?: string; // For UI
  image?: string; // For UI, like a banner for the category
  status: 'active' | 'inactive';
  show_home?: boolean; // If this category should be featured on home
  order?: number; // For sorting categories
  created_at?: string;
  updated_at?: string;
  // Parent category ID if you have subcategories
  // parent_id?: string; 
  // games_count?: number;
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string; // Changed from playerId
  currency?: string;
  language?: string;
  platform?: 'web' | 'mobile' | string; // Allow string for flexibility
  token?: string; // Session token if required by provider
  returnUrl?: string; // URL to return to after game session
  balance?: number; // Optional: pass current balance if API supports it
  // any other provider-specific options
  [key: string]: any; // Allows for additional, unspecified properties
}

export interface User {
  id: string;
  aud?: string;
  role?: string; // Role name like 'admin', 'user'
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
    full_name?: string; // Often combination of first and last
    name?: string; // Often used for display name
    first_name?: string; // Added
    last_name?: string; // Added
    // any other custom metadata
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
  }>;
  created_at?: string;
  updated_at?: string;
  // Custom application-specific fields that might be merged from a 'profiles' or 'users' table
  username?: string;
  vip_level?: number;
  // Added based on UserForm and Supabase users table
  status?: string; // e.g., 'active', 'pending'
  banned?: boolean;
  role_id?: number; // If using numeric role IDs
  country?: string;
  city?: string;
  address?: string;
  birthdate?: string; // Consider Date type if parsing
  kyc_status?: string;
  two_factor_enabled?: boolean;
  // For UserStats
  stats?: {
    totalBets?: number;
    totalWagered?: number;
    totalWins?: number;
  };
}

export interface Wallet {
  // ... wallet properties
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol?: string; // Added for currency symbol
  // ... other wallet fields
}

export interface Transaction {
  // ... transaction properties
  id: string;
  wallet_id: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win';
  status: 'pending' | 'completed' | 'failed';
  // ... other transaction fields
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  link?: string;
  type?: 'bonus' | 'free_spins' | 'tournament';
  terms?: string;
  start_date?: string;
  end_date?: string;
  status?: 'active' | 'expired' | 'upcoming';
}

// Added Affiliate type
export interface Affiliate {
  id: string;
  user_id: string; // The user who is an affiliate
  code: string; // Unique affiliate code
  commission_rate: number; // Percentage or fixed amount
  created_at: string;
  // Add other relevant fields
}
