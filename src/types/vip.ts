
export interface VIPLevel {
  id: string;
  name: string;
  required_points: number;
  benefits: { description: string }[];
  created_at: string;
  updated_at: string;
}

export interface UserBonus {
  id: string;
  user_id: string;
  bonus_id: string;
  amount: number;
  status: 'active' | 'used' | 'expired';
  created_at: string;
  updated_at: string;
}

export interface Bonus {
  id: string;
  name: string;
  type: BonusType;
  amount: number;
  currency: string;
  status: BonusStatus;
  terms: string;
  created_at: string;
  updated_at: string;
}

export enum BonusType {
  DEPOSIT_MATCH = 'deposit_match',
  FREE_SPINS = 'free_spins',
  CASHBACK = 'cashback',
  WELCOME = 'welcome'
}

export enum BonusStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  EXPIRED = 'expired'
}
