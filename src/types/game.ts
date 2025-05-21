
// Game Enums (can be extended)
export type GameStatus = "active" | "inactive" | "pending" | "blocked" | "maintenance" | "pending_review" | "draft" | "archived";
export type GameVolatility = "low" | "medium" | "high" | "low-medium" | "medium-high";

// Game Tag
export interface GameTag {
  id: string;
  name: string;
  slug: string;
}

// Game Provider
export interface GameProvider {
  id: string | number; // Keep flexible as in index.ts
  name: string;
  slug: string; // Ensure this is present
  logoUrl?: string;
  description?: string;
  isActive?: boolean; // As in index.ts
  games_count?: number; // As in index.ts
  // Fields from game.ts's GameProvider
  games?: Game[]; // Game array from game.ts GameProvider
  status?: 'active' | 'inactive' | 'coming_soon'; // Status from game.ts GameProvider
}

// Game Category
export interface GameCategory {
  id: string | number; // Keep flexible
  name: string;
  slug: string;
  description?: string;
  icon?: string; // e.g., Lucide icon name or path (from index.ts)
  image_url?: string; // (from index.ts and game.ts)
  parent_id?: string | number; // (from index.ts)
  order?: number; // (from index.ts)
  icon_svg?: string; // For SVG icons (from game.ts)
  game_ids?: string[]; // List of game IDs in this category (from game.ts)
}

// Game Launch Options
export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string;
  currency?: string;
  platform?: 'mobile' | 'desktop' | 'web'; // from game.ts
  language?: string;
  token?: string; // from game.ts
  returnUrl?: string;
}

// Consolidated Game Interface (based on src/types/index.ts, augmented by src/types/game.ts)
export interface Game {
  id: string | number;
  game_id?: string; // Specific external game ID
  title: string;
  slug: string;
  provider_id?: string | number;
  providerName?: string; // Often denormalized
  provider_slug: string; // Ensure this is present
  category?: string; // Legacy or simple category name
  categoryName?: string; // Often denormalized
  category_slugs?: string[]; // Array of category slugs
  rtp?: number;
  cover?: string;
  image?: string; // Alternative for cover
  banner?: string; // Optional banner image from index.ts
  bannerUrl?: string; // from game.ts
  description?: string;
  status?: GameStatus; // Use the consolidated GameStatus
  views?: number;
  is_featured?: boolean;
  isNew?: boolean; // To mark new games
  releaseDate?: string; // ISO date string
  tags?: string[] | GameTag[]; // Can be simple strings or tag objects
  volatility?: GameVolatility; // Use the consolidated GameVolatility
  lines?: number;
  min_bet?: number;
  max_bet?: number;
  only_real?: boolean;
  only_demo?: boolean;
  has_freespins?: boolean;
  created_at?: string;
  updated_at?: string;

  // Fields from game.ts's Game definition
  provider?: { id?: string; name: string; slug?: string };
  image_url?: string; // (already covered by image/cover)
  features?: string[];
  themes?: string[];
  isPopular?: boolean; // (is_featured might cover this)
  show_home?: boolean;
  launch_url?: string;
  demo_url?: string;
  game_code?: string; // Alternative game identifier if needed
  likes?: number;
  has_jackpot?: boolean;
  supported_currencies?: string[];
  supported_languages?: string[];
  technology?: 'html5' | 'flash' | 'other';

  [key: string]: any; // Allow for additional properties
}

// Database Game Structure (from src/types/game.ts)
export interface DbGame {
  id: string; // Primary key (UUID)
  game_id: string; // Provider's game ID
  game_name: string; // Title of the game
  slug?: string;
  provider_id?: string | null;
  provider_slug?: string | null;
  game_type?: string | null;
  category_slugs?: string[] | null;
  description?: string | null;
  cover?: string | null;
  banner_url?: string | null;
  banner?: string | null;
  image_url?: string | null;
  rtp?: number | string | null;
  volatility?: GameVolatility | string | null;
  lines?: number | null;
  min_bet?: number | null;
  max_bet?: number | null;
  features?: string[] | null;
  tags?: string[] | null;
  themes?: string[] | null;
  is_popular?: boolean | null;
  is_new?: boolean | null;
  is_featured?: boolean | null;
  show_home?: boolean | null;
  status?: GameStatus | string | null;
  release_date?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  game_code?: string | null;
  distribution?: string | null;
  technology?: string | null;
  game_server_url?: string | null;
  has_lobby?: boolean | null;
  is_mobile?: boolean | null;
  has_freespins?: boolean | null;
  has_tables?: boolean | null;
  only_demo?: boolean | null;
  only_real?: boolean | null;
  views?: number | null;
  providers?: { id?: string; name: string; slug: string } | null;
  title?: string;
}
