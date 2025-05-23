
// src/types/promotion.ts

// Using string enums for easier iteration and use in forms/validation
export enum PromotionType {
  DEPOSIT_BONUS = 'deposit_bonus',
  FREE_SPINS = 'free_spins',
  CASHBACK_OFFER = 'cashback_offer',
  TOURNAMENT = 'tournament',
  SPECIAL_EVENT = 'special_event',
  WELCOME_OFFER = 'welcome_offer',
  RELOAD_BONUS = 'reload_bonus',
}

export enum PromotionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  UPCOMING = 'upcoming',
  EXPIRED = 'expired',
  DRAFT = 'draft',
}

export enum PromotionAudience {
  ALL = 'all',
  NEW_USERS = 'new_users',
  VIP_ONLY = 'vip_only',
  SEGMENTED = 'segmented',
}


export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType;
  status: PromotionStatus;
  image_url?: string;
  valid_from: string; // ISO date string
  valid_until: string; // ISO date string
  created_at: string;
  updated_at: string;

  value?: number; 
  bonus_percentage?: number;
  free_spins_count?: number;
  min_deposit?: number;
  max_bonus_amount?: number;
  wagering_requirement?: number;
  games?: string[]; 
  
  code?: string; 
  cta_text?: string; 
  terms_and_conditions_url?: string;
  target_audience?: PromotionAudience;
  category?: string; 
  is_active: boolean;
}

// Ensure this file is re-exported in src/types/index.d.ts
// e.g. export * from './promotion';
// And also in src/types/index.ts
// e.g. export * from './promotion'; (which will make enums available at runtime)
