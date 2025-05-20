export type PromotionType = 
  | 'deposit_bonus' 
  | 'free_spins' 
  | 'cashback' 
  | 'tournament_prize' 
  | 'welcome_bonus' 
  | 'reload_bonus' 
  | 'loyalty_reward' 
  | 'no_deposit_bonus'
  | 'sports_bet_bonus'
  | 'other';

export const PROMOTION_TYPE_ARRAY: PromotionType[] = [
  'deposit_bonus', 'free_spins', 'cashback', 'tournament_prize', 'welcome_bonus',
  'reload_bonus', 'loyalty_reward', 'no_deposit_bonus', 'sports_bet_bonus', 'other'
];

export type PromotionStatus = 'active' | 'inactive' | 'expired' | 'upcoming' | 'draft' | 'archived';
export const PROMOTION_STATUS_ARRAY: PromotionStatus[] = ['active', 'inactive', 'expired', 'upcoming', 'draft', 'archived'];

export type PromotionTargetAudience = 'new_users' | 'existing_users' | 'vip_only' | 'all' | string;

export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: PromotionType; // Use the defined type
  
  value?: number; 
  bonusPercentage?: number; 
  freeSpinsCount?: number; 
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
  currency?: string; 
  
  validFrom: string | Date; 
  validUntil: string | Date | null; 
  
  games?: string[]; 
  code?: string; 
  
  status: PromotionStatus; // Use the defined type
  
  usageLimitPerUser?: number; 
  category: string; 
  
  termsAndConditions?: string;
  imageUrl?: string;
  targetAudience?: PromotionTargetAudience;
  claimInstructions?: string;
  maxRedemptions?: number; 
  tags?: string[];

  ctaText?: string;
  link?: string;

  // Denormalized or simplified fields for easier use
  eligibilityMinVipLevel?: string | number;

  // For admin forms, if type is selected, these become more specific
  // These are optional and should be handled based on the `type`
  bonusDetailsGameSlug?: string; 
  bonusDetailsPrizePool?: number; 

  created_at?: string | Date;
  updated_at?: string | Date;
}

export interface PromotionFilter {
  isActive?: boolean;
  type?: Promotion['type'];
  category?: string; // Promotion['category']
  date?: Date; // To find promotions active on a specific date
}

export interface ClaimPromotionResponse {
  success: boolean;
  message?: string;
  error?: string;
  claimedPromotion?: Promotion; // Or just relevant details
  newBalance?: number; // If applicable
}
