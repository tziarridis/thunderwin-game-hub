
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
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
  games_count?: number;
  status?: 'active' | 'inactive' | 'coming_soon';
  games?: Game[];
}

// Game Category
export interface GameCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image_url?: string;
  parent_id?: string | number;
  order?: number;
  icon_svg?: string;
  game_ids?: string[];
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
export interface DbGame {
  id: string;
  game_id: string;
  game_name: string;
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
  
  [key: string]: any; // For flexibility with database fields
}
