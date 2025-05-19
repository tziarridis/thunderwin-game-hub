// ... keep existing code (other type exports)
export * from './user';
export * from './game';
export * from './transaction';
export * from './wallet';
// export * from './bonus'; // If you have this file
// export * from './analytics'; // If you have this file
// export * from './support'; // If you have this file
export * from './affiliate'; // Added this line

// General API response type
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: any;
}

// You can also define shared enums or utility types here
export type LoadingStatus = 'idle' | 'loading' | 'succeeded' | 'failed';

// Example of a more specific Game type if needed for frontend display
// This can extend the base Game type from game.ts
export interface DisplayGame extends Game {
  isFavorite?: boolean; // Determined client-side
  // any other client-specific properties
}

// Adding DbGame type based on Games.tsx prepareGameForForm
export interface DbGame {
  id?: string;
  title?: string;
  slug?: string;
  provider_slug?: string;
  category_slugs?: string[];
  rtp?: number;
  status?: 'active' | 'inactive' | 'maintenance' | 'pending_review' | 'draft' | 'archived';
  description?: string;
  cover?: string; // Corresponds to Game.image
  banner?: string;
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  tags?: string[];
  features?: string[];
  themes?: string[];
  volatility?: 'low' | 'medium' | 'high' | 'low-medium' | 'medium-high';
  lines?: number; // Assuming number
  min_bet?: number;
  max_bet?: number;
  release_date?: string; // ISO date string
  game_id?: string; // External game ID from provider
  game_code?: string; // External game code from provider
  // Fields from 'games' table in Supabase schema
  provider_id?: string; // uuid, foreign key to providers table
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;
  views?: number;
  created_at?: string; // timestamp with time zone
  updated_at?: string; // timestamp with time zone
  game_type?: string; // Maps to Game.categoryName or Game.category
  technology?: string;
  distribution?: string;
  game_server_url?: string;
  // For joining with providers table
  providers?: { name: string };
  game_name?: string;
}

// Ensure User type in src/types/user.ts includes what's needed by Admin/Users.tsx etc.
// e.g. id, name, email, role, status, created_at

// WalletType to be used in AppHeader
export interface WalletType {
  balance: number | null;
  currency: string;
  // other wallet properties
}
