export * from './user';
export * from './game'; // Game type is now primarily defined in game.ts
export * from './transaction';
export * from './wallet';
export * from './affiliate';

// General API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// LoadingStatus
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';


// DisplayGame can extend the Game from game.ts if needed
export interface DisplayGame extends Game { // Game is now imported from './game'
  isFavorite?: boolean; 
}

// DbGame type for Supabase interactions
export interface DbGame {
  id: string; // UUID, ensure it's string in Supabase table or cast upon fetch
  game_name: string; // Maps to Game.title
  slug: string;
  
  provider_id?: string; // Foreign key to providers table (UUID)
  provider_slug?: string; // Denormalized or from a view, maps to Game.provider_slug

  game_type?: string; // Maps to Game.categoryName
  category_slugs?: string[]; // Should be string array in DB or parsed

  cover?: string; // Maps to Game.image
  banner?: string; // Maps to Game.banner

  description?: string;
  rtp?: number; // Should be numeric in DB

  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  show_home?: boolean;

  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high'; // Enum in DB
  lines?: number; // Numeric in DB
  min_bet?: number; // Numeric in DB
  max_bet?: number; // Numeric in DB
  
  features?: string[]; // JSONB array in DB
  tags?: string[]; // JSONB array in DB
  themes?: string[]; // JSONB array in DB
  
  release_date?: string; // Date or Timestamp in DB, maps to ISO string

  game_id?: string; // External game ID (string)
  game_code?: string; // External game code (string)

  status?: 'active' | 'inactive' | 'maintenance' | 'pending_review' | 'draft' | 'archived'; // Enum in DB
  
  technology?: string;
  distribution?: string;
  game_server_url?: string;
  
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;
  
  views?: number;
  created_at?: string; // timestamptz
  updated_at?: string; // timestamptz
  
  // For joining with providers table
  providers?: { name: string; slug?: string }; // Include slug if available from join

  // Keep 'title' if forms are directly using it for DbGame, but game_name is canonical
  title?: string; // Alias for game_name for form compatibility
  image_url?: string; // Alias for cover
}

// WalletType to be used in AppHeader
export interface WalletType {
  balance: number | null;
  currency: string;
  // other wallet properties
}
