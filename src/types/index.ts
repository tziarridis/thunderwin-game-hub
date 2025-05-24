
// Core User Types
export interface AppUser {
  id: string;
  email: string;
  username?: string;
  role: UserRole;
  status: string;
  created_at: string;
  updated_at: string;
  balance?: number;
  currency?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  avatar_url?: string;
  is_active?: boolean;
  last_sign_in_at?: string;
  vip_level_id?: string;
  vipLevel?: number;
  vipPoints?: number;
  user_metadata?: {
    username?: string;
    full_name?: string;
    avatar_url?: string;
    kyc_status?: string;
    currency?: string;
    language?: string;
    vip_level?: number;
    name?: string;
    bonus_points?: number;
  };
  wallet?: {
    balance: number;
    currency: string;
    symbol: string;
  };
}

export interface User extends AppUser {}

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator'
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  balance?: number;
  isAdmin?: boolean;
  avatarUrl?: string;
  vipLevel?: number;
  isVerified?: boolean;
}

// Date Range Type
export interface DateRange {
  from?: Date;
  to?: Date;
}

// Data Table Types
export interface DataTableColumn<T> {
  accessorKey?: string;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

// VIP Progress Props
export interface VipProgressProps {
  currentLevel: number;
  currentPoints: number;
  pointsToNextLevel: number;
}

// Game Properties Props
export interface GamePropertiesProps {
  game: Game;
  provider?: string;
  category?: string;
}

// Related Games Props
export interface RelatedGamesProps {
  gameId: string;
  categoryId?: string;
  providerId?: string;
  tags?: (string | GameTag)[];
}

// Re-export all types from individual files
export * from './promotion';
export * from './game';
export * from './affiliate';
export * from './transaction';
export * from './kyc';
export * from './wallet';
export * from './vip';
export * from './bonus';

// Export commonly needed types
export type { Bonus, BonusType, BonusStatus, UserBonus } from './bonus';
export type { PromotionType, PromotionFormValues, PromotionAudience } from './promotion';
export type { AffiliateUser, AffiliateCommissionTier, AffiliateStatSummary } from './affiliate';
