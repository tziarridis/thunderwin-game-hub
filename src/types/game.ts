
export interface Game {
  id: string;
  slug?: string;
  game_name?: string;
  name?: string;
  title?: string;
  provider_id?: string;
  provider_name?: string;
  provider_slug?: string; // Added
  providerName?: string; // Added (deprecated but still used in some places)
  category_id?: string;
  category_name?: string;
  category_slugs?: string[];
  categoryName?: string;
  game_type?: string;
  type?: string;
  technology?: string;
  cover?: string;
  thumbnail?: string;
  image?: string; // Added
  image_url?: string; // Added
  bannerUrl?: string; // Added
  rtp?: number;
  is_mobile?: boolean;
  is_featured?: boolean;
  is_new?: boolean; // Added
  isPopular?: boolean;
  isNew?: boolean;
  only_demo?: boolean; // Added
  only_real?: boolean; // Added
  volatility?: string; // Added
  tags?: (string | GameTag)[];
  description?: string;
  min_bet?: number;
  max_bet?: number;
  created_at?: string;
  updated_at?: string;
  releaseDate?: string;
  status?: string;
}

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
  created_at?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug?: string;
  icon?: string;
  created_at?: string;
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
