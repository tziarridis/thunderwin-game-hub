
export enum PromotionType {
  DEPOSIT_BONUS = "deposit_bonus",
  FREE_SPINS = "free_spins",
  CASHBACK_OFFER = "cashback_offer",
  TOURNAMENT = "tournament",
  NO_DEPOSIT_BONUS = "no_deposit_bonus",
  RELOAD_BONUS = "reload_bonus",
  VIP_BONUS = "vip_bonus"
}

export enum PromotionStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  EXPIRED = "expired",
  PENDING = "pending"
}

export enum PromotionAudience {
  ALL = "all",
  NEW_USERS = "new_users",
  EXISTING_USERS = "existing_users",
  VIP = "vip"
}

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  status: 'active' | 'inactive' | 'expired' | 'pending';
  valid_from: string;
  valid_until: string;
  cta_text: string;
  image_url?: string;
  code?: string;
  min_deposit?: number;
  bonus_percentage?: number;
  max_bonus_amount?: number;
  free_spins_count?: number;
  wagering_requirement?: number;
  value?: number;
  terms_and_conditions_url?: string;
  created_at?: string;
  updated_at?: string;
  target_audience?: string;
}

export interface PromotionFormValues extends Omit<Promotion, 'id' | 'created_at' | 'updated_at'> {
  id?: string;
}
