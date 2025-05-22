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
  provider_id?: string | null; 
  category_slugs?: string[] | null; 
  game_type?: string | null; 
  image_url?: string | null; 
  cover?: string | null; 
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

  game_providers?: { id: string; name: string; slug: string; logo_url?: string | null; is_active?: boolean | null; } | null; 
  game_categories?: { id: string; name: string; slug: string; }[] | { id: string; name: string; slug: string; } | null; // Can be array or single from joins

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
  provider?: { id: string; name: string; slug: string } | null; 

  category_slugs?: string[] | null;
  categoryNames?: string[] | null; 
  categoryName?: string | null; 
  category?: string | null; 

  image?: string | null; 
  image_url?: string | null;
  cover?: string | null;
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
  meta?: { key: string, value: string }[]; // Added for demo_url, real_url
  extra_properties?: Record<string, any>;
}

export interface GameProvider {
  id?: string | number; 
  slug: string;
  name: string;
  logo_url?: string | null;
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
  image_url?: string | null;
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

export interface GameContextType {
  // Properties from useGames hook
  games: Game[];
  categories: GameCategory[];
  providers: GameProvider[];
  favoriteGameIds: string[];
  isLoadingGames: boolean;
  isLoadingCategories: boolean;
  isLoadingProviders: boolean;
  hasMoreGames?: boolean;

  // Methods from useGames hook
  fetchGames: (filters?: any, page?: number, limit?: number) => Promise<{ games: Game[], totalCount: number }>;
  fetchGameBySlug: (slug: string) => Promise<Game | null>;
  fetchCategories: () => Promise<void>;
  fetchProviders: () => Promise<void>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  isFavorite: (gameId: string) => boolean;
  getGamesByCategory: (categorySlug: string) => Game[];
  getGamesByProvider: (providerSlug: string) => Game[];
  loadMoreGames?: () => void;
  searchGames: (searchTerm: string) => Promise<Game[]>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  getGameById?: (id: string) => Game | undefined; // Optional, if implemented

  // Placeholder for other methods that might be part of a more comprehensive context
  // These were in the original GameContextType but might not all be implemented in useGames.tsx
  // For now, keep them optional or remove if not used.
  filteredGames?: Game[]; // If filtering logic is moved to context
  isLoading?: boolean; // General loading state
  isLoadingMore?: boolean;
  hasMore?: boolean; // General hasMore state
  error?: Error | null;
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
  getGameLaunchUrl?: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  fetchGameDetails?: (gameIdOrSlug: string) => Promise<Game | null>;
  handleGameDetails?: (game: Game) => void;
  handlePlayGame?: (game: Game, mode: 'real' | 'demo') => void;
  
  // Admin specific methods - likely better in a separate admin context
  addGame?: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame?: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame?: (gameId: string) => Promise<void>;
  uploadGameImage?: (file: File) => Promise<string | null>;
}
