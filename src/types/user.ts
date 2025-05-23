
// User role types
export enum UserRole {
  ADMIN = "admin",
  USER = "user",
  SUPPORT = "support",
  MANAGER = "manager",
  VIP_PLAYER = "vip_player",
  AFFILIATE = "affiliate"
}

// Auth user from Supabase
export interface SupabaseAuthUser {
  id: string;
  email: string;
  user_metadata: any;
  app_metadata: any;
}

// Base user profile
export interface UserProfile {
  id: string;
  username?: string;
  email: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at?: string;
  phone_number?: string;
  status?: 'active' | 'inactive' | 'pending_verification' | 'banned' | 'restricted';
  is_active?: boolean;
  is_verified?: boolean;
}

// Extended user profile with app-specific fields
export interface User extends UserProfile {
  role?: UserRole;
  balance?: number;
  vip_level_id?: string;
  is_banned?: boolean;
  kyc_status?: string;
  currency?: string;
  user_metadata?: Record<string, any>;
  app_metadata?: Record<string, any>;
  last_sign_in_at?: string;
  date_of_birth?: string;
}

// App user with auth data
export interface AppUser extends User {
  username?: string;
  role?: UserRole;
  vip_level?: number;
  vipLevel?: number;
  vipPoints?: number;
}

// Display user (simplified)
export interface DisplayUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  role: string;
  status: string;
}

// Login credentials
export interface LoginCredentials {
  email: string;
  password: string;
  phone?: string;
}

// Register credentials
export interface RegisterCredentials {
  email: string;
  password: string;
  username: string;
}

// User settings
export interface UserSettings {
  id: string;
  user_id: string;
  theme: 'light' | 'dark' | 'system';
  notifications_enabled: boolean;
  language: string;
  currency: string;
  time_format: '12h' | '24h';
  created_at: string;
  updated_at: string;
}
