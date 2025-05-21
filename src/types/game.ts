// src/types/game.ts

export interface GameCategory {
  id: string; // uuid
  name: string;
  slug: string;
  icon?: string | null; // URL or Lucide icon name
  imageUrl?: string | null;
  description?: string | null;
  gameCount?: number;
  isActive?: boolean;
  // order?: number; // For display sorting
}

export interface GameProvider {
  id: string; // uuid
  name: string;
  slug: string; // URL-friendly name
  logoUrl?: string | null;
  description?: string | null;
  isActive?: boolean;
  game_ids?: string[]; // List of game IDs from this provider
  // rating?: number;
  // popularGames?: Pick<Game, 'id' | 'title' | 'slug' | 'cover'>[]; // A few popular games
}

export interface Game {
  id: string; // Internal DB ID (UUID)
  game_id?: string; // External ID from provider (string)
  title: string;
  slug: string; // URL-friendly identifier (unique)
  description?: string | null;
  providerName?: string; // Denormalized for convenience
  provider_slug?: string; // Denormalized
  provider_id?: string; // FK to providers table
  categoryName?: string; // Denormalized primary category name
  category_slugs?: string[] | null; // Array of category slugs this game belongs to
  tags?: string[] | null; // e.g., "new", "hot", "jackpot", "megaways"
  rtp?: number | null; // Return to Player percentage
  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high' | string | null;
  cover?: string | null; // URL for main game image (e.g., for cards)
  image?: string | null; // Alias or alternative for cover
  image_url?: string | null; // Another alias
  bannerUrl?: string | null; // URL for larger banner image (e.g., for hero sections)
  releaseDate?: string | null; // ISO date string
  isNew?: boolean;
  isPopular?: boolean; // Based on plays or manual setting
  is_featured?: boolean; // Manually set as featured
  only_demo?: boolean; // If true, only demo mode is available
  only_real?: boolean; // If true, only real mode is available (no demo)
  views?: number; // Total views/plays
  status: 'active' | 'inactive' | 'maintenance' | string; // Game status
  
  // More detailed properties (optional)
  lines?: number | null; // Paylines for slots
  reels?: number | null; // Reels for slots
  features?: string[] | null; // e.g., "FreeSpins", "BonusGame", "WildMultiplier"
  min_bet?: number | null;
  max_bet?: number | null;
  default_bet?: number | null; // Added for default bet
  currencies_accepted?: string[] | null;
  languages_supported?: string[] | null;
  
  // Technical details (optional)
  technology?: 'html5' | 'flash' | string | null;
  is_mobile_compatible?: boolean;
  
  // For game launching
  launch_url_template?: string | null; // If URL construction is simple
  api_integration_type?: string | null; // e.g., 'direct_api', 'iframe_url'
  
  // Timestamps
  created_at?: string;
  updated_at?: string;

  // For Game Aggregators - these fields may come from the aggregator's API
  aggregator_game_id?: string;
  aggregator_provider_id?: string;
}


export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string; // Required for 'real' mode
  username?: string; // For display or provider API
  currency?: string; // User's currency
  language?: string; // Preferred game language
  token?: string; // Session token or JWT for provider
  platform?: 'web' | 'mobile' | 'desktop';
  returnUrl?: string; // URL to return to after game session (if applicable)
  // ... any other provider-specific parameters
  [key: string]: any;
}

export interface GameFilters {
  category?: string; // Category slug
  provider?: string; // Provider slug
  tag?: string;
  searchTerm?: string;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  rtpMin?: number;
  rtpMax?: number;
  volatility?: 'low' | 'medium' | 'high';
  // ... other potential filters
}

export interface GameSort {
  field: keyof Game | 'popularity' | 'default'; // 'popularity' could be based on views/plays
  order: 'asc' | 'desc';
}
