// This file might have been named promotion.d.ts previously. Ensuring content matches.
export interface Promotion {
  id: string;
  title: string;
  description: string; // Made non-optional as per usage, or handle optionality in components
  type: 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament_prize' | 'welcome_bonus' | 'reload_bonus' | 'loyalty_reward' | 'deposit_match' | 'tournament' | 'no_deposit_bonus' | string;
  promotionType?: Promotion['type']; // For consistency if used in forms, maps to 'type'

  value?: number; // General value, e.g. cashback amount, prize pool
  bonusPercentage?: number; // For deposit match/bonus
  freeSpinsCount?: number; // For free spins

  currency?: string; // e.g., 'USD', 'EUR'
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
  
  validFrom: string | Date; 
  validUntil: string | Date | null; 
  
  games?: string[]; // Slugs or IDs of eligible games (ensure it's string[])
  code?: string; // Promo code to claim
  
  isActive?: boolean; // Should be derived or set based on 'status' and dates
  status: 'active' | 'inactive' | 'expired' | 'upcoming' | 'draft' | string; // More comprehensive status
  
  usageLimitPerUser?: number; 
  category: string; 
  
  termsAndConditions?: string;
  imageUrl?: string;
  targetAudience?: 'new_users' | 'existing_users' | 'vip_only' | 'all' | string;
  claimInstructions?: string;
  maxRedemptions?: number; 
  tags?: string[];

  // Fields from mock data that were mapped/clarified
  ctaText?: string; // Call to action text for buttons (camelCase)
  
  // Eligibility and bonus_details should ideally be flattened or consistently accessed
  // For simplicity in components, often these are flattened or directly part of the Promotion type
  // If they must remain nested, components need to access them as e.g. promotion.eligibility.min_deposit
  // Adding them as optional top-level fields for now if direct access is common:
  eligibilityType?: string; // Corresponds to targetAudience or eligibility.type
  eligibilityMinDeposit?: number; // Corresponds to eligibility.min_deposit
  eligibilityMinVipLevel?: string | number; // Corresponds to eligibility.min_vip_level
  
  bonusDetailsPercentage?: number; // Corresponds to bonus_details.percentage (use bonusPercentage)
  bonusDetailsMaxAmount?: number; // Corresponds to bonus_details.max_amount (use maxBonusAmount)
  bonusDetailsCurrency?: string; // Corresponds to bonus_details.currency (use currency)
  bonusDetailsFreeSpinsCount?: number; // Corresponds to bonus_details.free_spins_count (use freeSpinsCount)
  bonusDetailsGameSlug?: string; // Corresponds to bonus_details.game_slug
  bonusDetailsPrizePool?: number; // Corresponds to bonus_details.prize_pool (use value for tournaments)

  // Keep link for PromotionCard if it's a valid field, otherwise remove its usage
  link?: string; // If promotions can have direct navigation links

  // Legacy or alternative names (should be mapped during data fetching/normalization)
  // startDate?: string | Date; // Use validFrom
  // endDate?: string | Date | null; // Use validUntil
  // image_url?: string; // Use imageUrl
  // start_date?: string | Date; // Use validFrom
  // end_date?: string | Date | null; // Use validUntil
  // terms_and_conditions?: string; // Use termsAndConditions
  // terms?: string; // Use termsAndConditions
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
