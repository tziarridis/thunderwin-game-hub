
export type GameStatus = 'active' | 'inactive' | 'maintenance' | 'pending_review' | 'draft' | 'archived';
export type GameVolatility = 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high';

export interface GameProvider {
  id: string;
  name: string;
  slug?: string;
  logoUrl?: string;
  games?: Game[];
  status?: 'active' | 'inactive' | 'coming_soon';
  description?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  icon_svg?: string; // For SVG icons
  icon?: string; // Added for compatibility with read-only components
  game_ids?: string[]; // List of game IDs in this category
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string;
  currency?: string;
  platform?: 'mobile' | 'desktop' | 'web';
  language?: string;
  token?: string;
  returnUrl?: string;
}

export interface Game {
  id: string; // Usually the database UUID
  game_id: string; // Provider's specific game ID or code
  title: string;
  slug: string;
  description?: string;
  
  providerName: string; // Denormalized for convenience
  provider_slug: string; // Denormalized for convenience
  provider?: { name: string; slug?: string }; // Added for compatibility with GameCard.tsx

  categoryName?: string; // Main category name
  category_slugs: string[]; // Slugs of categories it belongs to
  
  image_url?: string; // Primary image, thumbnail
  image?: string; // Fallback or alternative field for image
  cover?: string; // Often used for game cover image
  bannerUrl?: string; // For promotional banners
  
  rtp?: number; // Return to Player percentage
  volatility?: GameVolatility;
  lines?: number; // Paylines for slots
  min_bet?: number;
  max_bet?: number;
  
  features?: string[]; // e.g., "bonus-buy", "free-spins", "megaways"
  tags?: string[]; // e.g., "popular", "new", "hot", "demo_playable", "demo"
  themes?: string[]; // e.g., "adventure", "egyptian", "space"
  
  isPopular?: boolean;
  isNew?: boolean;
  is_featured?: boolean; // if it's specifically featured
  show_home?: boolean; // whether to show on homepage sections
  
  launch_url?: string; // Direct URL to launch the game (if applicable)
  demo_url?: string; // URL for demo mode
  
  status: GameStatus; // Current status of the game
  releaseDate?: string; // ISO date string
  
  game_code?: string; // Alternative game identifier if needed

  // Fields from DbGame that might not be directly on Game but are good to have for mapping
  provider_id?: string; // Foreign key to providers table
  created_at?: string;
  updated_at?: string;

  // New fields to consider based on common needs
  views?: number;
  likes?: number;
  has_jackpot?: boolean;
  supported_currencies?: string[];
  supported_languages?: string[];
  technology?: 'html5' | 'flash' | 'other'; // Game technology

  only_demo?: boolean; // Ensure this exists
  only_real?: boolean; // Ensure this exists
}

// Represents the structure of game data as stored in the database (e.g., Supabase 'games' table)
export interface DbGame {
  id: string; // Primary key (UUID)
  game_id: string; // Provider's game ID
  game_name: string; // Title of the game
  slug: string;
  provider_id?: string | null; // Foreign key to your providers table
  provider_slug?: string | null; // Denormalized provider slug
  
  game_type?: string | null; // Main category or type from DB
  category_slugs?: string[] | null; // Array of category slugs
  
  description?: string | null;
  cover?: string | null; // Main image URL
  banner_url?: string | null; // Added banner_url
  banner?: string | null; // Added banner as potential alias
  image_url?: string | null; // Fallback for image
  
  rtp?: number | string | null; // Can be string from DB, needs parsing
  volatility?: GameVolatility | string | null; // Can be string from DB
  lines?: number | null;
  min_bet?: number | null;
  max_bet?: number | null;
  
  features?: string[] | null; // JSONB array
  tags?: string[] | null; // JSONB array
  themes?: string[] | null; // JSONB array
  
  is_popular?: boolean | null;
  is_new?: boolean | null;
  is_featured?: boolean | null;
  show_home?: boolean | null;
  
  status?: GameStatus | string | null; // Status from DB
  release_date?: string | null; // ISO date string
  created_at?: string | null;
  updated_at?: string | null;
  
  game_code?: string | null; // Specific game code
  distribution?: string | null; // e.g. provider name if not using provider_id
  technology?: string | null;
  game_server_url?: string | null;
  has_lobby?: boolean | null;
  is_mobile?: boolean | null;
  has_freespins?: boolean | null;
  has_tables?: boolean | null;
  only_demo?: boolean | null;
  only_real?: boolean | null; // Ensure this exists
  views?: number | null;
  // Relation to providers table (if you join)
  providers?: { name: string; slug: string } | null; // Example if providers table is joined
  title?: string; // Alternative for game_name
}

