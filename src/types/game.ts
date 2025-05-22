export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending", 
  MAINTENANCE = "maintenance",
  DRAFT = "draft", 
  ARCHIVED = "archived", 
  BLOCKED = "blocked", 
}
export type GameStatus = `${GameStatusEnum}`;
export const AllGameStatuses = Object.values(GameStatusEnum);

export enum GameVolatilityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  LOW_MEDIUM = "low-medium", 
  MEDIUM_HIGH = "medium-high", 
}
export type GameVolatility = `${GameVolatilityEnum}`;
export const AllGameVolatilities = Object.values(GameVolatilityEnum);

export type GameTag = {
  id?: string; 
  name: string;
  slug: string; 
};

export interface DbGame {
  id: string; 
  game_id?: string | null; 
  game_name?: string | null; 
  title?: string | null; 
  slug?: string | null;
  provider_slug?: string | null; 
  provider_id?: string | null; // This would be the UUID foreign key to providers table
  category_slugs?: string[] | null; 
  game_type?: string | null; 
  image_url?: string | null; // This might be the raw image path
  cover?: string | null; // Often same as image_url or a specific crop
  banner_url?: string | null; 
  description?: string | null;
  rtp?: number | null;
  volatility?: GameVolatility | null;
  tags?: string[] | null; 
  features?: string[] | null; 
  themes?: string[] | null; 
  status: GameStatus; 
  created_at?: string | null;
  updated_at?: string | null;
  
  has_lobby?: boolean | null;
  is_mobile?: boolean | null; 
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
  distribution?: string | null; 
  game_server_url?: string | null;
  game_code?: string | null; 
  release_date?: string | null; 
  lines?: number | null; 
  min_bet?: number | null;
  max_bet?: number | null;

  // Joined data
  game_providers?: { id: string; name: string; slug: string; logo?: string | null; logo_url?: string | null; is_active?: boolean | null; } | null; 
  game_categories?: { id: string; name: string; slug: string; image?: string | null; }[] | { id: string; name: string; slug: string; image?: string | null; } | null;

  [key: string]: any;
}

export interface Game {
  id: string; 
  game_id?: string | null; 
  title: string;
  slug?: string | null;
  
  provider_slug?: string; 
  providerName?: string | null; 
  provider_id?: string | null; 
  provider?: { id: string; name: string; slug: string; logo?: string | null; } | null; 

  category_slugs?: string[] | null;
  categoryNames?: string[] | null; 
  categoryName?: string | null; 
  category?: string | null; 

  image?: string | null; // Main image, could be cover or thumbnail
  // image_url removed to avoid confusion, use image or cover
  cover?: string | null; // Typically a specific image for cards
  bannerUrl?: string | null; 
  banner?: string | null; 

  description?: string | null;
  rtp?: number | null;
  volatility?: GameVolatility | null;
  
  tags?: GameTag[] | string[] | null; 
  features?: string[] | null;
  themes?: string[] | null;

  status: GameStatus;
  releaseDate?: string | null; 

  is_popular?: boolean | null;
  is_new?: boolean | null; 
  is_featured?: boolean | null;
  show_home?: boolean | null; 

  mobile_friendly?: boolean | null; 
  desktop_friendly?: boolean | null; 
  tablet_friendly?: boolean | null; 

  lines?: number | null;
  min_bet?: number | null;
  max_bet?: number | null;

  only_demo?: boolean | null;
  only_real?: boolean | null;

  views?: number | null;
  popularity?: number | null; 
  
  game_code?: string | null; 

  isFavorite?: boolean; 
  has_jackpot?: boolean; 
  has_freespins?: boolean; 

  frontend_url?: string; 
  
  created_at?: string;
  updated_at?: string;
  meta?: { key: string, value: string }[]; 
  extra_properties?: Record<string, any>;
}

export interface GameProvider {
  id?: string | number; 
  slug: string;
  name: string;
  logo?: string | null; // Changed from logo_url to match common DB field name
  description?: string | null;
  is_active?: boolean | null;
  created_at?: string | null;
  updated_at?: string | null;
  gamesCount?: number;
  isPopular?: boolean; 
  game_ids?: string[]; 
}

export interface GameCategory {
  id?: string | number; 
  slug: string;
  name: string;
  description?: string | null;
  image?: string | null; // Changed from image_url
  icon?: string | null; 
  status?: string | null; 
  created_at?: string | null;
  updated_at?: string | null;
  gamesCount?: number;
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  language?: string;
  [key: string]: any; 
}

// Simplified GameContextType
export interface GameContextType {
  games: Game[];
  categories: GameCategory[];
  providers: GameProvider[];
  favoriteGameIds: string[];
  isLoadingGames: boolean;
  isLoadingCategories: boolean;
  isLoadingProviders: boolean;
  isAuthenticated: boolean; // Added
  hasMoreGames?: boolean;

  fetchGames: (filters?: any, page?: number, limit?: number) => Promise<{ games: Game[], totalCount: number }>;
  fetchGameBySlug: (slug: string) => Promise<Game | null>;
  fetchCategories: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>; // Added
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  isFavorite: (gameId: string) => boolean;
  getGamesByCategory: (categorySlug: string) => Game[];
  getGamesByProvider: (providerSlug: string) => Game[];
  loadMoreGames?: () => void;
  searchGames: (searchTerm: string) => Promise<Game[]>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getGameById?: (id: string) => Game | undefined;
  
  handleGameDetails?: (game: Game) => void; // Added
  handlePlayGame?: (game: Game, mode: 'real' | 'demo') => void; // Added
  
  // Optional admin methods, consider moving to a separate AdminGamesContext if they grow
  addGame?: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame?: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame?: (gameId: string) => Promise<void>;
  uploadGameImage?: (file: File) => Promise<string | null>;

  // Fields for active filtering state, if managed by context
  activeFilters?: {
    searchTerm: string;
    provider: string;
    category: string;
    sortBy: string;
  };
  setSearchTerm?: (searchTerm: string) => void;
  setProviderFilter?: (providerSlug: string) => void;
  setCategoryFilter?: (categorySlug: string) => void;
  setSortBy?: (sortBy: string) => void;
}
