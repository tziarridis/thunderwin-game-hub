import { Session } from "@supabase/supabase-js";

export interface User {
  id: string; 
  email: string; 
  firstName?: string; 
  lastName?: string; 
  username?: string; 
  avatar_url?: string; 
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  birthdate?: string; 
  gender?: string;
  language?: string;
  currency?: string; 
  created_at?: string;
  updated_at?: string;
  role?: string; 

  displayName?: string; 
  avatar?: string; 
  isActive?: boolean; 
  balance?: number; 
  vipLevel?: number; 
  kycStatus?: KycStatusType | string; // Use KycStatusType
  twoFactorEnabled?: boolean; 
  emailVerified?: boolean; 
  lastLogin?: string; 
  registrationDate?: string; 
  status?: string; 
  name?: string; 
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password?: string) => Promise<any>; // Renamed from signIn
  register: (username: string, email: string, password?: string, metadata?: any) => Promise<any>; // Renamed from signUp and updated signature
  signOut: () => Promise<void>;
  adminLogin: (email: string, password?: string) => Promise<any>;
  updateUserProfile: (data: any) => Promise<{ data: any; error: any }>;
  refreshWalletBalance: () => Promise<Wallet | null>;
  deposit: (amount: number, currency: string, paymentMethodId?: string) => Promise<any>; // Added
  updateUserSettings?: (settings: Partial<User>) => Promise<{ error?: any }>; 
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
    errorMessage?: string;
    gameUrl?: string;
}

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: { [key: string]: any };
}

export interface Game {
  id: string;
  game_id?: string; // External ID from provider
  title: string;
  name?: string; // Alternative for title
  provider: string; // Provider slug or ID
  providerName?: string; // Display name for provider
  category: string; // Category slug or ID
  categoryName?: string; // Display name for category
  category_slugs?: string[] | string; // Allow string or array to match DbGame
  image: string;
  description?: string;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high' | string;
  minBet?: number;
  maxBet?: number;
  isFavorite?: boolean;
  isNew?: boolean;
  isPopular?: boolean;
  is_featured?: boolean;
  show_home?: boolean;
  tags?: string[];
  launchUrl?: string; // This should be the final, usable launch URL
  jackpot?: number; // For jackpot games
  releaseDate?: string; // For sorting new games
  release_date?: string; // Alternative for releaseDate
  views?: number;
  created_at?: string;
  updated_at?: string;
  provider_id?: string;
  provider_slug?: string;
  features?: string[];
  themes?: string[];
  lines?: number;
  cover?: string;
  banner?: string;
  image_url?: string;
  status?: string;
  slug?: string; // game slug
  game_code?: string; // From games table
}

export interface DbGame {
  id: string; // Primary key, should be unique game identifier
  game_id?: string; // External or provider-specific game ID. From games table.
  slug?: string;
  title: string; // Game's display name. From games.game_name.
  provider_id?: string; // Foreign key to providers table
  provider_slug?: string; // Denormalized provider slug
  category_ids?: string[]; // Array of foreign keys to categories table
  category_slugs?: string[] | string; // Denormalized category slugs (can be string from some sources)
  description?: string;  // From games table
  tags?: string[]; // e.g., ["megaways", "bonus-buy"]
  features?: string[]; // e.g., ["free-spins", "multipliers"]
  themes?: string[]; // e.g., ["egyptian", "adventure"]
  rtp?: number; // Return to Player percentage. From games table.
  volatility?: 'low' | 'medium' | 'high' | string;
  lines?: number; // Paylines
  cover?: string; // URL to game cover image. From games table.
  banner?: string; // URL to game banner image
  image_url?: string; // Generic image URL if others aren't specific
  launch_url_template?: string; // If game launch needs a template. May be constructed if not direct.
  status?: 'active' | 'inactive' | 'maintenance' | string; // Game status. From games table.
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean; // For "featured" sections. From games table.
  show_home?: boolean; // If game should be shown on homepage special sections. From games table.
  views?: number; // View count for popularity metrics. From games table.
  order?: number; // For manual sorting
  min_bet?: number;
  max_bet?: number;
  has_jackpot?: boolean;
  created_at?: string;
  updated_at?: string;
  release_date?: string;
  game_code?: string; // Added, from games table
  launch_url?: string; // Added for GameForm consistency, potentially constructed
}

export interface GameProvider {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  description?: string;
  isActive: boolean; 
  order?: number;
  games_count?: number;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  order?: number;
  show_home?: boolean;
  status?: 'active' | 'inactive';
  isActive: boolean; 
  description?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  symbol: string;
  balance: number;
  bonusBalance?: number; // Added for WalletBalance/MobileWalletSummary
  createdAt: string;
  updatedAt: string;
  vipLevel?: number; 
}

export interface Transaction {
  id: string;
  userId: string;
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: string;
  updatedAt: string;
  description?: string; // Added field
}

export interface Bonus {
  id: string;
  userId: string; // Added
  name?: string; // Kept optional as BonusHub derives it or it might be supplemental
  description: string;
  type: BonusType; // Use BonusType string union
  amount: number; // Assuming amount is always number (e.g. count for free spins)
  status: 'active' | 'used' | 'expired' | string; // Added
  expiryDate: string; // Added
  createdAt: string; // Added
  wageringRequirement?: number;
  progress?: number; // Added
  code?: string; // Added
  isActive?: boolean; // This might be redundant if 'status' is used, review usage
  // Fields from PromotionCard usage (review if still needed or if BonusHub is primary consumer)
  title?: string; 
  endDate?: string; // Potentially redundant with expiryDate
  ctaText?: string; 
  imageUrl?: string; 
  termsLink?: string; 
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string; 
  ctaLink?: string; 
  startDate?: string;
  endDate?: string;
  promotionType: 'deposit_bonus' | 'free_spins' | 'tournament' | 'cashback' | string; 
  termsLink?: string; 
  isActive: boolean;
  bonusPercentage?: number; 
  maxBonusAmount?: number; 
  wageringRequirement?: number; 
  games?: string[]; 
  promoCode?: string; 
  usageLimitPerUser?: number; // For Promotions.tsx
  status?: 'active' | 'inactive' | 'expired' | string; // For Promotions.tsx
  category?: string; // For Promotions.tsx
  terms?: string; // For Promotions.tsx
  freeSpinsCount?: number; // For Promotions.tsx
  minDeposit?: number; // For Promotions.tsx
}

export interface BonusTemplate {
  id: string;
  name: string;
  description?: string;
  type: BonusType;
  amount?: number; 
  percentage?: number; 
  maxAmount?: number; 
  freeSpinsCount?: number; 
  wageringRequirement: number; 
  gameRestrictions?: string[] | string; // Allow string for form data
  durationDays?: number; 
  minDeposit?: number; 
  promoCode?: string; 
  targetVipLevel?: string; 
  targetVipLevelId?: string; // For bonusService.ts
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BonusTemplateFormData {
  name: string;
  description?: string;
  type: BonusType;
  amount?: number;
  percentage?: number;
  maxAmount?: number;
  freeSpinsCount?: number;
  wageringRequirement: number;
  gameRestrictions?: string; // Comma-separated string in form, converted to array on save
  durationDays?: number;
  minDeposit?: number;
  promoCode?: string;
  targetVipLevel?: string; // Changed from targetVipLevelId to targetVipLevel
  isActive: boolean;
}

export type BonusType = 'deposit_match' | 'no_deposit' | 'free_spins' | 'cashback' | 'reload' | 'loyalty_points' | string;


export interface VipLevel {
  id: string;
  level: number;
  name: string;
  pointsRequired: number;
  benefits: string[]; 
  cashbackPercentage?: number;
  monthlyBonusId?: string; 
  monthlyBonus?: BonusTemplate; // For VipBonusManagement
  dedicatedManager?: boolean;
  customWithdrawalLimits?: boolean;
  isActive: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

export interface GameLaunchOptions {
    mode: 'real' | 'demo';
    playerId: string;
    currency: string;
    platform: 'web' | 'mobile';
    language?: string;
    returnUrl?: string; // Added for GameLauncher
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
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>; // For GameDetails
  getGameById: (id: string) => Promise<Game | null>;
  getFavoriteGames: () => Promise<Game[]>;
  loading: boolean;
  favoriteGameIds: Set<string>;
  toggleFavoriteGame: (gameId: string) => Promise<void>;
  incrementGameView: (gameId: string) => Promise<void>;
  addGame: (gameData: Partial<DbGame>) => Promise<DbGame | null>;
  updateGame: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>;
  deleteGame: (gameId: string) => Promise<boolean>;
}

export interface Affiliate {
    id: string;
    name: string;
    code: string;
    commission: number;
    commission_paid?: number;
    clicks?: number;
    registrations?: number;
    depositingUsers?: number;
    totalCommissions?: number; // For Affiliates.tsx
    status?: 'active' | 'pending' | 'inactive' | string; // For Affiliates.tsx
    email?: string; // For Affiliates.tsx
}

export type DbWallet = Wallet;

// Added for KycManagement.tsx and UserProfile.tsx
export interface KycRequest {
  id: string;
  userId: string;
  user?: { // Nested user details
    id?: string;
    username?: string;
    email?: string;
  };
  documentType: string;
  documentNumber: string;
  status: KycStatusType;
  submittedAt: string; // Standardized submission timestamp
  reviewedAt?: string;
  reviewerId?: string;
  rejectionReason?: string;
  documentImage?: string; // For displaying document image if available
  documentUrls?: string[]; // For multiple document files/images
  documentFiles?: string[]; // Alternative or additional if needed
  verificationDate?: string; // Timestamp for when verification occurred
}

// Renamed KycStatus to KycStatusType to avoid conflict if KycStatus component exists
export type KycStatusType = 'pending' | 'approved' | 'rejected' | 'submitted' | 'resubmit_required' | 'verified'; // Added 'verified' from usage

// Added for Admin Settings page
export interface SiteSettings {
  siteName?: string;
  logoUrl?: string;
  contactEmail?: string;
  defaultCurrency?: string;
  maintenanceMode?: boolean;
  // Add any other site-wide settings
}

// For TransactionService
export interface TransactionServiceType {
  getUserTransactions: (userId: string, options?: QueryOptions) => Promise<ApiResponse<Transaction[]>>;
  getTransactionById: (transactionId: string) => Promise<ApiResponse<Transaction | null>>;
  createTransaction: (transactionData: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ApiResponse<Transaction>>;
  updateTransactionStatus: (transactionId: string, status: Transaction['status']) => Promise<ApiResponse<Transaction>>;
  fetchUserTransactions?: (userId: string, page: number, limit: number) => Promise<{ data: Transaction[]; total: number }>; // For Transactions.tsx
}

// Added for UserProfile.tsx
export interface UserProfileData {
  user: User;
  wallet?: Wallet;
  recentTransactions?: Transaction[]; // Or WalletTransaction[]
  stats?: {
    gamesPlayed?: number;
    totalWagered?: number;
    vipLevel?: number;
    // other stats
  };
  kycStatus?: KycStatusType;
  lastLogin?: string;
  registrationDate?: string;
}

export interface WalletTransaction extends Transaction {
  // Can be extended with display-specific fields if needed
  // For now, it's an alias or extension of Transaction
  description?: string; // Example additional field
}
