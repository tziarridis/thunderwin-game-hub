
// Basic user type for authentication
export interface User {
  id: string;
  email?: string;
  created_at: string;
  updated_at: string;
  username?: string;
  lastName?: string;
  firstName?: string;
  roles?: string[];
  permissions?: string[];
  isActive?: boolean;
  avatarUrl?: string;
  phone?: string;
  inviterCode?: string;
}

// App User type used in components like UserMenu
export interface AppUser {
  id: string;
  email?: string | null;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  roles?: string[];
  permissions?: string[];
}

// User with additional fields for the affiliate system
export interface AffiliateUser extends User {
  tracking_code?: string;
  website_url?: string;
  status?: 'active' | 'pending' | 'inactive' | 'blocked';
  commission_type?: 'revshare' | 'cpa' | 'hybrid';
  default_commission_rate?: number;
  commission_tiers?: CommissionTier[];
  // For displaying in the admin
  userId?: string;
}

// Commission tier structure for affiliates
export interface CommissionTier {
  threshold: number;
  rate: number;
  type: 'percentage' | 'fixed';
}
