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
  isActive: boolean; // Maps to 'status' in UserForm
  createdAt: string;
  updatedAt?: string;
  lastLogin?: string;
  balance?: number; // This might come from Wallet, not directly on User model
  currency?: string; // This might come from Wallet
  vipLevel?: number; // This might come from Wallet or a separate VIP table
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  birthDate?: string;
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted'; // Maps to 'isVerified'
  twoFactorEnabled?: boolean;
  emailVerified?: boolean; // Alternative for 'isVerified'
  preferences?: UserPreferences;
  referralCode?: string;
  referredBy?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string; // Or displayName
  role: 'user' | 'admin' | 'moderator'; // For isAdmin
  displayName?: string;
  avatar?: string;
  balance?: number; // From associated wallet
  currency?: string; // From associated wallet
  vipLevel?: number; // From associated wallet
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted'; // For isVerified
  // Add other relevant fields from User that are needed in auth context
  firstName?: string;
  lastName?: string;
  name?: string;
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

// Updated GameProvider interface
export interface GameProvider {
  id: string;
  name: string;
  slug: string; 
  logo?: string;
  description?: string; 
  isActive: boolean; 
  order: number; 
  games_count?: number; 
  status: 'active' | 'inactive'; 
  api_endpoint?: string; 
  api_key?: string; 
  api_secret?: string; 
  created_at?: string; 
  updated_at?: string; 
}

// Updated GameCategory interface
export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description?: string; 
  icon?: string;
  image?: string;
  order?: number; 
  isActive?: boolean; 
  status: 'active' | 'inactive'; 
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
  games?: Game[]; 
}

// Updated Game interface
export interface Game {
  id: string;
  title: string;
  name?: string; 
  provider: string; // This is often the provider's name or slug
  provider_slug?: string; // Explicit slug for filtering
  category?: string; // Optional: if a single primary category name is useful
  category_slugs?: string[]; // For multiple categories
  image?: string;
  cover?: string; // often used for larger images or specific displays
  description?: string;
  tags?: string[];
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean; // Should be managed dynamically, not part of static game data usually
  status?: 'active' | 'inactive' | 'maintenance';
  game_id?: string; // External game ID from provider/aggregator, can be the same as id or different
  game_code?: string; // Alternative external ID, often used for launching
  slug?: string; // Game's own slug for URL routing
  launch_url?: string; // If a direct launch URL is stored
  is_featured?: boolean;
  is_live?: boolean; // Added from additional.ts module augmentation
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
  created_at?: string;
  updated_at?: string;
  minBet?: number;
  maxBet?: number;
  jackpot?: boolean; 
  releaseDate?: string; // Added to accommodate mock-games.ts
  features?: string[]; // from additional.ts Game augmentation
}

// Updated GameLaunchOptions from additional.ts (ensure it's consistent)
export interface GameLaunchOptions {
  providerId?: string; // Added from additional.ts
  mode: 'real' | 'demo';
  playerId?: string;
  language?: string;
  currency?: string;
  platform?: "web" | "mobile";
  returnUrl?: string;
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
  
  loading: boolean; // Alias for isLoading
  totalGames?: number;
  newGames?: Game[]; // Games marked as new
  // Admin functions
  addGame?: (gameData: Partial<DbGame>) => Promise<DbGame | null>; 
  updateGame?: (gameId: string, gameData: Partial<DbGame>) => Promise<DbGame | null>; 
  deleteGame?: (gameId: string) => Promise<boolean>; 
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

export interface DbWallet { 
  id: string;
  user_id: string; 
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
  data?: DbWallet | null; // Changed: For single wallet fetches, data should be DbWallet or null.
                          // If a list is possible, a different type or handling is needed.
                          // For now, assuming single fetches like getWalletByUserId.
  error?: string | null;
  message?: string;
}

// Updated WalletTransaction interface
export interface WalletTransaction {
  id: string;
  userId: string; 
  type: 'deposit' | 'withdraw' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund' | string; // Allow for other types
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'cancelled' | string; // Allow for other types
  date: string; 
  gameId?: string; // from additional.ts & original
  gameName?: string; // from additional.ts
  provider?: string; // from additional.ts & original
  description?: string; 
  balance_before?: number; // from additional.ts
  balance_after?: number; // from additional.ts
  round_id?: string; // from additional.ts
  session_id?: string; // from additional.ts
}

// Corrected AuthContextType
export interface AuthContextType {
  user: AuthUser | null;
  session: import('@supabase/supabase-js').Session | null; // Add session
  loading: boolean;
  error: Error | null;
  login: (email: string, password: string) => Promise<AuthUser | null>;
  register: (email: string, password: string, username?: string) => Promise<AuthUser | null>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>;
  refreshWalletBalance: () => Promise<number | null>;
  isAuthenticated: boolean;
  fetchUserProfile: (userId: string) => Promise<Partial<User> | null>; // Ensure this matches AuthContext
  deposit?: (amount: number, currency: string, paymentMethod: string) => Promise<boolean>; // For CardDeposit
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

// Updated DbGame interface
export interface DbGame {
  id: string;
  title: string; // Changed from game_name to align with Game type and usage
  provider_slug: string;
  category_slugs: string[] | string | null; // Made flexible to handle DB variations
  image_url?: string;
  cover?: string;
  description?: string;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  is_popular?: boolean;
  is_new?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  external_game_id?: string; // Keep if used
  game_id?: string; // Provider's game ID
  game_code?: string; // Specific code for launching or reference
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
  launch_url?: string; // Added from GameForm
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

// Updated Affiliate interface
export interface Affiliate {
  id: string;
  userId: string; // Assuming this links to your User model
  code: string;
  commissionRate: number; // e.g., 0.1 for 10%
  clicks: number;
  registrations: number;
  depositingUsers: number; // Count of users who made a first deposit
  commission: number; // Total commission earned (calculated field)
  commission_paid?: number; // Total commission paid out
  createdAt: string;
  updatedAt?: string;
  name?: string; // Added to fix Affiliates.tsx
  email?: string; // Added to fix Affiliates.tsx
  status?: 'active' | 'pending' | 'rejected' | 'suspended'; // Added 'suspended'
  totalCommissions?: number; // Added to fix Affiliates.tsx
}

// Updated Promotion interface
export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string; // Use imageUrl consistently
  promotionType: 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament' | 'other'; // Renamed from 'type'
  category: string; // For UI categorization and filtering
  bonusPercentage?: number; // For deposit_bonus
  maxBonusAmount?: number; // For deposit_bonus
  freeSpinsCount?: number; // For free_spins
  cashbackPercentage?: number; // For cashback
  wageringRequirement?: number; // e.g., 30 for 30x
  minDeposit?: number;
  games?: string[]; // Array of game IDs or slugs applicable for the promotion
  startDate: string; // ISO Date string
  endDate: string; // ISO Date string
  termsAndConditionsUrl?: string;
  status: 'active' | 'inactive' | 'expired' | 'upcoming'; // More descriptive status
  isActive: boolean; // derived from status and dates, or manually set
  promoCode?: string;
  usageLimit?: number; // How many times a promotion can be claimed in total
  usageLimitPerUser?: number; // How many times one user can claim
  terms?: string; // Added as it's used in Promotions.tsx mock data
}

export interface VipLevel {
  level: number;
  name: string;
  pointsRequired: number;
  benefits: string[]; // Array of benefit descriptions
  cashbackPercentage?: number;
  monthlyBonus?: number;
  dedicatedManager?: boolean;
  exclusiveTournaments?: boolean;
  // Add other specific benefits
}

export interface UserProfileData {
  id: string;
  username?: string; // Made optional as per User type
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  country?: string;
  city?: string;
  address?: string;
  phone?: string;
  birthDate?: string; // Should be string to match form input, convert to Date for processing
  kycStatus?: 'pending' | 'verified' | 'rejected' | 'not_submitted';
  // any other fields from User or Profile you need on the profile page
}

// GameSession type from gameAggregatorDbService errors
export interface GameSession {
  id: string; // Or number, depending on DB
  user_id: string; // Ensure this matches the type of user ID
  game_id: string; // Or number
  started_at: string; // ISO date string
  ended_at?: string; // ISO date string
  bet_count?: number;
  total_bet_amount?: number;
  total_win_amount?: number;
  // Add other relevant session fields
}

// Added KYC Types
export type KycStatus = 'not_submitted' | 'pending' | 'verified' | 'rejected' | 'resubmit_required';

export interface KycDocument {
  id: string;
  userId: string;
  documentType: 'id_card' | 'passport' | 'driver_license' | 'utility_bill' | 'bank_statement';
  documentFrontUrl?: string;
  documentBackUrl?: string; // For ID cards, driver licenses
  selfieUrl?: string;
  status: KycStatus;
  rejectionReason?: string;
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string; // Admin user ID
}

// Updated KycRequest to align with KycManagement.tsx mock data
export interface KycRequest {
  id: string;
  userId: string;
  userName: string; // Added from mock
  email?: string; // Added from mock
  documentType: string; // Added from mock, simplified to string for now
  documentNumber?: string; // Added from mock
  submissionDate: string; // Added from mock (use this or submittedDate)
  submittedDate?: string; // Kept if used distinctly, alias for submissionDate
  status: KycStatus;
  verificationDate?: string; // Added from mock
  documentImage?: string; // Added from mock
  documentFiles?: string[]; // Added from mock
  documentUrls?: string[]; // Added from mock
  rejectionReason?: string; // Added from mock
  // Original fields if still needed, though 'documents' array might be redundant with flat structure
  documents?: KycDocument[]; // This might be for a more detailed view not used by the main table
  notes?: string;
  createdAt?: string; // If different from submissionDate
  updatedAt?: string;
}

// Single User interface definition
export interface User {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  name?: string; // Ensured 'name' is here
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
  kycStatus?: KycStatus; 
  twoFactorEnabled?: boolean;
  emailVerified?: boolean; 
  preferences?: UserPreferences;
  referralCode?: string;
  referredBy?: string;
}
// Removed duplicate User interface declaration that was at the end of the file.
