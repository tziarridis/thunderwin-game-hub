
export interface Game {
  id: string;
  slug?: string;
  game_name?: string;
  name?: string;
  title?: string;
  provider_id?: string;
  provider_name?: string;
  category_id?: string;
  category_name?: string;
  category_slugs?: string[];
  categoryName?: string;
  game_type?: string;
  type?: string;
  technology?: string;
  cover?: string;
  thumbnail?: string;
  rtp?: number;
  is_mobile?: boolean;
  is_featured?: boolean;
  isPopular?: boolean;
  isNew?: boolean;
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
