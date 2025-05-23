// Game Enums (can be extended)
export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  BLOCKED = "blocked",
  MAINTENANCE = "maintenance",
  PENDING_REVIEW = "pending_review",
  DRAFT = "draft",
  ARCHIVED = "archived",
}
export type GameStatus = `${GameStatusEnum}`;
export const AllGameStatuses = Object.values(GameStatusEnum);

export enum GameVolatilityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  LOW_MEDIUM = "low-medium",
  MEDIUM_HIGH = "medium-high",
}
export type GameVolatility = `${GameVolatilityEnum}`;
export const AllGameVolatilities = Object.values(GameVolatilityEnum);

// Game Tag
export interface GameTag {
  id: string;
  name: string;
  slug: string;
}

// Game Provider
export interface GameProvider {
  id: string | number;
  name: string;
  slug: string;
  logoUrl?: string; // Changed from logo_url to match common usage
  description?: string;
  isActive?: boolean; // Added from original type, ensure it's desired
  games_count?: number;
  status?: 'active' | 'inactive' | 'coming_soon'; // from original
  games?: Game[]; // from original
}

// Game Category
export interface GameCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // from original
  image_url?: string; // from original
  parent_id?: string | number; // from original
  order?: number; // from original
  icon_svg?: string; // from original
  game_ids?: string[]; // from original
  game_count?: number; // Added to match usage in GamesManagement mock
}

// Game Launch Options
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

// Consolidated Game Interface
export interface Game {
  id: string | number;
  game_id?: string;
  title: string;
  slug: string;
  provider_id?: string | number;
  providerName?: string;
  provider_slug: string;
  provider?: { id?: string; name: string; slug?: string };
  category?: string;
  categoryName?: string;
  category_slugs?: string[];
  rtp?: number;
  cover?: string;
  image?: string;
  image_url?: string;
  banner?: string;
  bannerUrl?: string;
  description?: string;
  status?: GameStatus;
  views?: number;
  is_featured?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  releaseDate?: string;
  created_at?: string;
  updated_at?: string;
  tags?: string[] | GameTag[];
  volatility?: GameVolatility;
  lines?: number;
  min_bet?: number;
  max_bet?: number;
  only_real?: boolean;
  only_demo?: boolean;
  has_freespins?: boolean;
  features?: string[];
  themes?: string[];
  show_home?: boolean;
  launch_url?: string;
  demo_url?: string;
  game_code?: string;
  likes?: number;
  has_jackpot?: boolean;
  supported_currencies?: string[];
  supported_languages?: string[];
  technology?: 'html5' | 'flash' | 'other';

  [key: string]: any;
}

// Database Game Structure
// This is DbGame that was causing import issues, ensure it's defined or aliased correctly.
// If this is intended to be different from GameDBModel in database.ts, define it fully.
// Assuming DbGame from game.ts is the one intended in GamesManagement.tsx.
export interface DbGame {
  id: string; // Changed from bigint to string for consistency if supabase returns string UUIDs primarily
  game_id: string; // External game identifier
  title?: string; // game_name often used as title
  game_name: string; 
  slug?: string;
  
  provider_id?: string | number | null; // Can be UUID string or number depending on DB schema for providers table
  provider_slug?: string | null; // Denormalized for easier querying/display
  // provider?: { id?: string; name: string; slug?: string } | null; // Relation, if joined

  game_type?: string | null; // e.g., 'slot', 'table_game', 'live_casino'
  category_slugs?: string[] | null; // Array of slugs if game belongs to multiple categories
  // category_id?: string | number | null; // If single category relation

  description?: string | null;
  cover?: string | null; // URL to cover image
  banner_url?: string | null; // URL to banner image
  banner?: string | null; // Alternative if banner_url is not used
  image_url?: string | null; // General image URL

  rtp?: number | string | null; // Can be number or string like "96.5%"
  volatility?: GameVolatility | string | null;
  lines?: number | null; // Paylines for slots

  min_bet?: number | null;
  max_bet?: number | null;

  features?: string[] | null; // e.g., ['freespins', 'jackpot', 'bonus_buy']
  tags?: string[] | null; // e.g., ['popular', 'new', 'exclusive']
  themes?: string[] | null; // e.g., ['egypt', 'adventure', 'fruits']

  is_popular?: boolean | null;
  is_new?: boolean | null;
  is_featured?: boolean | null;
  show_home?: boolean | null; // If game should be shown on homepage

  status?: GameStatus | string | null; // 'active', 'inactive', 'maintenance', etc.
  release_date?: string | null; // ISO date string

  created_at?: string | null; // ISO date string
  updated_at?: string | null; // ISO date string

  game_code?: string | null; // Specific code from provider
  distribution?: string | null; // e.g. 'mobile', 'desktop', 'all'
  technology?: string | null; // e.g. 'HTML5', 'Flash'
  game_server_url?: string | null; // URL for game server if applicable

  has_lobby?: boolean | null;
  is_mobile?: boolean | null;
  has_freespins?: boolean | null;
  has_tables?: boolean | null; // For table games specifically
  only_demo?: boolean | null; // If game is only available in demo mode
  only_real?: boolean | null; // If game is only available in real money mode

  views?: number | null; // View count

  // For flexibility with database fields that might not be strictly typed above
  [key: string]: any; 
}
