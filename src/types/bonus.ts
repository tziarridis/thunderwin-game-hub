
export enum BonusType {
  WELCOME = 'welcome',
  DEPOSIT_MATCH = 'deposit_match',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  RELOAD = 'reload',
  VIP = 'vip',
  NO_DEPOSIT = 'no_deposit'
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
  currency: string;
  status: BonusStatus;
  claimed_at?: string;
  expires_at: string;
  wagering_requirement: number;
  wagering_remaining: number;
  created_at: string;
  updated_at: string;
  progress?: number;
}
