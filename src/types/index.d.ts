
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

export interface Game {
  id: string;
  title: string;
  description?: string;
  provider: string;
  category: string;
  image: string;
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
  technology?: string;
  launchUrl?: string;
  supportedDevices?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  showHome: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface GameLaunchOptions {
  playerId: string;
  mode: 'real' | 'demo';
  currency: string;
  language: string;
  platform: 'web' | 'mobile';
  returnUrl: string;
  providerId?: string;
}

export interface GamesContextType {
  games: Game[];
  categories: GameCategory[];
  loading: boolean;
  error: string | null;
  popularGames: Game[];
  newGames: Game[];
  jackpotGames: Game[];
  liveGames: Game[];
  loadingMore: boolean;
  loadMore: () => void;
  hasMore: boolean;
  visibleCount: number;
  totalCount: number;
  toggleFavorite: (gameId: string) => Promise<boolean>;
  filterGames: (category: string, searchTerm: string) => Game[];
  loadGame: (id: string) => Promise<Game | null>;
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string>;
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
}

export interface WalletTransaction {
  id: string;
  userId: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  gameId?: string;
  gameName?: string;
  provider?: string;
}

export interface WalletResponse {
  data: Wallet | null;
  error: string | null;
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
