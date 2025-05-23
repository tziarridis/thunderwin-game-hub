
// src/types/bonus.ts

export enum BonusType {
  DEPOSIT_MATCH = 'DEPOSIT_MATCH',
  FREE_SPINS = 'FREE_SPINS',
  CASHBACK = 'CASHBACK',
  NO_DEPOSIT = 'NO_DEPOSIT',
  LOYALTY_REWARD = 'LOYALTY_REWARD',
}

export enum BonusStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  EXPIRED = 'EXPIRED',
  UPCOMING = 'UPCOMING',
  DRAFT = 'DRAFT',
}

export interface Bonus {
  id?: string; // Optional for creation
  name: string;
  type: BonusType;
  status: BonusStatus;
  amount?: number | string; // Can be fixed amount or percentage string e.g., "50%"
  currency?: string; // e.g., USD, EUR
  wagering_requirement?: number; // e.g., 35 for 35x
  description?: string;
  terms?: string;
  valid_from?: string; // ISO date string
  valid_until?: string; // ISO date string
  max_bonus_amount?: number;
  min_deposit?: number;
  applicable_games?: string[]; // Array of game IDs or slugs
  promo_code?: string;
  created_at?: string;
  updated_at?: string;
}
