
// This file might have been named promotion.d.ts previously. Ensuring content matches.
export interface Promotion {
  id: string;
  title: string;
  description: string;
  // 'type' was the original field, 'promotionType' appears in errors from read-only components.
  // Including both for now, or decide which one is canonical. Let's use 'type' as primary.
  type: 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament_prize' | 'welcome_bonus' | 'reload_bonus' | 'loyalty_reward' | string; // Allow string for flexibility if new types come from API
  promotionType?: string; // Add field from error if it's distinct or used by components
  
  value?: number; // e.g., bonus percentage or number of spins
  bonusPercentage?: number; // Added from error
  freeSpinsCount?: number; // Added from error

  currency?: string; // For monetary values
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
  
  validFrom: string | Date;
  validUntil: string | Date;
  
  games?: string[]; // Applicable games (IDs or slugs)
  code?: string; // Promo code
  
  isActive: boolean;
  status?: 'active' | 'inactive' | 'expired' | 'upcoming' | string; // Added from error, allow string
  
  usageLimitPerUser?: number; // Added from error
  category?: string; // Added from error, e.g., 'sports', 'casino', 'live-casino'
  
  // Optional: For more complex promotions
  termsAndConditions?: string;
  imageUrl?: string;
  targetAudience?: 'new_users' | 'existing_users' | 'vip_only' | 'all';
  claimInstructions?: string;
  maxRedemptions?: number; // Total times the promotion can be redeemed
  tags?: string[];
}

export interface PromotionFilter {
  isActive?: boolean;
  type?: string;
  category?: string;
  date?: Date; // To find promotions active on a specific date
}

export interface ClaimPromotionResponse {
  success: boolean;
  message: string;
  claimedPromotion?: Promotion; // Or just relevant details
  newBalance?: number; // If applicable
}
