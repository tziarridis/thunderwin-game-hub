
export interface GameProvider {
  id: number | string;
  name: string;
  logo?: string;
  description?: string;
  status: string;
}

export interface Game {
  id?: number | string;
  provider_id: number;
  game_server_url?: string;
  game_id: string;
  game_name: string;
  game_code: string;
  game_type?: string;
  description?: string;
  cover?: string;
  status: string;
  technology?: string;
  has_lobby: boolean;
  is_mobile: boolean;
  has_freespins: boolean;
  has_tables: boolean;
  only_demo?: boolean;
  rtp: number;
  distribution: string;
  views: number;
  is_featured?: boolean;
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
  
  // Optional relation property
  provider?: GameProvider;
  
  // Properties for compatibility with the UI Game interface
  title?: string;
  name?: string;
  isPopular?: boolean;
  isNew?: boolean;
  jackpot?: boolean;
  volatility?: string;
  minBet?: number;
  maxBet?: number;
  isFavorite?: boolean;
  image?: string;
  category?: string;
  features?: string[];
  tags?: string[];
  releaseDate?: string;
}

export interface GameListParams {
  page?: number;
  limit?: number;
  search?: string;
  provider_id?: number;
  game_type?: string;
  status?: string;
  is_featured?: boolean;
  show_home?: boolean;
}

export interface GameResponse {
  data: Game[];
  total: number;
  page: number;
  limit: number;
}
