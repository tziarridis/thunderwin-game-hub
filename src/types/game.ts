export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending", // Was PENDING_REVIEW, but PENDING is used in GameForm
  MAINTENANCE = "maintenance",
  DRAFT = "draft", // Added based on GameForm default
  ARCHIVED = "archived", // Added for completeness
  BLOCKED = "blocked", // Added for completeness
}
export type GameStatus = `${GameStatusEnum}`;
export const AllGameStatuses = Object.values(GameStatusEnum);

export enum GameVolatilityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  LOW_MEDIUM = "low-medium", // Added for completeness
  MEDIUM_HIGH = "medium-high", // Added for completeness
}
export type GameVolatility = `${GameVolatilityEnum}`;
export const AllGameVolatilities = Object.values(GameVolatilityEnum);

export type GameTag = {
  id?: string; // Optional: if tags are stored with IDs
  name: string;
  slug: string; // Ensure slug is present if used for keys/filtering
};

// Represents the structure of the 'games' table in Supabase
export interface DbGame {
  id: string; // UUID
  game_id?: string | null; // External provider game ID
  game_name?: string | null; // often used as title
  title?: string | null; // explicit title field
  slug?: string | null;
  provider_slug?: string | null; // From 'distribution' column or linked provider. Made optional.
  provider_id?: string | null; // FK to a providers table if you have one
  category_slugs?: string[] | null; // Array of category slugs
  game_type?: string | null; // Single primary category, if applicable
  image_url?: string | null; // Main image
  cover?: string | null; // Often same as image_url or a specific cover image
  banner_url?: string | null; // Specific banner image
  description?: string | null;
  rtp?: number | null;
  volatility?: GameVolatility | null;
  tags?: string[] | null; // simple string tags
  features?: string[] | null; // game features like "bonus-buy", "megaways"
  themes?: string[] | null; // game themes like "egyptian", "adventure"
  status: GameStatus; // Current status of the game
  created_at?: string | null;
  updated_at?: string | null;
  
  // Fields from your Supabase 'games' table schema
  has_lobby?: boolean | null;
  is_mobile?: boolean | null; // Matches 'is_mobile' in games table
  has_freespins?: boolean | null;
  has_tables?: boolean | null;
  only_demo?: boolean | null;
  only_real?: boolean | null; 
  views?: number | null;
  is_featured?: boolean | null;
  is_popular?: boolean | null; 
  is_new?: boolean | null; 
  show_home?: boolean | null;
  technology?: string | null;
  distribution?: string | null; // This is often the provider slug
  game_server_url?: string | null;
  game_code?: string | null; // Alternative internal game code
  release_date?: string | null; // Release date of the game
  lines?: number | null; 
  min_bet?: number | null;
  max_bet?: number | null;

  // For joined data, e.g. from 'game_providers' or 'game_categories'
  // provider_name?: string | null; 
  // category_names?: string[] | null;
  providers?: { id: string; name: string; slug: string } | null; // For joined provider data

  // Allow any other properties that might come from the DB or API
  [key: string]: any;
}

// Represents the Game object used in the UI, often an adaptation of DbGame
export interface Game {
  id: string; // Unique ID (usually same as DbGame.id)
  game_id?: string | null; // External game ID from provider
  title: string;
  slug?: string | null;
  
  provider_slug: string;
  providerName?: string | null; // Display name of the provider
  provider_id?: string | null; // FK to a providers table
  provider?: { id: string; name: string; slug: string } | null; // Keep for consistency if used

  category_slugs?: string[] | null;
  categoryNames?: string[] | null; // Display names of categories
  categoryName?: string | null; // Primary category display name (used in gameAdapter)
  category?: string | null; // from original type in gameTypeAdapter

  image?: string | null; // Main visual (could be image_url or cover)
  image_url?: string | null;
  cover?: string | null;
  bannerUrl?: string | null; // For banners/promotions
  banner?: string | null; // from original type in gameTypeAdapter

  description?: string | null;
  rtp?: number | null;
  volatility?: GameVolatility | null;
  
  tags?: GameTag[] | string[] | null; // Can be objects or simple strings
  features?: string[] | null;
  themes?: string[] | null;

  status: GameStatus;
  releaseDate?: string | null; // Formatted release date for display

  is_popular?: boolean | null;
  is_new?: boolean | null; // Changed from isNew
  is_featured?: boolean | null;
  show_home?: boolean | null; // Whether to show on homepage

  mobile_friendly?: boolean | null; // Derived from DbGame.is_mobile or other data
  desktop_friendly?: boolean | null; // Assumed true usually
  tablet_friendly?: boolean | null; // Assumed true usually

  lines?: number | null;
  min_bet?: number | null;
  max_bet?: number | null;

  only_demo?: boolean | null;
  only_real?: boolean | null;

  views?: number | null;
  popularity?: number | null; // Calculated or from DB
  
  game_code?: string | null; // Internal game code

  // UI specific states, not directly from DB
  isFavorite?: boolean; 
  has_jackpot?: boolean; // UI flag, might not be in DbGame
  has_freespins?: boolean; // UI flag, might be from DbGame.has_freespins

  frontend_url?: string; // URL to play/view game on frontend
  
  created_at?: string;
  updated_at?: string;
  extra_properties?: Record<string, any>;
}

export interface GameProvider {
  id?: string | number; // Can be string (slug) or number (db id)
  slug: string;
  name: string;
  logo_url?: string | null;
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  // UI specific fields
  gamesCount?: number;
  isPopular?: boolean; // Keep this if used, or align with is_popular
  game_ids?: string[]; // from original type
}

export interface GameCategory {
  id?: string | number; // Can be string (slug) or number (db id)
  slug: string;
  name: string;
  description?: string | null;
  image_url?: string | null;
  icon?: string | null; // Added icon property
  status?: string | null; // e.g., 'active', 'inactive'
  created_at?: string | null;
  updated_at?: string | null;
  // UI specific fields
  gamesCount?: number;
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  language?: string;
  [key: string]: any; 
}

// GameContextType (as defined previously, ensure it's complete)
export interface GameContextType {
  games: Game[];
  filteredGames: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  error: Error | null;
  activeFilters: {
    searchTerm: string;
    provider: string;
    category: string;
    sortBy: string;
  };
  favoriteGameIds: Set<string>;
  getGameById: (id: string) => Game | undefined;
  fetchGames: (page?: number) => Promise<void>;
  setSearchTerm: (searchTerm: string) => void;
  setProviderFilter: (providerSlug: string) => void;
  setCategoryFilter: (categorySlug: string) => void;
  setSortBy: (sortBy: string) => void;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  isFavorite: (gameId: string) => boolean;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  fetchGameDetails?: (gameIdOrSlug: string) => Promise<Game | null>;
  handleGameDetails: (game: Game) => void;
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void;
  loadMoreGames?: () => void;
  // Admin specific
  addGame?: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame?: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame?: (gameId: string) => Promise<void>;
  uploadGameImage?: (file: File) => Promise<string | null>;
}
