
export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  COMING_SOON = "coming_soon"
}

export type GameStatus = "active" | "inactive" | "maintenance" | "pending_review" | "draft" | "archived" | "pending" | "blocked";

export type GameVolatility = "low" | "medium" | "high" | "low-medium" | "medium-high";

export enum GameVolatilityEnum {
  LOW = "low",
  MEDIUM = "medium", 
  HIGH = "high",
  LOW_MEDIUM = "low-medium",
  MEDIUM_HIGH = "medium-high"
}

export type GameTag = string;

export interface DbGame {
  id: string;
  game_name: string;
  game_code: string;
  game_id?: string;
  slug?: string;
  provider_id: string;
  provider_slug?: string;
  category_slugs?: string[];
  status: string;
  rtp: number;
  cover?: string;
  image_url?: string;
  banner_url?: string;
  images?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_featured?: boolean;
  is_popular?: boolean;
  is_new?: boolean;
  show_home?: boolean;
  mobile_supported?: boolean;
  desktop_supported?: boolean;
  tablet_supported?: boolean;
  demo_available?: boolean;
  only_real?: boolean;
  only_demo?: boolean;
  extra_elements?: string[];
  tags?: string[];
  game_options?: string[];
  blocked_countries?: string[];
  license_info?: string;
  launch_count?: number;
  fun_play_supported?: boolean;
  real_play_supported?: boolean;
  bonus_spins_supported?: boolean;
  min_bet?: number;
  max_bet?: number;
  max_win?: number;
  volatility?: string;
  themes?: string[];
  paylines?: number;
  reels?: number;
  symbols?: string[];
  features?: string[];
  lines?: number;
  release_date?: string;
  distribution?: string;
  game_type?: string;
  title?: string;
}

export interface Game {
  id: string;
  game_id?: string;
  title: string;
  slug?: string;
  description: string;
  image_url?: string;
  image?: string;
  cover?: string;
  bannerUrl?: string;
  provider_id: string;
  provider_slug?: string;
  provider?: { name: string; slug: string; id?: string };
  providerName?: string;
  category_id?: string;
  categoryName?: string;
  category?: string;
  category_slugs?: string[];
  status: GameStatusEnum;
  rtp: number;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  is_popular?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  is_new?: boolean;
  show_home?: boolean;
  mobile_supported?: boolean;
  desktop_supported?: boolean;
  tablet_supported?: boolean;
  demo_available?: boolean;
  only_real?: boolean;
  only_demo?: boolean;
  extra_elements?: string[];
  tags?: GameTag[];
  game_options?: string[];
  blocked_countries?: string[];
  license_info?: string;
  launch_count?: number;
  fun_play_supported?: boolean;
  real_play_supported?: boolean;
  bonus_spins_supported?: boolean;
  min_bet?: number;
  max_bet?: number;
  max_win?: number;
  volatility?: GameVolatility;
  themes?: string[];
  paylines?: number;
  reels?: number;
  symbols?: string[];
  features?: string[];
  lines?: number;
  releaseDate?: string;
  game_code?: string;
  demo_url?: string;
  external_url?: string;
  is_mobile_compatible?: boolean;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  views?: number;
  default_bet?: number;
  currencies_accepted?: string;
  languages_supported?: string;
  technology?: string;
  launch_url_template?: string;
  api_integration_type?: string;
  aggregator_game_id?: string;
  aggregator_provider_id?: string;
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

export interface GameProvider {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  logoUrl?: string;
  status?: string;
  description?: string;
  isActive?: boolean;
  game_ids?: string[];
}

export interface GameCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  status?: string;
}
