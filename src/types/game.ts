
export interface Game {
  id: string;
  slug?: string;
  game_name?: string;
  name?: string;
  title?: string;
  provider_id?: string;
  provider_name?: string;
  provider_slug?: string;
  providerName?: string;
  category_id?: string;
  category_name?: string;
  category_slugs?: string[];
  categoryName?: string;
  category?: string;
  game_type?: string;
  type?: string;
  technology?: string;
  cover?: string;
  thumbnail?: string;
  image?: string;
  image_url?: string;
  bannerUrl?: string;
  rtp?: number;
  is_mobile?: boolean;
  is_featured?: boolean;
  is_new?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
  only_demo?: boolean;
  only_real?: boolean;
  volatility?: string;
  tags?: (string | GameTag)[];
  description?: string;
  min_bet?: number;
  max_bet?: number;
  created_at?: string;
  updated_at?: string;
  releaseDate?: string;
  status?: string;
  game_id?: string;
  game_code?: string;
  show_home?: boolean;
  lines?: number;
  themes?: string[];
  provider?: GameProvider;
  logoUrl?: string;
  has_lobby?: boolean;
  is_mobile_compatible?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  views?: number;
  demo_url?: string;
  external_url?: string;
  features?: string[];
}

export interface DbGame {
  id: string;
  game_id?: string;
  game_name: string;
  title?: string;
  game_code: string;
  provider_id?: string;
  provider_slug?: string;
  game_type?: string;
  description?: string;
  cover?: string;
  image_url?: string;
  banner_url?: string;
  status: string;
  technology?: string;
  distribution?: string;
  game_server_url?: string;
  rtp?: number;
  volatility?: GameVolatility;
  is_featured?: boolean;
  is_popular?: boolean;
  show_home?: boolean;
  is_new?: boolean;
  only_demo?: boolean;
  only_real?: boolean;
  lines?: number;
  min_bet?: number;
  max_bet?: number;
  features?: string[];
  tags?: string[];
  themes?: string[];
  category_slugs?: string[];
  release_date?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  mobile_supported?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  views?: number;
  demo_url?: string;
  external_url?: string;
  created_at: string;
  updated_at: string;
}

export enum GameStatusEnum {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  MAINTENANCE = 'maintenance',
  COMING_SOON = 'coming_soon'
}

export type GameStatus = GameStatusEnum;
export type GameVolatility = 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high';

export interface GameTag {
  id: string;
  name: string;
  slug: string;
}

export interface GameProvider {
  id: string;
  name: string;
  slug?: string;
  logo?: string;
  logoUrl?: string;
  created_at?: string;
  status?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  created_at?: string;
  status?: string;
}

export interface GameLaunchOptions {
  mode?: 'demo' | 'real';
  user_id?: string;
  username?: string;
  currency?: string;
  language?: string;
  platform?: string;
  returnUrl?: string;
}
