
// Common Types
export interface User {
  id: string;
  name?: string; // from index.ts (User)
  username: string;
  email: string;
  balance: number; // from index.ts (User)
  isAdmin: boolean; // from index.ts (User)
  avatar?: string;
  avatarUrl?: string;
  vipLevel: number; // from index.ts (User)
  isVerified: boolean; // from index.ts (User)
  status?: 'Active' | 'Pending' | 'Inactive'; // from index.ts (User)
  joined?: string; // from index.ts (User)
  role?: string; // from index.ts (User, role can be 'admin' | 'user')
  favoriteGames?: string[]; // from index.ts (User)
  phone?: string; // from index.ts (User)
  lastLogin?: string; // from index.ts (User)
  createdAt?: string; // from index.ts (User)
  firstName?: string;
  lastName?: string;
  currency?: string;
  referralCode?: string; // from index.ts (User)
  referredBy?: string; // from index.ts (User)
  ipAddress?: string; // from index.ts (User)
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
  name?: string; // from index.ts (AuthUser) - can be derived from firstName/lastName or username
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
  provider_id?: string; // Keep for mapping if needed
  name: string; // from index.ts (Game), often same as title
  title: string;
  slug?: string; // Ensure this exists
  image?: string;
  description?: string;
  
  category?: string; // from index.ts (Game)
  category_slugs?: string[]; // Ensure this exists
  provider: string; // Can be provider name string
  provider_slug?: string; // Ensure this exists

  minBet?: number;
  maxBet?: number;
  rtp?: number;
  volatility?: string; // from index.ts (Game)
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  jackpot?: boolean; // from index.ts (Game)
  isLive?: boolean;
  views?: number;

  gameIdentifier?: string;
  gameCode?: string; // Ensure this exists
  game_id?: string; // Often used as external game ID, ensure this is the correct one
  
  technology?: string;
  launchUrl?: string; // from index.d.ts Game, (url in index.ts Game)
  supportedDevices?: string[];
  
  is_featured?: boolean;
  show_home?: boolean;
  game_type?: string;
  status?: 'active' | 'inactive' | string; // from index.d.ts Game
  distribution?: string;
  game_server_url?: string;
  has_lobby?: boolean;
  is_mobile?: boolean;
  has_freespins?: boolean;
  has_tables?: boolean;
  only_demo?: boolean;

  createdAt?: string;
  updatedAt?: string;
  cover?: string; // from index.d.ts Game
  features?: string[]; // from index.ts (Game)
  tags?: string[]; // from index.ts (Game)
  releaseDate?: string; // from index.ts (Game)
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
  referenceId?: string; // from index.ts (Transaction)
  paymentMethod?: string; // from index.ts (Transaction)
  bonusId?: string; // from index.ts (Transaction)
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

// Copied from src/types/index.ts, ensure they are non-conflicting or integrated
export interface Affiliate {
  id: string;
  userId: string;
  userName: string;
  name: string;
  email: string;
  website?: string;
  code: string;
  referredUsers: number;
  totalCommissions: number;
  commission: number;
  signups: number;
  totalRevenue: number;
  joinedDate: string;
  payoutMethod: string;
  payoutDetails: string;
  status: 'active' | 'pending' | 'suspended';
  joined: string; // Duplicate?
  referralCode: string; // Duplicate?
}

export interface VipLevel {
  id: number | string;
  level: number;
  name: string;
  pointsRequired: number;
  requiredPoints?: number;
  benefits: string[];
  cashbackRate: number;
  withdrawalLimit: number;
  bonuses: {
    depositMatch: number;
    freeSpins: number;
    birthdayBonus: number;
  };
  icon?: string;
  color?: string;
  personalManager?: boolean;
  customGifts?: boolean;
  specialPromotions?: boolean;
  requirements?: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: string;
  bonusAmount?: number;
  bonusType?: string; // also in BonusTemplate
  targetAudience?: string[];
  code?: string;
  minDeposit?: number;
  wageringRequirement?: number;
  promotionType?: string;
  category?: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsers: number;
  activeUsers: number;
  totalRevenue: number;
  dailyRevenue: number;
  monthlyRevenue: number;
  totalBets: number;
  avgBetSize: number;
  registrationConversion: number;
  depositConversion: number;
  ggr: number;
  ngr: number;
  volume: number;
  bonusAmount: number;
  taxes: number;
  totalDeposits: number;
  totalWithdrawals: number;
  availableBalance: number;
}

export interface GameStats {
  mostPlayed: { name: string; count: number }[];
  highestWin: { name: string; amount: number }[];
  popularCategories: { name: string; count: number }[];
  totalBets: number;
  totalWins: number;
  netProfit: number;
  gameName?: string;
  uniquePlayers: number;
}

export interface ProviderStats {
  revenue: { name: string; amount: number }[];
  bets: { name: string; count: number }[];
  winRate: { name: string; rate: number }[];
  totalBets: number;
  totalWins: number;
  netProfit: number;
  providerName?: string;
  totalGames: number;
  uniquePlayers: number;
}

export interface RegionStats {
  usersByCountry: { country: string; users: number }[];
  revenueByCountry: { country: string; revenue: number }[];
  activeSessionsByRegion: { region: string; sessions: number }[];
  depositAmount: number;
  betAmount: number;
  netProfit: number;
  region?: string;
  userCount: number;
  winAmount?: number;
}

export enum KycStatus {
  NOT_SUBMITTED = "not_submitted",
  PENDING = "pending",
  VERIFIED = "verified",
  REJECTED = "rejected"
}

export interface KycRequest {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  documentNumber: string;
  submissionDate: string;
  status: KycStatus;
  verificationDate?: string;
  rejectionReason?: string;
  documentUrls: string[];
  email?: string;
  submittedDate?: string;
  documentImage?: string;
  documentFiles?: string[];
}

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  type: string; // Consider BonusType enum
  value: number; 
  minDeposit?: number;
  wageringRequirement: number;
  durationDays: number;
  forVipLevels: number[];
  isActive: boolean;
  bonusType?: string; // also in Promotion
  amount?: number;
  wagering?: number;
  expiryDays?: number;
  percentage?: number;
  maxBonus?: number;
  vipLevelRequired?: number | string;
  allowedGames?: string;
  code?: string;
}

export enum BonusType {
  WELCOME = "welcome",
  DEPOSIT = "deposit",
  RELOAD = "reload",
  CASHBACK = "cashback",
  FREE_SPINS = "free_spins",
  VIP = "vip",
  REFERRAL = "referral"
}

export interface Bonus {
  id: string;
  userId: string;
  type: BonusType;
  amount: number;
  status: "active" | "used" | "expired";
  expiryDate: string;
  createdAt: string;
  wageringRequirement: number;
  progress: number;
  code?: string;
  description?: string;
}

export interface BonusTemplateFormData {
  id?: string;
  name: string;
  description: string;
  type: string; // Consider BonusType enum
  value: number;
  minDeposit?: number;
  wageringRequirement: number;
  durationDays: number;
  forVipLevels: number[];
  isActive: boolean;
  bonusType?: string;
  amount?: number;
  percentage?: number;
  wagering?: number;
  expiryDays?: number;
  maxBonus?: number;
  vipLevelRequired?: number | string;
  allowedGames?: string;
  code?: string;
}

