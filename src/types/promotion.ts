
export enum PromotionType {
  DEPOSIT_BONUS = 'deposit_bonus',
  FREE_SPINS = 'free_spins',
  CASHBACK_OFFER = 'cashback_offer',
  TOURNAMENT = 'tournament',
  NO_DEPOSIT_BONUS = 'no_deposit_bonus',
  RELOAD_BONUS = 'reload_bonus',
  VIP_BONUS = 'vip_bonus'
}

export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired',
  PENDING = 'pending'
}

export enum PromotionAudience {
  ALL_USERS = 'all_users',
  NEW_USERS = 'new_users',
  VIP_USERS = 'vip_users',
  HIGH_ROLLERS = 'high_rollers'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  image_url: string;
  start_date: string;
  end_date: string;
  valid_from: string;
  valid_until: string;
  type: PromotionType;
  status: PromotionStatus;
  created_at: string;
  updated_at: string;
  terms_conditions?: string;
  bonus_amount?: number;
  bonus_percent?: number;
  bonus_percentage?: number;
  min_deposit?: number;
  wagering_requirement?: number;
  max_bonus?: number;
  max_bonus_amount?: number;
  game_restrictions?: string[];
  user_groups?: string[];
  code?: string;
  cta_text?: string;
  value?: number;
  free_spins_count?: number;
  is_active?: boolean;
  target_audience?: PromotionAudience;
  terms_and_conditions_url?: string;
  category?: string;
}

export interface PromotionResponse {
  data: Promotion[];
  count: number;
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
