export interface Affiliate {
  id: string | number;
  username?: string;
  total_referred_users?: number;
  total_commission_earned?: number;
  referral_code?: string;
  status?: string;
  commission_rate?: number; // Instead of commission_rate_cpa
  commission_rate_cpa?: number;
  commission_rate_revenue_share?: number;
  // other fields
}

export interface User {
  // ... other fields
  email?: string;
  role?: 'user' | 'admin' | 'editor'; // Example roles
  stats?: {
    totalBets?: number;
    totalWagered?: number;
    totalWins?: number;
  };
  // ... other existing User fields
  id: string;
  aud?: string;
  app_metadata?: { [key: string]: any };
  user_metadata?: { [key: string]: any; first_name?: string; last_name?: string; avatar_url?: string; name?: string; currency?: string; language?: string; };
  created_at?: string;
  updated_at?: string;
  // Fields from your custom users table if merged
  username?: string;
  vip_level?: number;
  banned?: boolean;
  status?: string; // e.g. 'active', 'pending'
}

export interface Game {
  // ... other fields
  id: string | number;
  title: string;
  providerName?: string; // For display
  provider_slug?: string; // For API calls / keys
  provider?: string; // Fallback or alternative
  categoryName?: string; // For display
  category_slugs?: string[] | string; // For API calls / keys or as a string
  category?: string; // Fallback
  image?: string;
  image_url?: string;
  cover?: string;
  banner?: string;
  rtp?: number | string;
  volatility?: string;
  slug?: string;
  tags?: string[];
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  description?: string;
  minBet?: number | string;
  maxBet?: number | string;
  lines?: number | string;
  features?: string[];
  themes?: string[];
  status?: string;
  game_id?: string; // External game ID
  game_code?: string; // External game code
  release_date?: string;
  // From DbGame potentially
  provider_id?: string;
}

export interface DbGame { // Assuming this is a more raw DB representation
  id: string | number;
  title: string;
  provider_slug?: string;
  category_slugs?: string[] | string; // Stored as array or comma-separated string
  image_url?: string;
  cover?: string;
  banner?: string;
  description?: string;
  rtp?: number;
  volatility?: string;
  min_bet?: number | string;
  max_bet?: number | string;
  lines?: number | string;
  features?: string[]; // Stored as JSON array or comma-separated string
  themes?: string[];
  tags?: string[];
  status?: string;
  slug?: string;
  game_id?: string;
  game_code?: string;
  provider_id?: string; // Internal provider link
  is_new?: boolean;
  is_popular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  release_date?: string;
  // Potentially raw names from DB if different
  provider_name?: string; // if directly stored
  category_names?: string[]; // if directly stored
}


export interface Wallet {
  id: string;
  user_id: string;
  balance: number;
  currency: string;
  symbol?: string;
  // ... other wallet fields
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string;
  currency?: string;
  platform?: string;
  language?: string;
  returnUrl?: string;
}

export interface Transaction {
  id: string | number;
  user_id: string;
  amount: number | string;
  currency?: string;
  type?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  provider?: string;
  game_id?: string;
  gameName?: string;
  round_id?: string;
  details?: string;
  balance_after?: number;
}
