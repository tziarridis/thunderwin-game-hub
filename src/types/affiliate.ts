
export interface AffiliateCommissionTier {
  id?: string;
  threshold: number; // e.g., FTDs or revenue amount
  rate: number; // percentage or fixed amount
  type: 'percentage' | 'fixed'; // Type of commission
}

export interface Affiliate {
  id: string;
  user_id: string; // Link to the main user ID
  tracking_code: string;
  website_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_type: 'revshare' | 'cpa' | 'hybrid';
  default_commission_rate?: number; // For simple non-tiered setups
  commission_tiers?: AffiliateCommissionTier[];
  balance: number;
  created_at: string;
  updated_at: string;
  isActive?: boolean; // Added missing property
  // User related info might be denormalized or joined
  firstName?: string;
  lastName?: string;
  email?: string;
}

// This type might be used for forms or creating new affiliate users
export interface AffiliateUser { // Renamed from NewAffiliateUser for clarity if it represents the affiliate user entity
  id?: string; // Optional if creating
  userId: string; // The user ID from your auth system
  username?: string;
  email: string;
  firstName?: string;
  lastName?: string;
  tracking_code: string;
  website_url?: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  commission_type: 'revshare' | 'cpa' | 'hybrid';
  default_commission_rate?: number;
  commission_tiers: AffiliateCommissionTier[]; // Made non-optional, can be empty array
  // Add any other fields needed for creating/editing an affiliate profile
}

// Data structure for the list/table in admin
export interface AffiliateData extends Affiliate {
  // Potentially add joined data for display
  referred_users_count?: number;
  total_earnings?: number;
}

// Define AffiliateStatSummary
export interface AffiliateStatSummary {
  totalAffiliates: number;
  activeAffiliates: number;
  pendingAffiliates: number;
  totalReferrals: number;
  totalCommissionPaid: number;
  // Add other relevant summary fields
}
