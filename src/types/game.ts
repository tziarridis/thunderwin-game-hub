
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
