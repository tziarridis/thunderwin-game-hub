export type UserStatus = 'active' | 'pending_verification' | 'suspended' | 'banned' | 'deleted';
export type UserRole = 'user' | 'admin' | 'moderator' | 'agent' | 'vip_manager'; // Example roles

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
  
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
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
}
