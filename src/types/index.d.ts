export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  avatarUrl?: string; // Added for backward compatibility
  role?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  vipLevel?: number;
  balance?: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: string;
  title: string;
  name: string;
  description?: string;
  provider: string;
  category: string;
  image: string;
  rtp: number;
  volatility: 'low' | 'medium' | 'high';
  minBet: number;
  maxBet: number;
  isPopular: boolean;
  isNew: boolean;
  isFavorite?: boolean;
  jackpot?: boolean;
  releaseDate?: string;
  tags: string[];
  features: string[];
}

export interface GameProvider {
  id: string;
  name: string;
  logo: string;
  gamesCount: number;
  isPopular: boolean;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  image?: string;
  icon?: string;
  gamesCount?: number;
}

export interface GameDataResponse {
  data: Game[];
  meta?: {
    total: number;
    page: number;
    limit: number;
  }
}

export interface GameProviderResponse {
  data: GameProvider[];
  meta?: {
    total: number;
  }
}

export interface GameCategoryResponse {
  data: GameCategory[];
  meta?: {
    total: number;
  }
}

export interface WalletTransaction {
  id: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  createdAt: string;
  gameId?: string;
  gameName?: string;
  provider?: string;
  balanceBefore?: number;
  balanceAfter?: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: 'crypto' | 'fiat' | 'card' | 'voucher' | 'bank';
  logo: string;
  minDeposit: number;
  maxDeposit: number;
  currency: string;
  processingTime: string;
  fee: number | string;
  isPopular?: boolean;
}

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  storageKey?: string;
}

export interface PromotionCard {
  id: string;
  title: string;
  description: string;
  image: string;
  link: string;
  endDate?: string;
  type: 'welcome' | 'deposit' | 'freespin' | 'cashback' | 'vip' | 'special';
  isActive: boolean;
  termsAndConditions?: string[];
}

export interface VIPLevelInfo {
  level: number;
  name: string;
  requiredPoints: number;
  benefits: string[];
  cashbackRate: number;
  color?: string;
  icon?: string;
  nextLevel?: {
    name: string;
    requiredPoints: number;
    progress: number;
  };
}

export interface GameList {
  id: string;
  name: string;
  slug: string;
  games: Game[];
  totalGames: number;
  isCustom?: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
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

export interface Card {
  id: string;
  name: string;
  type: string;
  last4: string;
  expMonth: string;
  expYear: string;
  isDefault: boolean;
}

export interface DepositStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface WithdrawStep {
  id: string;
  title: string;
  description: string;
  image?: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
}

export interface GameLaunchOptions {
  providerId?: string;
  mode?: 'demo' | 'real';
  playerId?: string;
  language?: string;
  currency?: string;
  platform?: 'web' | 'mobile';
  returnUrl?: string;
}

export interface GameConfigProvider {
  id: string;
  name: string;
  type: string;
  currency?: string;
  enabled: boolean;
  credentials?: {
    apiEndpoint?: string;
    agentId?: string;
    secretKey?: string;
    token?: string;
    callbackUrl?: string;
  };
}

export interface GamesContextType {
  games: Game[];
  providers: GameProvider[];
  categories: GameCategory[];
  featuredGames: Game[];
  newGames: Game[];
  popularGames: Game[];
  isLoading: boolean;
  error: string | null;
  toggleFavorite: (gameId: string) => Promise<void>;
  launchGame: (game: Game, options?: GameLaunchOptions) => Promise<string | void>;
  searchGames: (query: string) => Promise<Game[]>;
  getGamesByProvider: (providerId: string) => Promise<Game[]>;
  getGamesByCategory: (categoryId: string) => Promise<Game[]>;
  getFavoriteGames: () => Promise<Game[]>;
  getGameById: (gameId: string) => Promise<Game | null>;
}
