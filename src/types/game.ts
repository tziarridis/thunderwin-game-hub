export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  MAINTENANCE = "maintenance",
  COMING_SOON = "coming_soon"
}

export interface DbGame {
  id: string;
  game_name: string;
  game_code: string;
  provider_id: string;
  provider_slug?: string;
  category_slugs?: string[];
  status: string;
  rtp: number;
  cover?: string;
  images?: string[];
  description?: string;
  created_at?: string;
  updated_at?: string;
  is_featured?: boolean;
  is_popular?: boolean;
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
}

export interface Game {
  id: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  provider_id: string;
  provider_slug?: string;
  category_id: string;
  category_slugs?: string[];
  status: GameStatusEnum;
  rtp: number;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  is_popular?: boolean;
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
  status?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  status?: string;
}
