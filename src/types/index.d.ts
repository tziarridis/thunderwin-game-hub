import { Session } from "@supabase/supabase-js";

export interface User {
  id: string; // from auth.users.id or public.users.id (must be UUID if from Supabase)
  email: string; // from auth.users.email or public.users.email
  firstName?: string; // from public.profiles.first_name or public.users.first_name
  lastName?: string; // from public.profiles.last_name or public.users.last_name
  username?: string; // from public.users.username
  avatar_url?: string; // from public.profiles.avatar_url or public.users.avatar
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  birthdate?: string; // Note: UserForm uses birthDate, ensure consistency or map
  gender?: string;
  language?: string;
  currency?: string; // from public.wallets.currency
  created_at?: string;
  updated_at?: string;
  role?: string; // from public.users.role_id (mapped) or a custom 'role' field

  // Fields from UserForm that need to be in the model
  displayName?: string; // Often username or firstName + lastName
  avatar?: string; // Same as avatar_url, ensuring consistency
  isActive?: boolean; // Could map from public.users.status or a specific field
  balance?: number; // from public.wallets.balance
  vipLevel?: number; // from public.wallets.vip_level
  kycStatus?: 'not_submitted' | 'pending' | 'verified' | 'rejected' | string; // from a KYC table or user profile
  twoFactorEnabled?: boolean; // from auth settings or user profile
  emailVerified?: boolean; // from auth.users.email_confirmed_at or a profile field
  lastLogin?: string; // For UserForm's Omit, though not directly used in form
  name?: string; // For KycForm, usually firstName + lastName
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  error: any;
  isAuthenticated: boolean;
  isAdmin: boolean;
  signIn: (email: string, password?: string) => Promise<any>;
  signUp: (email: string, password?: string, metadata?: any) => Promise<any>;
  signOut: () => Promise<void>;
  adminLogin: (email: string, password?: string) => Promise<any>;
  updateUserProfile: (data: any) => Promise<{ data: any; error: any }>;
  refreshWalletBalance: () => Promise<Wallet | null>;
  deposit?: (amount: number, currency: string, paymentMethodId?: string) => Promise<any>; // Added deposit
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
  isActive: boolean; // Changed from status to isActive for consistency
  order?: number;
  games_count?: number;
  // status?: 'active' | 'inactive'; // Can be derived from isActive or kept if db has it
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
  isActive: boolean; // For consistency
  description?: string;
}

export interface Wallet {
  id: string;
  userId: string;
  currency: string;
  symbol: string;
  balance: number;
  createdAt: string;
  updatedAt: string;
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
  // Add other relevant fields
}

export interface Bonus {
  id: string;
  name: string;
  description: string;
  type: string; // e.g., 'deposit_match', 'free_spins'
  amount?: number;
  wageringRequirement?: number;
  isActive: boolean;
  // Added fields based on PromotionCard.tsx usage if Promotion is similar
  title?: string; // PromotionCard uses title
  endDate?: string; // PromotionCard uses endDate
  ctaText?: string; // PromotionCard uses ctaText
  imageUrl?: string; // PromotionCard uses imageUrl
  termsLink?: string; // PromotionCard uses termsLink
  // Add other relevant fields
}

// Define Promotion type
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ctaText?: string; // Call to action text, e.g., "Claim Now"
  ctaLink?: string; // Link for the call to action
  startDate?: string;
  endDate?: string;
  type: 'deposit_bonus' | 'free_spins' | 'tournament' | 'cashback' | string; // Type of promotion
  termsLink?: string; // Link to terms and conditions
  isActive: boolean;
  wageringRequirement?: number; // Optional: if bonus related
  games?: string[]; // Optional: applicable games
  promoCode?: string; // Optional: promo code
}


export interface BonusTemplate {
  id: string;
  name: string;
  description?: string;
  type: BonusType;
  amount?: number; // For fixed amount bonuses
  percentage?: number; // For percentage-based bonuses (e.g., deposit match)
  maxAmount?: number; // Max bonus amount for percentage bonuses
  freeSpinsCount?: number; // For free spins bonuses
  wageringRequirement: number; // Wagering multiplier (e.g., 30 for 30x)
  gameRestrictions?: string[]; // Array of game IDs or slugs where bonus can be used/not used
  durationDays?: number; // How many days the bonus is valid after activation
  minDeposit?: number; // Minimum deposit to qualify for the bonus
  promoCode?: string; // Optional promo code to claim
  targetVipLevel?: string; // Changed from targetVipLevelId to targetVipLevel
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
  benefits: string[]; // Array of benefit descriptions
  cashbackPercentage?: number;
  monthlyBonusId?: string; // FK to a BonusTemplate
  dedicatedManager?: boolean;
  customWithdrawalLimits?: boolean;
  isActive: boolean; // Added isActive
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
  launchGame: (game: Game, options: GameLaunchOptions) => Promise<string | null>;
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

// Add missing types referenced in error messages
export interface Affiliate {
    id: string;
    name: string;
    code: string;
    commission: number;
    // Added missing properties for AffiliateStats
    commission_paid?: number;
    clicks?: number;
    registrations?: number;
    depositingUsers?: number;
}

// Alias for Wallet to fix the DbWallet error
export type DbWallet = Wallet;
