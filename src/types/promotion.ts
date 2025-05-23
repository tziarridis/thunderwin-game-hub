
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
  DRAFT = 'draft'
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  start_date: string;
  end_date: string;
  terms_and_conditions?: string;
  image_url?: string;
  bonus_amount?: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
  created_at: string;
  updated_at: string;
}

export interface PromotionFormValues {
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  terms_and_conditions?: string;
  image_url?: string;
  bonus_amount?: number;
  currency?: string;
  min_deposit?: number;
  max_bonus?: number;
  wagering_requirement?: number;
}
