
export interface Game {
  id: string;
  title: string;
  name?: string;
  description?: string;
  provider?: string;
  category?: string;
  image?: string;
  thumbnail?: string;
  slug?: string;
  rtp?: number;
  volatility?: string;
  max_win?: number;
  min_bet?: number;
  max_bet?: number;
  is_featured?: boolean;
  is_new?: boolean;
  is_popular?: boolean;
  only_real?: boolean;
  only_demo?: boolean;
  tags?: (string | GameTag)[];
  game_url?: string;
  demo_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  
  // Additional properties used by components
  game_id?: string;
  provider_slug?: string;
  provider_id?: string;
  providerName?: string;
  categoryName?: string;
  category_slugs?: string[];
  category_name?: string;
  image_url?: string;
  cover?: string;
  bannerUrl?: string;
  isPopular?: boolean;
  isNew?: boolean;
  show_home?: boolean;
  lines?: number;
  themes?: string[];
  releaseDate?: string;
  game_code?: string;
  category_id?: string;
}

export interface GameTag {
  id: string;
  name: string;
  color?: string;
}

export interface GameProvider {
  id: string;
  name: string;
  logo?: string;
  description?: string;
  status?: string;
  created_at?: string;
  slug?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  description?: string;
  status?: string;
  created_at?: string;
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  user_id?: string;
  username?: string;
  currency?: string;
  language?: string;
  platform?: string;
  returnUrl?: string;
}

// Database Game interface for admin operations
export interface DbGame {
  id?: string;
  game_id?: string;
  game_name?: string;
  game_code?: string;
  provider_id?: string;
  provider_slug?: string;
  distribution?: string;
  game_type?: string;
  category_slugs?: string[];
  cover?: string;
  image_url?: string;
  banner_url?: string;
  description?: string;
  rtp?: number;
  volatility?: GameVolatility;
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  lines?: number;
  min_bet?: number;
  max_bet?: number;
  features?: string[];
  tags?: string[];
  themes?: string[];
  release_date?: string;
  status?: string;
  only_demo?: boolean;
  only_real?: boolean;
  created_at?: string;
  updated_at?: string;
  views?: number;
  is_mobile?: boolean;
  mobile_supported?: boolean;
  has_lobby?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  demo_url?: string;
  external_url?: string;
}

export enum GameStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  COMING_SOON = 'coming_soon'
}

export enum GameStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  COMING_SOON = 'coming_soon'
}

export type GameVolatility = 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high';
