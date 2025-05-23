
export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator', 
  USER = 'user',
  VIP = 'vip',
  SUPPORT = 'support',
  AFFILIATE = 'affiliate'
}

export type UserRoleType = UserRole;

export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  status?: string;
  name?: string;
  vip_level_id?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
    currency?: string;
    language?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface AppUser {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  avatar_url?: string;
  first_name?: string;
  last_name?: string;
  created_at: string;
  updated_at: string;
  role?: UserRole;
  status?: string;
  name?: string;
  vip_level_id?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
    currency?: string;
    language?: string;
    full_name?: string;
    first_name?: string;
    last_name?: string;
  };
}

export interface UserProfile {
  id: string;
  user_id?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  language: string;
  currency: string;
  timezone: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  sms_notifications: boolean;
  two_factor_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface DisplayUser {
  id: string;
  username?: string;
  email?: string;
  avatar?: string;
  avatar_url?: string;
  role?: UserRole;
  status?: string;
}

export interface SupabaseAuthUser {
  id: string;
  email?: string;
  user_metadata?: {
    username?: string;
    avatar_url?: string;
  };
}
