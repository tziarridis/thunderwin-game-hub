
export type PromotionStatus = 'active' | 'inactive' | 'expired' | 'upcoming' | 'draft';
export type PromotionType = 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament' | 'other';

export interface PromotionTargetAudience {
  segment_id?: string; // If you have user segments
  countries?: string[]; // ISO country codes
  vip_levels?: number[];
  new_users_only?: boolean;
}

export interface PromotionTerms {
  wagering_requirement?: number; // e.g., 30 for 30x
  min_deposit?: number;
  max_bonus_amount?: number;
  valid_for_days?: number;
  eligible_games?: string[]; // Game IDs or slugs
  bonus_code?: string;
}

export interface Promotion {
  id: string;
  title: string;
  slug: string;
  description: string;
  short_description?: string;
  type: PromotionType;
  status: PromotionStatus;
  start_date: string; // ISO Date string
  end_date: string; // ISO Date string
  image_url?: string;
  banner_url?: string;
  terms_and_conditions_url?: string; // Link to full T&C page
  details?: PromotionTerms; // More detailed terms
  target_audience?: PromotionTargetAudience;
  created_at: string;
  updated_at: string;
  created_by?: string; // Admin user ID
  // For tracking
  impressions?: number;
  claims?: number;
}
