export interface AffiliateStatSummary {
  totalReferrals: number;
  totalCommission: number;
  conversionRate: number;
  activePlayersReferred: number;
}

export interface Affiliate {
  id: string;
  user_id: string; // The user who IS an affiliate
  referral_code: string;
  total_referred_users: number;
  total_commission_earned: number;
  created_at: string;
  updated_at: string;
  commission_rate_cpa?: number; // Cost Per Acquisition
  commission_rate_revenue_share?: number; // Percentage of NGR
  isActive?: boolean; // Added for compatibility
  // Add other relevant affiliate details
}

export type UserStatus = 'active' | 'inactive' | 'pending' | 'banned' | 'deleted';

export interface AffiliateUser { // Represents a user referred by an affiliate
  id: string; // User ID of the referred player
  username: string;
  email?: string;
  registration_date: string;
  status: UserStatus; 
  total_deposited?: number;
  total_ngr?: number; // Net Gaming Revenue from this user
  affiliate_id: string; // ID of the affiliate who referred this user
  commission_earned_from_user?: number;
  last_activity_date?: string;
}

export interface AffiliateCommissionTier {
  level: number;
  name: string;
  min_referred_users?: number;
  min_ngr_generated?: number;
  cpa_rate?: number;
  revenue_share_rate?: number;
  description?: string;
}

export interface AffiliateReferral {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  referral_date: string;
  cpa_commission_paid?: boolean;
  // other details about the referral event
}

export interface AffiliatePayout {
  id: string;
  affiliate_id: string;
  amount: number;
  payout_date: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  method?: string; // e.g., 'bank_transfer', 'crypto'
  transaction_id?: string;
}
