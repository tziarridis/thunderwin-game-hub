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

export interface GameProvider {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  isActive: boolean; // Changed from status for consistency if needed
  order: number;
  games_count?: number;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  image?: string;
  order?: number;
  isActive?: boolean;
  status: "active" | "inactive";
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Game {
  id: string;
  title: string; // Use 'title' consistently instead of 'name' for games
  name?: string; // Optional alias if needed for some backend structures
  provider: string;
  provider_slug?: string;
  category?: string;
  category_slugs?: string[];
  image?: string;
  cover?: string;
  description?: string;
  tags?: string[];
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  isPopular?: boolean;
  isNew?: boolean;
  isFavorite?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  game_id?: string; // External game ID from provider/aggregator
  gameCode?: string; // Alternative external ID, often used for launching
  slug?: string; // Game's own slug for URL routing
  launch_url?: string;
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
  created_at?: string;
  updated_at?: string;
  // Fields potentially used in forms or cards
  minBet?: number;
  maxBet?: number;
  jackpot?: boolean; // For GameForm
}

export interface GameLaunchOptions {
  mode: 'real' | 'demo'; // Made required to match additional.ts potential fix
  currency?: string;
  platform?: 'web' | 'mobile';
  returnUrl?: string;
  language?: string;
  playerId?: string; // Added from additional.ts for consistency
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
  
  loading: boolean; 
  totalGames?: number;
  newGames?: Game[];
  addGame?: (gameData: Partial<Game>) => Promise<Game | null>; 
  updateGame?: (gameId: string, gameData: Partial<Game>) => Promise<Game | null>; 
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

export interface WalletTransaction {
  id: string;
  userId: string; // Corresponds to player_id in DB
  type: 'deposit' | 'withdrawal' | 'bet' | 'win' | 'bonus' | 'adjustment' | 'refund';
  amount: number;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  date: string; // created_at from DB
  gameId?: string;
  provider?: string;
  description?: string; // Made optional
  balance_before?: number;
  balance_after?: number;
  round_id?: string;
  session_id?: string;
  // referenceId?: string; // Example: payment gateway transaction ID
  // paymentMethod?: string;
  // bonusId?: string;
}

export interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null; // Keep as Error object
  login: (email: string, password: string) => Promise<AuthUser | null>; // Return AuthUser or null
  register: (email: string, password: string, username?: string) => Promise<AuthUser | null>; // Return AuthUser or null
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<boolean>;
  updateProfile: (profileData: Partial<Profile>) => Promise<Profile | null>; // Profile from types, not AuthUser for this one
  refreshWalletBalance: () => Promise<number | null>;
  isAuthenticated: boolean;
  // deposit?: (amount: number, currency: string, paymentMethod: string) => Promise<boolean>; // Example for CardDeposit
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

export interface DbGame {
  id: string;
  title: string;
  provider_slug: string;
  category_slugs: string[] | string;
  image_url?: string;
  cover?: string;
  description?: string;
  rtp?: number;
  volatility?: 'low' | 'medium' | 'high';
  is_popular?: boolean;
  is_new?: boolean;
  status?: 'active' | 'inactive' | 'maintenance';
  external_game_id?: string;
  game_id?: string;
  game_code?: string;
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

// Added missing types based on errors
export interface Affiliate {
  id: string;
  userId: string;
  code: string;
  commissionRate: number;
  clicks: number;
  registrations: number;
  depositingUsers: number;
  totalCommission: number;
  createdAt: string;
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  type: 'deposit_bonus' | 'free_spins' | 'cashback';
  bonusPercentage?: number;
  maxBonusAmount?: number;
  wageringRequirement?: number;
  games?: string[]; // Array of game IDs or slugs
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface VipLevel {
  level: number;
  name: string;
  pointsRequired: number;
  benefits: string[];
  cashbackPercentage?: number;
  monthlyBonus?: number;
}

export interface UserProfileData {
    // Define the structure for UserProfileData if it's different from User or Profile
    // For UserProfilePage.tsx
    id: string;
    username: string;
    email: string;
    // ... other fields
}
