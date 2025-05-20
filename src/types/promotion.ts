
// This file might have been named promotion.d.ts previously. Ensuring content matches.
export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament_prize' | 'welcome_bonus' | 'reload_bonus' | 'loyalty_reward' | 'deposit_match' | 'tournament' | 'no_deposit_bonus' | string; // Matched to mock data & form
  promotionType?: Promotion['type']; // For consistency if used in forms, maps to 'type'

  value?: number; // General value, e.g. cashback amount
  bonusPercentage?: number; // For deposit match/bonus
  freeSpinsCount?: number; // For free spins

  currency?: string; // e.g., 'USD', 'EUR'
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
  
  validFrom: string | Date; // Should be consistently string (ISO) or Date
  validUntil: string | Date | null; // Should be consistently string (ISO) or Date, or null for ongoing
  
  games?: string[]; // Slugs or IDs of eligible games
  code?: string; // Promo code to claim
  
  isActive: boolean; // Derived or set based on 'status' and dates
  status?: 'active' | 'inactive' | 'expired' | 'upcoming' | 'draft' | string; // More comprehensive status
  
  usageLimitPerUser?: number; 
  category: string; // UI category e.g., 'slots', 'live', 'sports', or 'deposit_bonus', 'recurring' (as per admin form)
  
  termsAndConditions?: string;
  imageUrl?: string;
  targetAudience?: 'new_users' | 'existing_users' | 'vip_only' | 'all' | string;
  claimInstructions?: string;
  maxRedemptions?: number; // Total times the promotion can be redeemed across all users
  tags?: string[];

  // Fields from mock data that were mapped/clarified
  cta_text?: string; // Call to action text for buttons
  eligibility?: { 
    type: string; // Corresponds to targetAudience or more specific rules
    min_deposit?: number;
    min_vip_level?: string; // Or number
    [key: string]: any; 
  };
  bonus_details?: { 
    percentage?: number; // Corresponds to bonusPercentage
    max_amount?: number; // Corresponds to maxBonusAmount
    currency?: string; // Corresponds to currency
    free_spins_count?: number; // Corresponds to freeSpinsCount
    game_slug?: string; // If spins are for a specific game
    prize_pool?: number; // For tournaments
    [key: string]: any; 
  };

  // Legacy or alternative names (try to consolidate to the main fields above)
  startDate?: string | Date; // Use validFrom
  endDate?: string | Date | null; // Use validUntil
  image_url?: string; // Use imageUrl
  start_date?: string | Date; // Use validFrom
  end_date?: string | Date | null; // Use validUntil
  terms_and_conditions?: string; // Use termsAndConditions
  terms?: string; // Use termsAndConditions
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
