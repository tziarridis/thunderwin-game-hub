
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
  logoUrl?: string | null; // Changed from logo to logoUrl for consistency
  description?: string | null;
  isActive?: boolean;
  game_ids?: string[]; // List of game IDs from this provider
  // rating?: number;
  // popularGames?: Pick<Game, 'id' | 'title' | 'slug' | 'cover'>[]; // A few popular games
}

// This is the primary Game type used throughout the frontend UI
export interface Game {
  id: string; // Internal DB ID (UUID) or aggregator game ID
  game_id?: string; // External ID from provider (string), can be same as id for some aggregators
  title: string;
  slug: string; // URL-friendly identifier (unique)
  description?: string | null;
  
  providerName?: string; // Denormalized for convenience from providers table or aggregator
  provider_slug?: string; // Denormalized slug from providers table or aggregator
  provider_id?: string; // FK to providers table (if using local providers table)

  categoryName?: string; // Denormalized primary category name
  category_slugs?: string[] | null; // Array of category slugs this game belongs to
  
  tags?: string[] | null; // e.g., "new", "hot", "jackpot", "megaways", "demo_playable"
  
  rtp?: number | null; // Return to Player percentage
  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high' | string | null; // Allow general string for flexibility
  
  cover?: string | null; // URL for main game image (e.g., for cards)
  image?: string | null; // Alias or alternative for cover
  image_url?: string | null; // Another alias
  
  bannerUrl?: string | null; // URL for larger banner image
  
  releaseDate?: string | null; // ISO date string
  
  isNew?: boolean; // Tag or calculated
  isPopular?: boolean; // Based on plays or manual setting
  is_featured?: boolean; // Manually set as featured
  show_home?: boolean; 
  
  only_demo?: boolean; // If true, only demo mode is available
  only_real?: boolean; // If true, only real mode is available (no demo)
  
  views?: number; // Total views/plays
  status: 'active' | 'inactive' | 'maintenance' | 'pending_review' | 'draft' | 'archived' | string; // Game status - WIDENED
  
  lines?: number | null; 
  reels?: number | null; 
  features?: string[] | null; 
  themes?: string[] | null; 
  
  min_bet?: number | null; // Corrected from minBet
  max_bet?: number | null; // Corrected from maxBet
  default_bet?: number | null;
  
  currencies_accepted?: string[] | null;
  languages_supported?: string[] | null;
  
  game_code?: string | null; // External game code for launching (often same as game_id)
  
  technology?: 'html5' | 'flash' | string | null;
  is_mobile_compatible?: boolean;
  
  launch_url_template?: string | null; 
  api_integration_type?: string | null; 
  
  created_at?: string;
  updated_at?: string;

  // For Game Aggregators - these fields may come from the aggregator's API
  aggregator_game_id?: string;
  aggregator_provider_id?: string;

  // Allow any other properties that might come from various APIs
  [key: string]: any;
}

// This type represents the structure of a game record from the 'games' table in Supabase
// It should align with the columns defined in the 'games' table schema.
export interface DbGame {
  id: string; // uuid from DB
  provider_id?: string | null; // uuid, FK to providers table
  has_lobby?: boolean | null;
  is_mobile?: boolean | null;
  has_freespins?: boolean | null;
  has_tables?: boolean | null;
  only_demo?: boolean | null;
  rtp?: number | null; // In DB it's numeric, adapter will handle
  views?: number | null; // bigint in DB
  is_featured?: boolean | null;
  show_home?: boolean | null;
  created_at?: string | null; // timestamp with time zone
  updated_at?: string | null; // timestamp with time zone
  game_type?: string | null; // character varying (maps to categoryName or part of category_slugs)
  description?: string | null; // character varying
  cover?: string | null; // character varying (maps to image/cover/image_url)
  status?: string | null; // character varying (maps to Game['status'])
  technology?: string | null; // character varying
  distribution?: string | null; // character varying (could map to providerName/slug if provider_id is not used)
  game_server_url?: string | null; // character varying
  game_id: string; // character varying (provider's game ID) - This is crucial for launching
  game_name: string; // character varying (maps to title)
  game_code: string; // character varying (provider's launch code, often same as game_id)

  // Fields from 'providers' table if joined (denormalized in Game, but separate in DbGame context if querying 'games' table directly)
  // These would typically be populated if DbGame is the result of a join with 'providers'
  provider_slug?: string | null; // from providers.slug
  providers?: { name: string | null; slug: string | null; [key: string]: any; } | null; // If providers table is joined

  // Fields from 'game_categories' table if joined
  category_slugs?: string[] | null; // This might be a relation or a text array in DB, needs careful mapping

  // Allow any other properties that might come from various APIs or DB structure
  [key: string]: any;
}


export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string; 
  username?: string; 
  currency?: string; 
  language?: string; 
  token?: string; 
  platform?: 'web' | 'mobile' | 'desktop';
  returnUrl?: string; 
  [key: string]: any;
}

export interface GameFilters {
  category?: string; 
  provider?: string; 
  tag?: string;
  searchTerm?: string;
  isNew?: boolean;
  isPopular?: boolean;
  isFeatured?: boolean;
  rtpMin?: number;
  rtpMax?: number;
  volatility?: 'low' | 'medium' | 'high' | string; // Allow general string
}

export interface GameSort {
  field: keyof Game | 'popularity' | 'default'; 
  order: 'asc' | 'desc';
}
