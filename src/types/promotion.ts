
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

export enum PromotionAudience {
  ALL_PLAYERS = 'ALL_PLAYERS',
  NEW_PLAYERS = 'NEW_PLAYERS',
  EXISTING_PLAYERS = 'EXISTING_PLAYERS',
  VIP_PLAYERS = 'VIP_PLAYERS',
  INACTIVE_PLAYERS = 'INACTIVE_PLAYERS',
}

export interface Promotion {
  id?: string;
  title: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;
  is_active?: boolean;
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
  // Additional fields needed by components
  value?: number;
  bonus_percentage?: number;
  free_spins_count?: number;
  code?: string;
  cta_text?: string;
  terms_and_conditions_url?: string;
  target_audience?: PromotionAudience;
}

export interface PromotionFormValues {
  title: string;
  description?: string;
  type: PromotionType;
  status: PromotionStatus;
  is_active?: boolean;
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
  // Additional fields
  value?: number;
  bonus_percentage?: number;
  free_spins_count?: number;
  code?: string;
  cta_text?: string;
  terms_and_conditions_url?: string;
  target_audience?: PromotionAudience;
}

export interface PromotionFilter {
  status?: PromotionStatus;
  type?: PromotionType;
  featured?: boolean;
  active_only?: boolean;
}

export interface ClaimPromotionResponse {
  success: boolean;
  message?: string;
  error?: string;
}
