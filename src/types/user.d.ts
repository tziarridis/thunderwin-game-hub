
// Ensure KycStatus is imported or defined if used by DisplayUser or User
// import { KycStatus } from './kyc'; 
// For UserRole, define it here and export. Remove any circular imports of it.
export type UserRole = 'user' | 'admin' | 'support' | 'manager' | 'vip_player' | 'affiliate'; // Add other roles as needed

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
  firstName?: string; // Changed from first_name for consistency with common frontend patterns
  lastName?: string;  // Changed from last_name
  // Add other fields required for registration
}

export interface UserProfile {
  id: string; // Should match AuthUser.id
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
  // Extended User fields if stored in a separate 'profiles' table
  bio?: string;
  website?: string;
  // Timestamps
  created_at: string;
  updated_at: string;
}

// This is a more UI-focused user representation, could be derived from AppUser in AuthContext
export interface DisplayUser {
  id: string;
  displayName: string; // Combination of username, first/last name, or email
  email?: string;
  avatarUrl?: string;
  role?: UserRole;
  status?: string; // e.g., "Active", "Banned"
  joinedDate?: string; // Formatted date
  lastLogin?: string; // Formatted date
  isOnline?: boolean;
  // kycStatus?: KycStatus; // Uncomment if KycStatus is available
  vipLevel?: number | string; // Display representation
}

// For AuthContext or similar contexts providing user state
export interface UserContextType {
  user: User | null; // Using the more comprehensive User type from index.d.ts
  isAuthenticated: boolean;
  isLoading: boolean;
  error?: string | null;
  login: (credentials: LoginCredentials) => Promise<any>;
  register: (credentials: RegisterCredentials) => Promise<any>;
  logout: () => Promise<void>;
  // updateUser: (data: Partial<User>) => Promise<void>; // Example
  // refreshUser: () => Promise<void>; // Example
  isAdmin?: boolean; // Convenience flag
}

// Supabase specific user details, if needed separately, otherwise merge into main User/AppUser
export interface SupabaseAuthUser {
  id: string;
  aud: string;
  role?: string; // Supabase's internal role, distinct from application UserRole
  email?: string;
  email_confirmed_at?: string;
  phone?: string;
  phone_confirmed_at?: string;
  confirmed_at?: string; // If email_confirmed_at is not granular enough
  last_sign_in_at?: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any; // Custom fields like full_name, avatar_url
  };
  identities?: any[];
  created_at: string;
  updated_at: string;
}
