
import { User } from './user';

export interface Affiliate {
  id: string;
  userId: string;
  user?: User;
  code?: string; // Referral code
  totalCommissions?: number; // Corresponds to total_commission_earned
  clicks?: number;
  signUps?: number; // Corresponds to total_referred_users (conceptually)
  depositingUsers?: number;
  createdAt: string;
  updatedAt: string;
  name?: string; // From associated User
  email?: string; // From associated User

  // Fields for AffiliateStats.tsx
  status?: 'active' | 'pending' | 'rejected'; // Added status
  total_referred_users?: number; // Number of users referred
  // total_commission_earned is mapped to totalCommissions
  commission_rate_cpa?: number; // Cost Per Acquisition rate
  commission_rate_revenue_share?: number; // Revenue share percentage
  // 'referral_code' can be mapped from 'code'
}

export interface AffiliateStatSummary {
  totalAffiliates: number;
  totalCommissionsPaid: number;
  newSignUpsThisMonth: number;
}
