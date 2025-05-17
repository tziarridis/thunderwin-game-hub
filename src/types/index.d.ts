import { Session } from "@supabase/supabase-js";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  city?: string;
  address?: string;
  zipCode?: string;
  birthdate?: string;
  gender?: string;
  language?: string;
  currency?: string;
  username?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  role?: string;
  // Add other relevant fields
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
  // Add any other methods you want to expose
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
  category_slugs?: string[];
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
  launchUrl?: string;
  jackpot?: number; // For jackpot games
  releaseDate?: string; // For sorting new games
  release_date?: string; // Alternative for releaseDate
  views?: number;
  // Supabase specific fields if directly mapping from a table
  created_at?: string;
  updated_at?: string;
  // Fields from DbGame that might be useful
  provider_id?: string;
  provider_slug?: string;
  features?: string[];
  themes?: string[];
  lines?: number;
  cover?: string; // often used for game image
  banner?: string;
  image_url?: string; // alternative for game image
  status?: string; // e.g., 'active', 'inactive'
  slug?: string; // game slug
}

export interface DbGame {
  id: string; // Primary key, should be unique game identifier
  game_id?: string; // External or provider-specific game ID
  slug?: string;
  title: string; // Game's display name
  provider_id?: string; // Foreign key to providers table
  provider_slug?: string; // Denormalized provider slug
  category_ids?: string[]; // Array of foreign keys to categories table
  category_slugs?: string[] | string; // Denormalized category slugs (can be string from some sources)
  description?: string;
  tags?: string[]; // e.g., ["megaways", "bonus-buy"]
  features?: string[]; // e.g., ["free-spins", "multipliers"]
  themes?: string[]; // e.g., ["egyptian", "adventure"]
  rtp?: number; // Return to Player percentage
  volatility?: 'low' | 'medium' | 'high' | string;
  lines?: number; // Paylines
  cover?: string; // URL to game cover image (usually square or portrait)
  banner?: string; // URL to game banner image (usually landscape)
  image_url?: string; // Generic image URL if others aren't specific
  launch_url_template?: string; // If game launch needs a template
  status?: 'active' | 'inactive' | 'maintenance'; // Game status
  is_popular?: boolean;
  is_new?: boolean;
  is_featured?: boolean; // For "featured" sections
  show_home?: boolean; // If game should be shown on homepage special sections
  views?: number; // View count for popularity metrics
  order?: number; // For manual sorting
  min_bet?: number;
  max_bet?: number;
  has_jackpot?: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  release_date?: string; 
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
  // Add other relevant fields
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
    language?: string;  // Added language property
    // Add other options as needed
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
    // Add other necessary properties
}

// Alias for Wallet to fix the DbWallet error
export type DbWallet = Wallet;
