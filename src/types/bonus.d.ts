
export type BonusType = 'free_spins' | 'deposit' | 'cashback' | 'tournament_prize' | 'other';
export type BonusStatus = 'active' | 'inactive' | 'expired' | 'claimed' | 'used';

export interface Bonus {
  id: string | number;
  name: string;
  description?: string;
  type: BonusType;
  status: BonusStatus;
  amount?: number | null; // For cash bonuses
  percentage?: number | null; // For deposit match
  free_spins_count?: number | null;
  game_ids?: string[] | null; // Applicable games for free spins or bonus play
  wagering_requirement?: number | null;
  max_bonus_amount?: number | null; // Max amount for percentage bonuses
  min_deposit_amount?: number | null;
  valid_from?: string | null;
  valid_until?: string | null;
  vip_level_required?: string | number | null; // Link to VipLevel id
  code?: string | null; // Bonus code if applicable
  terms_and_conditions_url?: string | null;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
  // Deprecated fields from error or potential new fields
  target_audience?: string; // from error: targetAudience
  category?: string; // from error: category
  ctaText?: string; // from error: ctaText
}
