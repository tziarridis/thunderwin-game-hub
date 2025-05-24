
import { BonusType, BonusStatus, PromotionType, PromotionStatus, TransactionStatus } from './enums';

// Extended interfaces with missing properties
export interface ExtendedGame {
  id: string;
  name: string;
  title: string;
  provider: string;
  category: string;
  image: string;
  rtp: number;
  volatility: string;
  minBet: number;
  maxBet: number;
  features: string[];
  tags: string[];
  isFavorite?: boolean;
  url?: string;
  description?: string;
  isPopular?: boolean;
  isNew?: boolean;
  jackpot?: boolean;
  releaseDate?: string;
  // Additional properties
  external_url?: string;
  is_mobile_compatible?: boolean;
  slug?: string;
}

export interface ExtendedGameProvider {
  id: string | number;
  name: string;
  logo?: string;
  logoUrl?: string;
  description?: string;
  status?: string;
  gamesCount?: number;
  isPopular?: boolean;
  featured?: boolean;
  updated_at?: string;
}

export interface ExtendedTransaction {
  id: string;
  userId: string;
  player_id?: string;
  type: string;
  amount: number;
  currency: string;
  status: string;
  date: string;
  description?: string;
  referenceId?: string;
  paymentMethod?: string;
  balance?: number;
  gameId?: string;
  game_id?: string;
  bonusId?: string;
  round_id?: string;
  provider_transaction_id?: string;
}

export interface ExtendedUserBonus {
  id: string;
  userId: string;
  bonusId: string;
  type: BonusType;
  amount: number;
  status: BonusStatus;
  dateIssued: string;
  expiryDate: string;
  wageringRequirement: number;
  wageringCompleted: number;
  bonus_details?: any;
}

export interface ExtendedPromotion {
  id: string;
  title: string;
  description: string;
  image: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  terms: string;
  bonusAmount?: number;
  bonusType?: string;
  targetAudience?: string[];
  code?: string;
  minDeposit?: number;
  wageringRequirement?: number;
  promotionType?: string;
  category?: string;
  // Additional properties
  type: PromotionType;
  status: PromotionStatus;
  start_date: string;
  end_date: string;
  valid_from: string;
  valid_until: string;
  value: number;
  created_at: string;
  updated_at: string;
}

export interface ExtendedKycRequest {
  id: string;
  userId: string;
  userName: string;
  documentType: string;
  documentNumber: string;
  submissionDate: string;
  status: string;
  verificationDate?: string;
  rejectionReason?: string;
  documentUrls: string[];
  email?: string;
  submittedDate?: string;
  documentImage?: string;
  documentFiles?: string[];
  documents?: any[];
}

export interface ExtendedAffiliateUser {
  id: string;
  userId?: string;
  user_id?: string;
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
  status: string;
  joined: string;
  referralCode: string;
}

export interface GameCategory {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  image?: string;
  status: string;
  show_home?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface GameTag {
  id: string;
  name: string;
  slug: string;
}
