export enum GameStatusEnum {
  ACTIVE = "active",
  INACTIVE = "inactive",
  PENDING = "pending",
  MAINTENANCE = "maintenance",
}

export enum GameVolatilityEnum {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
}

export interface Game {
  id: string;
  game_id?: string;
  slug?: string;
  title: string;
  game_name?: string;
  provider_slug: string;
  providerName?: string;
  category_slugs?: string[];
  categoryNames?: string[];
  image?: string;
  image_url?: string;
  cover?: string;
  frontend_url?: string;
  is_new?: boolean;
  is_featured?: boolean;
  rtp?: number;
  volatility?: GameVolatilityEnum | null;
  tags?: string[];
  status?: GameStatusEnum;
  description?: string;
  tech_description?: string;
  mobile_friendly?: boolean;
  desktop_friendly?: boolean;
  tablet_friendly?: boolean;
  created_at?: string;
  updated_at?: string;
  views?: number;
  popularity?: number;
  extra_properties?: Record<string, any>;
  // Flags from API
  only_demo?: boolean;
  only_real?: boolean;
}

export interface DbGame
  extends Omit<Game, 'id' | 'providerName' | 'categoryNames' | 'tags'> {
  id: string;
  provider_slug: string;
  category_slugs?: string[];
  tags?: string[];
  status: GameStatusEnum;
  image?: string;
  image_url?: string;
  cover?: string;
  frontend_url?: string;
}

export interface GameProvider {
  id?:number;
  slug: string;
  name: string;
  logo_url?: string;
  description?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameCategory {
  id?:number;
  slug: string;
  name: string;
  description?: string;
  image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
}

export type GameTag = string; // Simple definition for GameTag

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  // platform?: 'desktop' | 'mobile'; // Optional: if platform distinction is needed
  language?: string; // Optional: if game supports language setting
  // [key: string]: any; // For any other provider-specific options
}

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
  setProviderFilter: (provider: string) => void;
  setCategoryFilter: (category: string) => void;
  setSortBy: (sortBy: string) => void;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  isFavorite: (gameId: string) => boolean;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameLaunchUrl: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getFeaturedGames: (count?: number) => Promise<Game[]>;
  fetchGameDetails?: (gameIdOrSlug: string) => Promise<Game | null>; // Optional
  handleGameDetails: (game: Game) => void; // For navigation or opening modal
  handlePlayGame: (game: Game, mode: 'real' | 'demo') => void; // For initiating play
  loadMoreGames?: () => void; // For pagination
  // Admin specific
  addGame?: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame?: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame?: (gameId: string) => Promise<void>;
  uploadGameImage?: (file: File) => Promise<string | null>; // URL of uploaded image
}
