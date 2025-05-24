
export enum PromotionType {
  DEPOSIT_BONUS = 'deposit_bonus',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  TOURNAMENT = 'tournament',
  SPECIAL_EVENT = 'special_event'
}

export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DRAFT = 'draft',
  PENDING = 'pending'
}

export enum PromotionAudience {
  ALL = 'all',
  NEW_USERS = 'new_users',
  VIP_USERS = 'vip_users',
  EXISTING_USERS = 'existing_users'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  start_date: string;
  end_date: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  terms_and_conditions?: string;
  image_url?: string;
  bonus_amount?: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
  created_at: string;
  updated_at: string;
  code?: string;
  value?: number;
  bonus_percentage?: number;
  free_spins_count?: number;
  max_bonus_amount?: number;
  target_audience?: PromotionAudience;
  cta_text?: string;
  terms_and_conditions_url?: string;
  category?: string;
}

export interface PromotionFormValues {
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  start_date: string;
  end_date: string;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  terms_and_conditions?: string;
  image_url?: string;
  bonus_amount?: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
  code?: string;
  value?: number;
  bonus_percentage?: number;
  free_spins_count?: number;
  max_bonus_amount?: number;
  target_audience?: PromotionAudience;
  cta_text?: string;
  terms_and_conditions_url?: string;
  category?: string;
}
