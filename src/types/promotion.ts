
export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  DRAFT = 'draft',
  PENDING = 'pending'
}

export enum PromotionType {
  DEPOSIT_BONUS = 'deposit_bonus',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback_offer',
  TOURNAMENT = 'tournament',
  SPECIAL_EVENT = 'special_event'
}

export enum PromotionAudience {
  ALL_USERS = 'all_users',
  NEW_USERS = 'new_users',
  VIP_USERS = 'vip_users',
  INACTIVE_USERS = 'inactive_users'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  status: PromotionStatus;
  type: PromotionType;
  value: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
  valid_from: string;
  valid_until: string;
  terms_conditions?: string;
  image_url?: string;
  banner_url?: string;
  created_at: string;
  updated_at: string;
  is_featured?: boolean;
  target_audience?: PromotionAudience;
  promo_code?: string;
  usage_limit?: number;
  used_count?: number;
  is_active?: boolean;
  code?: string;
  bonus_percentage?: number;
  free_spins_count?: number;
  max_bonus_amount?: number;
  cta_text?: string;
  terms_and_conditions_url?: string;
  category?: string;
  start_date?: string;
  end_date?: string;
}

export interface PromotionFormValues {
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  valid_from: string;
  valid_until: string;
  is_active: boolean;
  image_url?: string;
  value?: number;
  bonus_percentage?: number;
  free_spins_count?: number;
  min_deposit?: number;
  max_bonus_amount?: number;
  wagering_requirement?: number;
  code?: string;
  cta_text?: string;
  terms_and_conditions_url?: string;
  target_audience?: PromotionAudience;
  category?: string;
}
