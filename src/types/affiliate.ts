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

  // Added fields based on usage in Admin/Affiliates.tsx if they are indeed part of the model
  // If these are from a joined user table, the structure fetching them should reflect that.
  // For now, assuming they might be denormalized or part of a broader 'AdminAffiliateView'
  avatar_url?: string; 
  status?: string; // If 'isActive' is not sufficient and a string status is used
  balance?: number; // Example, if affiliates have balances
  affiliate_revenue_share?: number;
  affiliate_cpa?: number;
  affiliate_baseline?: number;
  affiliate_revenue_share_fake?: number;

}

export interface AffiliateStatSummary {
  totalAffiliates: number;
  totalCommissionsPaid: number;
  newSignUpsThisMonth: number; // Or any relevant period
  // Add more aggregated stats as needed
}
