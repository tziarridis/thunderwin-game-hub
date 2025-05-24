
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
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  is_active?: boolean;
  last_sign_in_at?: string;
  vip_level_id?: string;
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

// Transaction Type
export interface Transaction {
  id: string;
  user_id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  description?: string;
}

// Bonus Types
export enum BonusType {
  DEPOSIT_MATCH = 'deposit_match',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  NO_DEPOSIT = 'no_deposit',
  RELOAD = 'reload'
}

export enum BonusStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  CLAIMED = 'claimed',
  PENDING = 'pending'
}

export interface Bonus {
  id: string;
  user_id: string;
  name: string;
  type: BonusType;
  amount: number;
  currency: string;
  status: BonusStatus;
  terms: string;
  wagering_requirement: number;
  wagering_remaining: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
}

export interface UserBonus {
  id: string;
  user_id: string;
  bonus_id: string;
  amount: number;
  status: BonusStatus;
  progress: number;
  created_at: string;
  expires_at: string;
  bonus_details?: {
    name: string;
    type: BonusType;
    terms: string;
    wagering_requirement: number;
  };
}

// VIP Types
export interface VipBenefit {
  id: string;
  name: string;
  description: string;
  icon: string;
  vip_level_id: string;
}

export interface VipLevel {
  id: string;
  name: string;
  level: number;
  required_points: number;
  points_required: number;
  cashback_rate: number;
  weekly_bonus: number;
  monthly_bonus: number;
  withdrawal_limit: number;
  benefits: VipBenefit[];
  created_at: string;
  updated_at: string;
}

// Legacy alias for VipLevel
export interface VIPLevel extends VipLevel {}

// KYC Types
export enum KycDocumentType {
  PASSPORT = 'passport',
  NATIONAL_ID = 'national_id',
  DRIVER_LICENSE = 'driver_license'
}

export enum KycStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  RESUBMIT_REQUIRED = 'resubmit_required'
}

export interface KycDocument {
  id: string;
  type: KycDocumentType;
  front_url: string;
  back_url?: string;
  status: KycStatus;
}

export interface KycRequest {
  id: string;
  user_id: string;
  document_type: KycDocumentType;
  document_front_url: string;
  document_back_url?: string;
  status: KycStatus;
  documents: KycDocument[];
  created_at: string;
  updated_at: string;
}

// Data Table Types
export interface DataTableColumn<T> {
  accessorKey: string;
  header: string;
  cell?: (props: { row: { original: T } }) => React.ReactNode;
  id?: string;
}

// Re-export all types from individual files
export * from './promotion';
export * from './game';
export * from './affiliate';
