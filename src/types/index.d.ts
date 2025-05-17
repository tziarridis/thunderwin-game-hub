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
import type { WalletTransaction as WT, GameCategory as GC, GameProvider as GP, GameLaunchOptions as GLO } from './additional';
export type { WT as WalletTransaction };
export type { GC as GameCategory }; // Keep additional.ts as source for GameCategory
export type { GP as GameProvider }; // Keep additional.ts as source for GameProvider
export type { GLO as GameLaunchOptionsAdditional }; // Keep additional.ts as source for GameLaunchOptions


export interface Game {
  id: string;
  provider_id?: string; // Added to match DB mapping
  name: string; // From mapSupabaseGameToGame
  title: string;
  slug: string; // From mapSupabaseGameToGame (game_code)
  image?: string; // Renamed from 'cover' in mapSupabaseGameToGame for consistency if needed, or map cover to image
  description?: string;
  
  category?: string; // Original field, might be a slug or name
  category_slugs?: string[]; // Added to match useGames & DB mapping
  provider: string; // Original field, could be name or slug
  provider_slug?: string; // Added to match useGames & DB mapping

  minBet?: number;
  maxBet?: number;
  rtp?: number;
  volatility?: string; // Keep if used
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean; // This is usually client-side state, not from DB directly for all games list
  jackpot?: boolean;
  isLive?: boolean; // from module augmentation
  views?: number;

  gameIdentifier?: string; // Original field
  gameCode?: string; // Original field, maps to slug
  game_id?: string; // Added: from DB mapping (distinct from internal UUID id)
  
  technology?: string;
  launchUrl?: string; // Keep if used
  supportedDevices?: string[]; // Keep if used
  
  is_featured?: boolean; // Added: from DB mapping
  show_home?: boolean; // Added: from DB mapping
  game_type?: string; // Added: from DB mapping
  status?: 'active' | 'inactive' | string; // Added: from DB mapping
  distribution?: string; // Added: from DB mapping
  game_server_url?: string; // Added: from DB mapping
  has_lobby?: boolean; // Added: from DB mapping
  is_mobile?: boolean; // Added: from DB mapping
  has_freespins?: boolean; // Added: from DB mapping
  has_tables?: boolean; // Added: from DB mapping
  only_demo?: boolean; // Added: from DB mapping

  createdAt?: string; // Original field, maps to created_at
  updatedAt?: string; // Original field, maps to updated_at
  cover?: string; // From DB, if different from image
}

// export interface GameCategory { // Definition moved to additional.ts and re-exported
//   id: string;
//   name: string;
//   slug: string;
//   icon?: string;
//   image?: string;
//   showHome: boolean; // Note: additional.ts uses show_home
//   status: string;
//   createdAt: string;
//   updatedAt: string;
// }

export interface GameLaunchOptions { // This definition seems specific and might conflict with additional.ts
  playerId: string;
  mode: 'real' | 'demo';
  currency: string;
  language: string;
  platform: 'web' | 'mobile';
  returnUrl: string;
  providerId?: string;
}

// This context type should align with what useGames hook provides.
// Taking structure from src/hooks/useGames.tsx GamesContextType
export interface GamesContextType {
  games: Game[];
  filteredGames: Game[]; // from useGames
  providers: GP[]; // use GameProvider from additional.ts
  categories: GC[]; // use GameCategory from additional.ts
  isLoading: boolean; // from useGames
  error: string | null; // from useGames
  fetchGamesAndProviders: () => Promise<void>; // from useGames
  filterGames: (searchTerm: string, categorySlug?: string, providerSlug?: string) => void; // from useGames
  launchGame: (game: Game, options: import('./additional').GameLaunchOptions) => Promise<string | null>; // from useGames, ensure options match
  getGameById: (id: string) => Promise<Game | null>; // from useGames
  toggleFavoriteGame: (gameId: string) => Promise<void>; // from useGames
  favoriteGameIds: Set<string>; // from useGames
  incrementGameView: (gameId: string) => Promise<void>; // from useGames
  // Properties previously here but likely from a different version of GamesContextType
  // popularGames: Game[];
  // newGames: Game[];
  // jackpotGames: Game[];
  // liveGames: Game[];
  // loadingMore: boolean;
  // loadMore: () => void;
  // hasMore: boolean;
  // visibleCount: number;
  // totalCount: number;
  // loadGame: (id: string) => Promise<Game | null>; // Replaced by getGameById
}


export interface Wallet {
  id: string;
  userId: string;
  balance: number;
  currency: string;
  symbol: string;
  vipLevel: number;
  bonusBalance: number; // maps to balance_bonus
  cryptoBalance: number; // maps to balance_cryptocurrency
  demoBalance: number; // maps to balance_demo
  isActive: boolean; // maps to active

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

// WalletTransaction is re-exported from additional.ts

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
