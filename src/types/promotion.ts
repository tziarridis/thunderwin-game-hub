
// This file might have been named promotion.d.ts previously. Ensuring content matches.
export interface Promotion {
  id: string;
  title: string;
  description: string;
  type: 'deposit_bonus' | 'free_spins' | 'cashback' | 'tournament_prize' | 'welcome_bonus' | 'reload_bonus' | 'loyalty_reward' | 'deposit_match' | 'tournament' | 'no_deposit_bonus' | string; // Allow string for flexibility
  promotionType?: string; 
  
  value?: number; 
  bonusPercentage?: number; 
  freeSpinsCount?: number;

  currency?: string; 
  wageringRequirement?: number;
  minDeposit?: number;
  maxBonusAmount?: number;
  
  validFrom: string | Date; // Matched to mock data (start_date) via startDate
  validUntil: string | Date | null; // Matched to mock data (end_date) via endDate, allow null
  
  games?: string[]; 
  code?: string; 
  
  isActive: boolean; // This should be derived or set based on 'status' or fetched data
  status?: 'active' | 'inactive' | 'expired' | 'upcoming' | string; 
  
  usageLimitPerUser?: number; 
  category?: string; 
  
  termsAndConditions?: string; // Matched to mock data (terms_and_conditions)
  imageUrl?: string; // Matched to mock data (image_url)
  targetAudience?: 'new_users' | 'existing_users' | 'vip_only' | 'all' | string; // 'eligibility.type'
  claimInstructions?: string;
  maxRedemptions?: number; 
  tags?: string[];

  // Additional fields for compatibility
  link?: string;
  startDate?: string | Date; // Corresponds to mock's start_date
  endDate?: string | Date | null; // Corresponds to mock's end_date, allow null
  image_url?: string; // Legacy field
  start_date?: string | Date; // Legacy field
  end_date?: string | Date | null; // Legacy field
  terms_and_conditions?: string; // Legacy field
  terms?: string; // Alternative field name

  // Fields from mock data that were not directly in Promotion type
  cta_text?: string; // From mock
  eligibility?: { 
    type: string;
    min_deposit?: number;
    min_vip_level?: string;
    [key: string]: any; 
  }; // From mock
  bonus_details?: { 
    percentage?: number;
    max_amount?: number;
    currency?: string;
    free_spins_count?: number;
    game_slug?: string;
    prize_pool?: number;
    [key: string]: any; 
  }; // From mock
}

export interface PromotionFilter {
  isActive?: boolean;
  type?: string;
  category?: string;
  date?: Date; // To find promotions active on a specific date
}

export interface ClaimPromotionResponse {
  success: boolean;
  message?: string;
  error?: string;
  claimedPromotion?: Promotion; // Or just relevant details
  newBalance?: number; // If applicable
}
