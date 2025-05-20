
export interface Affiliate {
  id: string; // Typically the Supabase auth user ID or your public.users ID
  userId: string; // Your application's user ID from public.users table
  name: string;
  email: string;
  code?: string; // Referral code
  totalCommissions?: number;
  clicks?: number;
  signUps?: number; // Referred users who signed up
  depositingUsers?: number; // Referred users who made a deposit
  commissionRate?: number; // e.g., 0.2 for 20%
  paymentDetails?: any; // Placeholder for payment info like PayPal, bank account
  isActive?: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  // raw_user_meta_data?: any; // Avoid using this directly if possible
}

export interface AffiliateStatSummary {
  totalAffiliates: number;
  totalCommissionsPaid: number;
  newSignUpsThisMonth: number; // Or any relevant period
  // Add more aggregated stats as needed
}
