
// Common Types
export interface User {
  id: string;
  name?: string;
  username: string;
  email: string;
  balance: number;
  isAdmin: boolean;
  avatar?: string;
  avatarUrl?: string;
  vipLevel: number;
  isVerified: boolean;
  status?: 'Active' | 'Pending' | 'Inactive';
  joined?: string;
  role?: string;
  favoriteGames?: string[];
  phone?: string;
  lastLogin?: string;
  createdAt?: string;
  firstName?: string;
  lastName?: string;
  currency?: string;
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string; // Ensure avatar is here
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  vipLevel?: number;
  balance?: number;
  currency?: string; // Ensure currency is here
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error?: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (email: string, password: string, username: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  reset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  refreshWalletBalance: () => Promise<void>;
  deposit: (amount: number, method: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: () => boolean;
}

// Game interfaces
export interface Game {
  id: string;
  provider_id?: string; // Keep for mapping if needed, but prefer provider_slug or provider object
  name: string;
  title: string;
  slug?: string;
  image?: string;
  description?: string;
  
  category?: string;
  category_slugs?: string[]; // Ensure this exists
  provider: string; // Can be provider name string
  provider_slug?: string; // Ensure this exists

  minBet?: number;
  maxBet?: number;
  rtp?: number;
  volatility?: string;
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  jackpot?: boolean;
  isLive?: boolean;
  views?: number;

  gameIdentifier?: string;
  gameCode?: string;
  game_id?: string; // Often used as external game ID
  
  technology?: string;
  launchUrl?: string;
  supportedDevices?: string[];
  
  is_featured?: boolean;
  show_home?: boolean;
  game_type?: string;
  status?: 'active' | 'inactive' | string;
  distribution?: string;
  game_server_url?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;

  createdAt?: string;
  updatedAt?: string;
  cover?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  show_home?: boolean;
  status: 'active' | 'inactive';
  created_at?: string;
  updated_at?: string;
  games?: Game[];
}

export interface GameProvider {
  id: string | number;
  name: string;
  logo?: string;
  description?: string;
  status?: string;
  gamesCount?: number;
  isPopular?: boolean;
  featured?: boolean;
  api_endpoint?: string;
  api_key?: string;
  api_secret?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GameLaunchOptions {
  providerId?: string;
  mode?: 'real' | 'demo';
  playerId?: string;
  language?: string;
  currency?: string;
  platform?: "web" | "mobile";
  returnUrl?: string;
}

// Wallet types
export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel: number;
  bonusBalance: number;
  cryptoBalance: number;
  demoBalance: number;
  isActive: boolean;

  balance_bonus_rollover?: number;
  balance_deposit_rollover?: number;
  balance_withdrawal?: number;
  refer_rewards?: number;
  hide_balance?: boolean;
  total_bet?: number;
  total_won?: number;
  total_lose?: number;
  last_won?: number;
  last_lose?: number;
  vip_points?: number;
  deposit_limit_daily?: number;
  deposit_limit_weekly?: number;
  deposit_limit_monthly?: number;
  exclusion_until?: string | null;
  time_reminder_enabled?: boolean;
  reminder_interval_minutes?: number;
  exclusion_period?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface WalletResponse {
  data: Wallet | null;
  error: string | null;
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | string; 
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | string;
  date: string; 
  gameId?: string;
  gameName?: string;
  provider?: string;
  description?: string;
  balance_before?: number;
  balance_after?: number;
  round_id?: string;
  session_id?: string;
}

// Games Context
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
}

// Re-export types from additional.ts - check if these are actually needed or if direct export is better
// For now, I'll comment them out to avoid potential conflicts if primary types are sufficient.
// export { GameCategory as GameCategoryAdditional, GameProvider as GameProviderAdditional, GameLaunchOptions as GameLaunchOptionsAdditional } from './additional';
// export { WalletTransaction as WalletTransactionAdditional } from './additional';
