
export enum BonusType {
  DEPOSIT = 'deposit',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  NO_DEPOSIT = 'no_deposit',
  REFER_FRIEND = 'refer_friend',
  BIRTHDAY = 'birthday',
  CUSTOM = 'custom'
}

export enum BonusStatus {
  ACTIVE = 'active',
  PENDING = 'pending',
  COMPLETED = 'completed',
  EXPIRED = 'expired',
  CANCELED = 'canceled',
  CLAIMED = 'claimed'
}

export interface Bonus {
  id: string;
  user_id: string;
  promotion_id?: string;
  type: BonusType;
  name: string;
  description?: string;
  amount: number;
  currency: string;
  status: BonusStatus;
  wagering_requirement: number;
  wagering_remaining: number;
  expires_at: string;
  created_at: string;
  updated_at: string;
  game_restrictions?: string[];
  max_conversion?: number;
  min_odds?: number;
}

export interface BonusTemplate {
  id: string;
  name: string;
  description: string;
  type: BonusType;
  amount: number;
  currency: string;
  wagering_requirement: number;
  valid_days: number;
  min_deposit?: number;
  max_bonus?: number;
  created_at: string;
  updated_at: string;
  game_restrictions?: string[];
  max_conversion?: number;
  min_odds?: number;
  vip_level_required?: number;
}
