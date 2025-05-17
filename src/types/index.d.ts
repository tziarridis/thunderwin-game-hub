
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
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  vipLevel?: number;
  balance?: number;
  currency?: string;
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

// Re-export WalletTransaction from additional types
import type { WalletTransaction as WT, GameCategory, GameProvider, GameLaunchOptions } from './additional';
export type { WT as WalletTransaction };
export type { GameCategory }; 
export type { GameProvider }; 
export type { GameLaunchOptions }; 

export interface Game {
  id: string;
  provider_id?: string;
  name: string;
  title: string;
  slug?: string;
  image?: string;
  description?: string;
  
  category?: string;
  category_slugs?: string[];
  provider: string;
  provider_slug?: string;

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
  game_id?: string;
  
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

// This context type should align with what useGames hook provides.
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

  // Added fields based on walletService mapping
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

export interface GameFilters {
  category?: string;
  provider?: string;
  search?: string;
  isPopular?: boolean;
  isNew?: boolean;
  hasJackpot?: boolean;
  isLive?: boolean;
  limit?: number;
  offset?: number;
}

export interface GameResponse {
  data: Game[];
  count: number;
  error: string | null;
}

export interface WalletResponse {
  data: Wallet | null;
  error: string | null;
}
