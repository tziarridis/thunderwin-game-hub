
export interface Affiliate {
  id: string;
  user_id: string;
  code: string;
  total_referrals: number;
  active_referrals: number;
  commission_rate: number;
  lifetime_earnings: number;
  pending_commission: number;
  created_at: string;
  updated_at: string;
}

export interface AffiliateData {
  affiliate: Affiliate;
  totalReferrals: number;
  activeReferrals: number;
  pendingCommission: number;
  totalEarned: number;
  conversionRate: number;
}

export interface AffiliateCommission {
  id: string;
  affiliate_id: string;
  referred_user_id: string;
  amount: number;
  type: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export type AffiliateStats = {
  totalReferrals: number;
  activeReferrals: number;
  pendingCommission: number;
  totalEarned: number;
  conversionRate: number;
};

export type AffiliateStatSummary = AffiliateStats;

export type AffiliateLink = {
  id: string;
  code: string;
  url: string;
  clicks: number;
  signups: number;
};

export type AffiliateEarning = {
  id: string;
  amount: number;
  type: string;
  status: string;
  referredUser: string;
  date: string;
};

export interface AffiliateUser {
  id: string;
  username: string;
  email: string;
  affiliate_code: string;
  total_referrals: number;
  commission_earned: number;
  status: string;
  created_at: string;
}

export interface AffiliateCommissionTier {
  id: string;
  min_referrals: number;
  commission_rate: number;
  name: string;
}
