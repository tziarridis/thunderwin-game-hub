
export type UserStatus = 'active' | 'pending_verification' | 'suspended' | 'banned' | 'deleted';
export type UserRole = 'user' | 'admin' | 'moderator' | 'agent' | 'vip_manager'; // Example roles - EXPORTED

export interface User {
  id: string; // Typically UUID from Supabase auth.users.id
  username?: string | null;
  email: string;
  avatar_url?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  
  // Custom fields for your application's 'users' or 'profiles' table
  role?: UserRole | string; // Store role as string or use UserRole enum
  status?: UserStatus | string;
  is_verified?: boolean; // Email verification status
  is_banned?: boolean;
  
  created_at: string; // ISO date string - ensure this matches what AppUser provides
  updated_at: string; // ISO date string - ensure this matches what AppUser provides
  last_sign_in_at?: string | null; // ISO date string, from Supabase auth

  // Wallet related summary (optional, could be fetched separately)
  balance?: number; 
  currency?: string;
  vipLevel?: number;
  
  // Fields from AppUser that are needed by UserMenu if User type is used
  isActive: boolean; 

  // Supabase specific metadata (if you are merging auth.user with your public user table)
  app_metadata?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any;
  };

  // For AdminUserProfile page, if these are properties of your 'users' table:
  banned?: boolean; // This seems to be a specific field in your 'users' table
  // role_id might be how you store roles, if so, map it to 'role'

  // Adding missing fields from src/types/user.ts to reduce conversion errors
  // These may or may not be present on SupabaseUser directly, adjust AppUser enrichment
  name?: string; // Often username or combination of first/last
  avatar?: string; // often avatar_url
  joined?: string; // often created_at
  phone?: string;
  lastLogin?: string; // often last_sign_in_at
  favoriteGames?: string[]; // Custom app data
  profile?: any; // From src/types/user.ts UserProfile, define more strictly if possible
  isStaff?: boolean; // Custom app data
  isAdmin?: boolean; // Custom app data, or derived from role
  roles?: string[]; // Custom app data
  kycStatus?: any; // Import KycStatus if needed
}

