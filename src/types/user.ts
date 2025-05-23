import { KycStatus } from './kyc';

// Define UserRole if not already globally available
export type UserRole = 'user' | 'admin' | 'support' | 'manager' | 'vip_player' | 'affiliate';

export interface LoginCredentials {
  email?: string;
  phone?: string;
  password?: string;
  provider?: 'google' | 'facebook'; // For OAuth
  otp?: string; // For OTP login
}

export interface RegisterCredentials {
  email?: string;
  phone?: string;
  password?: string;
  username?: string;
  first_name?: string; // Changed from first_name for consistency
  last_name?: string;  // Changed from last_name
  // Add other fields required for registration, ensure they match AuthContext signUp options data
}

export interface UserProfile {
  id?: string; // Should match AuthUser.id from Supabase, or user_id from users table
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string;
  date_of_birth?: string; // ISO string
  phone_number?: string;
  // Address fields
  address_street?: string;
  address_city?: string;
  address_state?: string;
  address_postal_code?: string;
  address_country?: string;
  // Preferences
  communication_preferences?: {
    email_promotions?: boolean;
    sms_notifications?: boolean;
  };
  bio?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

// This 'User' type should be the primary one used across the app for a logged-in user.
// It combines Supabase auth user data with your custom profile/user table data.
export interface User {
  id: string; // From Supabase Auth or your 'users' table primary key linked to auth.users.id
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: UserRole; // Store app-specific role here if using Supabase metadata
    [key: string]: any;
  };
  user_metadata?: {
    [key: string]: any; // Custom fields like full_name, avatar_url from Supabase
  };
  aud?: string;
  email?: string;
  phone?: string;
  created_at: string; // Supabase auth created_at
  updated_at?: string; // Supabase auth updated_at or profile updated_at
  last_sign_in_at?: string;

  // Fields from your 'users' or 'profiles' table
  username?: string;
  first_name?: string;
  last_name?: string;
  avatar_url?: string; // Can be from user_metadata or your profiles table
  role?: UserRole; // Application-specific role from your 'users' or 'profiles' table
  status?: string; // e.g. 'active', 'banned'
  is_active?: boolean; // derived from status or a direct boolean
  kycStatus?: KycStatus;
  // Add any other custom fields from your user data model
  [key: string]: any; // Allow for additional properties from Supabase or custom tables
}

// AppUser can be an alias for User, or a more specific version if needed.
// For simplicity, let's use User as the primary type.
export type AppUser = User;


export interface UserSettings {
  theme?: 'dark' | 'light';
  language?: string;
  // ... other settings
}

// This type is often used for displaying user info in lists, etc.
export interface DisplayUser {
  id: string;
  displayName: string;
  email?: string;
  avatarUrl?: string;
  role?: UserRole;
  status?: string;
  joinedDate?: string;
  lastLogin?: string;
}

// For Supabase Auth User object, if needed separately
export interface SupabaseAuthUser {
  id: string;
  aud: string;
  role?: string; // Supabase's internal role
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  identities?: any[];
  created_at: string;
  updated_at: string;
}
