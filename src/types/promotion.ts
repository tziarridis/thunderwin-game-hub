
// src/types/promotion.ts

export enum PromotionType {
  DEPOSIT_BONUS = 'DEPOSIT_BONUS',
  FREE_SPINS = 'FREE_SPINS',
  CASHBACK = 'CASHBACK',
  TOURNAMENT = 'TOURNAMENT',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
}

export enum PromotionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  UPCOMING = 'UPCOMING',
  DRAFT = 'DRAFT',
}

export interface Promotion {
  id?: string;
  title: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;
  bonus_amount?: number | string;
  currency?: string;
  wagering_requirement?: number;
  terms?: string;
  valid_from?: string;
  valid_until?: string;
  max_bonus_amount?: number;
  min_deposit?: number;
  applicable_games?: string[];
  promo_code?: string;
  image_url?: string;
  banner_url?: string;
  featured?: boolean;
  priority?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionFormValues {
  title: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;
  bonus_amount?: number | string;
  currency?: string;
  wagering_requirement?: number;
  terms?: string;
  valid_from?: string;
  valid_until?: string;
  max_bonus_amount?: number;
  min_deposit?: number;
  applicable_games?: string[];
  promo_code?: string;
  image_url?: string;
  banner_url?: string;
  featured?: boolean;
  priority?: number;
}

export interface PromotionFilter {
  status?: PromotionStatus;
  type?: PromotionType;
  featured?: boolean;
  active_only?: boolean;
}
