
// src/types/promotion.ts
export type PromotionType = 'deposit_bonus' | 'free_spins' | 'cashback_offer' | 'tournament' | 'special_event' | 'welcome_offer' | 'reload_bonus';
export type PromotionStatus = 'active' | 'inactive' | 'upcoming' | 'expired' | 'draft';
export type PromotionAudience = 'all' | 'new_users' | 'vip_only' | 'segmented';

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  image_url?: string; // Changed from imageUrl
  valid_from: string; // ISO date string
  valid_until: string; // ISO date string
  created_at: string;
  updated_at: string;

  // Specific fields based on type
  value?: number; // e.g. cashback percentage or fixed bonus amount
  bonus_percentage?: number; // For deposit bonuses
  free_spins_count?: number;
  min_deposit?: number;
  max_bonus_amount?: number;
  wagering_requirement?: number;
  games?: string[]; // Applicable game IDs or slugs
  
  code?: string; // Promo code
  cta_text?: string; // Call to action button text
  terms_and_conditions_url?: string; // Changed from termsAndConditions
  target_audience?: PromotionAudience; // Changed from targetAudience
  category?: string; // e.g. "Slots", "Live Casino"
  is_active: boolean; // Added for consistency
}

// Make sure this file is re-exported in src/types/index.d.ts
// e.g. export * from './promotion';
