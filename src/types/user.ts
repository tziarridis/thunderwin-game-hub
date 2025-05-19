
export interface User {
  id: string; // This should be the Supabase auth user ID (UUID)
  app_meta_data?: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    // Common fields often stored here
    avatar_url?: string;
    full_name?: string;
    name?: string; // adding name to user_metadata
    // Custom fields for your app
    username?: string;
    kyc_status?: 'verified' | 'pending' | 'rejected' | 'not_submitted';
    currency?: string;
    language?: string;
    [key: string]: any; // Allow other custom properties
  };
  aud: string;
  confirmation_sent_at?: string;
  recovery_sent_at?: string;
  email_change_sent_at?: string;
  new_email?: string;
  new_phone?: string;
  invited_at?: string;
  action_link?: string;
  email?: string;
  phone?: string;
  created_at: string;
  confirmed_at?: string;
  email_confirmed_at?: string;
  phone_confirmed_at?: string;
  last_sign_in_at?: string;
  role?: string; // This is often custom, either in user_metadata or a separate table
  updated_at?: string;
  identities?: UserIdentity[];
  // Custom fields from your 'users' table if you join profiles with auth.users
  // These are added to match common usage patterns in admin panels
  status?: 'active' | 'inactive' | 'banned'; // Example status
  // name?: string; // This might be user_metadata.name or from a profiles table
}

export interface UserIdentity {
  id: string;
  user_id: string;
  identity_data?: {
    [key: string]: any;
  };
  provider: string;
  last_sign_in_at?: string;
  created_at?: string;
  updated_at?: string;
}

// Minimal profile type if you have a separate profiles table
export interface Profile {
  id: string; // Usually matches User.id
  username?: string;
  avatar_url?: string;
  full_name?: string;
  // any other profile fields
}
