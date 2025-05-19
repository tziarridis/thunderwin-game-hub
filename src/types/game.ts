// This will be our primary frontend Game type
export interface GameProvider {
  id: number | string;
  name: string;
  slug?: string; // Added slug for providers
  logo?: string;
  description?: string;
  status?: string; // Added status
}

export interface Game {
  id: string; // Should be string (UUID from DB)
  title: string; // Was game_name in DbGame
  slug: string;
  
  providerName?: string; // From DbGame.providers.name or DbGame.provider_slug
  provider_slug?: string; // Direct from DbGame.provider_slug
  
  categoryName?: string; // From DbGame.game_type
  category_slugs?: string[]; // From DbGame.category_slugs

  image?: string; // Mapped from DbGame.cover
  banner?: string; // From DbGame.banner
  
  description?: string;
  rtp?: number;
  
  isPopular?: boolean; // Mapped from DbGame.is_popular or DbGame.show_home
  isNew?: boolean; // Mapped from DbGame.is_new or derived from DbGame.created_at
  is_featured?: boolean; // Direct from DbGame.is_featured
  show_home?: boolean; // Direct from DbGame.show_home
  
  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high';
  lines?: number;
  minBet?: number; // Mapped from DbGame.min_bet
  maxBet?: number; // Mapped from DbGame.max_bet
  
  features?: string[];
  tags?: string[];
  themes?: string[];
  
  releaseDate?: string; // Mapped from DbGame.release_date (ISO string)
  
  game_id?: string; // External game ID from provider, from DbGame.game_id
  game_code?: string; // External game code from provider, from DbGame.game_code
  
  status?: 'active' | 'inactive' | 'maintenance' | 'pending_review' | 'draft' | 'archived'; // From DbGame.status
  
  // Compatibility fields (try to consolidate to above)
  provider?: string; // Fallback if providerName/provider_slug not available
  category?: string; // Fallback if categoryName/category_slugs not available
  cover?: string; // Alias for image, from DbGame.cover
  image_url?: string; // Another alias for image
  
  // Client-side state, not from DB directly mapped here
  isFavorite?: boolean;

  // Fields that might come from DB but less common on frontend game card
  technology?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;
  distribution?: string;
  views?: number;
  created_at?: string;
  updated_at?: string;
  provider_id?: string; // Foreign key, less common for direct display
  game_server_url?: string;
}
