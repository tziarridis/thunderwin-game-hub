
// Assuming GameStatus, GameVolatility are defined elsewhere or are simple strings
export type GameStatus = "active" | "inactive" | "pending" | "blocked";
export type GameVolatility = "low" | "medium" | "high" | "low-medium" | "medium-high";

export interface GameTag {
  id: string;
  name: string;
  slug: string;
}

export interface Game {
  id: string | number; // Can be string or number from different sources
  game_id?: string; // Specific external game ID
  title: string;
  slug: string;
  provider_id?: string | number;
  providerName?: string; // Often denormalized
  provider_slug: string; // Ensure this is present
  category?: string; // Legacy or simple category name
  categoryName?: string; // Often denormalized
  category_slugs?: string[]; // Array of category slugs
  rtp?: number;
  cover?: string;
  image?: string; // Alternative for cover
  banner?: string; // Optional banner image
  description?: string;
  status?: GameStatus;
  views?: number;
  is_featured?: boolean;
  isNew?: boolean; // To mark new games
  releaseDate?: string; // ISO date string
  tags?: string[] | GameTag[]; // Can be simple strings or tag objects
  volatility?: GameVolatility;
  lines?: number;
  min_bet?: number; // Use snake_case for consistency with potential DB fields
  max_bet?: number; // Use snake_case
  only_real?: boolean;
  only_demo?: boolean;
  has_freespins?: boolean;
  created_at?: string;
  updated_at?: string;
  // Any other fields that might come from different game sources
  [key: string]: any; // Allow for additional properties from various providers
}

export interface GameProvider {
  id: string | number;
  name: string;
  slug: string; // Made required for consistency in some components
  logoUrl?: string;
  description?: string;
  isActive?: boolean;
  games_count?: number;
}

export interface GameCategory {
  id: string | number;
  name: string;
  slug: string;
  description?: string;
  icon?: string; // e.g., Lucide icon name or path
  image_url?: string;
  parent_id?: string | number;
  order?: number;
}

// ... any other shared types
