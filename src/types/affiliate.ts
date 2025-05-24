
export interface AffiliateStats {
  totalReferrals: number;
  activeReferrals: number;
  pendingCommission: number;
  totalEarned: number;
  conversionRate: number;
  clicks: number;
  total_earnings: number;
  unpaid_earnings: number;
  commission_rate: number;
  sign_ups: number;
  active_players: number;
}

export interface AffiliateStatSummary {
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalReferrals: number;
  totalCommissionPaid: number;
  activeReferrals: number;
  pendingCommission: number;
  totalEarned: number;
  conversionRate: number;
}

export interface AffiliateUser {
  id: string;
  username: string;
  email: string;
  status: string;
  commission_rate: number;
  total_earnings: number;
  unpaid_earnings: number;
  referrals_count: number;
  created_at: string;
}

export interface AffiliateCommissionTier {
  id: string;
  name: string;
  min_referrals: number;
  commission_rate: number;
  bonus_amount: number;
}

export interface AffiliateLink {
  id: string;
  code: string;
  url: string;
  clicks: number;
  signups: number;
  name: string;
  sign_ups: number;
}

export interface AffiliateEarning {
  id: string;
  amount: number;
  type: string;
  status: string;
  referredUser: string;
  date: string;
  player_id: string;
  transaction_id: string;
  created_at: string;
}
