// User, AuthUser, Profile, etc.
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  role: 'user' | 'admin' | 'moderator';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  balance?: number;
  currency?: string;
  vipLevel?: number;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  twoFactorEnabled?: boolean;
  emailVerified?: boolean;
  preferences?: UserPreferences;
  referralCode?: string;
  referredBy?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  role: 'user' | 'admin' | 'moderator';
  displayName?: string;
  avatar?: string;
  balance?: number;
  currency?: string;
  vipLevel?: number;
}

export interface Profile {
  userId: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  avatar?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  emailNotifications?: boolean;
  smsNotifications?: boolean;
  marketingEmails?: boolean;
  language?: string;
}

export interface GameProvider {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean;
  order: number;
  games_count?: number;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
  isActive?: boolean; // Make isActive consistent
  status: "active" | "inactive"; // Ensure this matches DB service usage
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: string;
  title: string;
  provider: string; // This is often the provider name or slug
  provider_slug?: string; // Explicit slug
  category?: string; // Consider making this category slug or ID array
  category_slugs?: string[]; // For multiple categories
  image?: string;
  cover?: string; // Or image
  description?: string;
  tags?: string[];
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  game_id?: string; // External game ID from provider/aggregator
  gameCode?: string; // Alternative external ID
  slug?: string; // Game's own slug
  launch_url?: string;
  is_featured?: boolean;
  show_home?: boolean;
  game_type?: string; // e.g. slots, table, live
  technology?: string; // e.g. html5
  distribution?: string;
  game_server_url?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;
  views?: number;
  created_at?: string;
  updated_at?: string;
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo';
  currency?: string;
  platform?: 'web' | 'mobile';
  returnUrl?: string;
  language?: string;
}

export interface GamesContextType {
  games: Game[];
  filteredGames: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  isLoading: boolean;
  error: string | null;
  fetchGamesAndProviders: () => Promise<void>;
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string) => void;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
  getGameById: (id: string) => Promise<Game | null>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  favoriteGameIds: Set<string>;
  incrementGameView: (gameId: string) => Promise<void>;
  
  // Added/updated based on errors
  loading: boolean; // Consumers expect 'loading'
  totalGames?: number;
  newGames?: Game[];
  addGame?: (gameData: Partial<Game>) => Promise<Game | null>; // For admin
  updateGame?: (gameId: string, gameData: Partial<Game>) => Promise<Game | null>; // For admin
  deleteGame?: (gameId: string) => Promise<boolean>; // For admin
}


export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  symbol: string;
  lastTransactionDate?: string;
  bonusBalance?: number;
  isActive?: boolean;
  vipLevel?: number;
  cryptoBalance?: number;
  demoBalance?: number;
}

export interface DbWallet { // Represents wallet structure from DB
  id: string;
  user_id: string; // Matches Supabase column
  balance: number;
  currency: string;
  last_transaction_date?: string;
  bonus_balance?: number;
  is_active?: boolean;
  vip_level?: number;
  crypto_balance?: number;
  demo_balance?: number;
  created_at: string;
  updated_at: string;
}

export interface WalletResponse {
  success: boolean;
  data?: DbWallet | DbWallet[] | null; // Allow single or array for DbWallet
  error?: string | null;
  message?: string;
}


export interface WalletTransaction {
  id: string;
  userId: string; // Corresponds to player_id in DB
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string; // created_at from DB
  gameId?: string;
  provider?: string;
  description?: string; // Made optional
  balance_before?: number;
  balance_after?: number;
  round_id?: string;
  session_id?: string;
  // referenceId?: string; // Example: payment gateway transaction ID
  // paymentMethod?: string;
  // bonusId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (email: string, password: string, username?: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
  refreshWalletBalance: () => Promise<number | null>;
  isAuthenticated: boolean;
}

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  responsibleGaming: {
    depositLimit: number | null;
    sessionTimeLimit: number | null;
    selfExclusion: boolean;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  statusCode?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SortOptions {
  field: string;
  direction: 'asc' | 'desc';
}

export interface FilterOptions {
  [key: string]: any;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sort?: SortOptions;
  filters?: FilterOptions;
  search?: string;
}

export interface DbGame {
  id: string;
  title: string;
  provider_slug: string;
  category_slugs: string[] | string;
  image_url?: string;
  cover?: string;
  description?: string;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  is_popular?: boolean;
  is_new?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  external_game_id?: string;
  game_id?: string;
  game_code?: string;
  slug?: string;
  is_featured?: boolean;
  show_home?: boolean;
  game_type?: string;
  technology?: string;
  distribution?: string;
  game_server_url?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;
  views?: number;
  created_at: string;
  updated_at: string;
}

export interface GameTag {
  id: string;
  name: string;
  slug: string;
}

export interface GameToGameTag {
  game_id: string;
  tag_id: string;
}
