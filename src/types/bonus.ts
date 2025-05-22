
// src/types/bonus.ts
export type BonusType = 'deposit' | 'no_deposit' | 'free_spins' | 'cashback' | 'tournament_prize' | 'vip_reward';
export type BonusStatus = 'active' | 'inactive' | 'expired' | 'used' | 'pending_activation';

export interface Bonus {
  id: string;
  name: string;
  description: string;
  type: BonusType;
  status: BonusStatus;
  amount?: number; // For fixed amount bonuses
  percentage?: number; // For percentage-based bonuses (e.g., deposit match)
  max_bonus_amount?: number; // Max amount for percentage bonuses
  free_spins_count?: number; // For free spins bonuses
  wagering_requirement?: number; // e.g., 30 for 30x wagering
  valid_from?: string; // ISO date string
  valid_until?: string; // ISO date string
  game_ids?: string[]; // Specific games the bonus applies to
  vip_level_required?: string | number; // Link to VIP level if applicable
  code?: string; // Bonus code if required for activation
  terms_and_conditions_url?: string;
  created_at: string;
  updated_at: string;
}

// Make sure this file is re-exported in src/types/index.d.ts
// e.g. export * from './bonus';
