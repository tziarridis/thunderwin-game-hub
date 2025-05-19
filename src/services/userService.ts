
import { supabase } from '@/integrations/supabase/client';
import { User, Profile } from '@/types/user'; // Assuming User type might be more comprehensive

// Maps a Supabase auth user and potentially a profile to your app's User type
const mapSupabaseUserToUser = (
  supabaseUser: any, // Supabase's User object from auth or your public.users table
  profile?: Profile | null // Optional profile data
): User => {
  // console.log("Mapping Supabase user:", supabaseUser);
  // console.log("Mapping profile:", profile);

  // Adapt this mapping based on where your data lives (auth.users, public.users, public.profiles)
  // This example assumes supabaseUser is an entry from your 'public.users' table
  // and profile is from 'public.profiles' linked by auth.users.id -> profiles.id -> users.id
  
  const userResult: User = {
    id: supabaseUser.id, // This should be the ID from your public.users table, or auth.users.id if that's your primary key
    aud: supabaseUser.aud || '', // If using Supabase Auth user directly
    role: supabaseUser.role || supabaseUser.role_id === 1 ? 'admin' : 'user', // Adjust based on your role field
    email: supabaseUser.email,
    email_confirmed_at: supabaseUser.email_confirmed_at || supabaseUser.confirmed_at,
    phone: supabaseUser.phone || profile?.phone, // Example: Check profile if public.users doesn't have phone
    confirmed_at: supabaseUser.confirmed_at,
    last_sign_in_at: supabaseUser.last_sign_in_at,
    created_at: supabaseUser.created_at,
    updated_at: supabaseUser.updated_at,
    app_meta_data: supabaseUser.app_metadata || { provider: supabaseUser.app_meta_data?.provider, providers: supabaseUser.app_meta_data?.providers },
    user_metadata: {
      ...supabaseUser.user_metadata, // Spread existing user_metadata from auth.users if applicable
      full_name: supabaseUser.full_name || profile?.full_name || supabaseUser.user_metadata?.full_name || supabaseUser.user_metadata?.name,
      avatar_url: supabaseUser.avatar_url || profile?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      username: supabaseUser.username || supabaseUser.user_metadata?.username, // Prioritize public.users.username
      name: supabaseUser.name || profile?.full_name || supabaseUser.user_metadata?.name,
      // ensure kyc_status, currency, language, vip_level are correctly sourced
      kyc_status: supabaseUser.kyc_status || supabaseUser.user_metadata?.kyc_status || 'not_submitted',
      currency: supabaseUser.currency || supabaseUser.user_metadata?.currency || 'USD',
      language: supabaseUser.language || supabaseUser.user_metadata?.language || 'en',
      vip_level: supabaseUser.vip_level || supabaseUser.user_metadata?.vip_level, // vip_level might be on wallets or public.users
    },
    identities: supabaseUser.identities, // If from auth.users
    status: supabaseUser.status || 'active', // Default status if not present
  };
  // console.log("Mapped user object:", userResult);
  return userResult;
};


export const userService = {
  async getUserById(userId: string): Promise<User | null> {
    // This should fetch from your 'public.users' table or similar
    // where you store app-specific user details.
    // The 'userId' here is expected to be the auth.users.id (UUID).
    // Your 'public.users' table might use a different primary key or be linked via a 'profiles' table.

    // Scenario 1: 'public.users' table's 'id' column IS auth.users.id
    // console.log(`Fetching user from public.users by id: ${userId}`);
    const { data: publicUserData, error: publicUserError } = await supabase
      .from('users') // Your custom 'users' table in the public schema
      .select('*') // Select all fields you need, potentially join with profiles or wallets
      .eq('id', userId) // Assuming 'id' in public.users matches auth.users.id
      .maybeSingle();

    if (publicUserError) {
      console.error('Error fetching user from public.users:', publicUserError);
      // Fallback to fetching from auth.users if public.users fetch fails or if it's the primary source
      // This path is usually less desirable as auth.users contains limited metadata.
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser && authUser.id === userId) {
        // console.warn("Fetched user from auth.users as fallback for id:", userId);
        return mapSupabaseUserToUser(authUser);
      }
      return null;
    }

    if (publicUserData) {
      // console.log("Successfully fetched user from public.users:", publicUserData);
      // If your public.users table is comprehensive and matches the User type mostly
      return mapSupabaseUserToUser(publicUserData);
    }
    
    // Fallback if user not found in public.users, try auth.users (less metadata)
    // console.warn(`User not found in public.users for id: ${userId}. Attempting to fetch from auth.users.`);
    const { data: { user: authUser } } = await supabase.auth.getUser(); // This gets the currently authenticated user
    if (authUser && authUser.id === userId) { // Check if it's the requested user
        // console.warn("Fetched user from auth.users as fallback after public.users miss for id:", userId);
        // You might want to fetch profile data here if your 'profiles' table links auth.users.id to public.users.id
        // For simplicity, just mapping authUser here.
        return mapSupabaseUserToUser(authUser);
    }
    
    // console.log(`No user found for id: ${userId} in either public.users or auth.users`);
    return null;
  },

  // Add other user-related service methods here
  // e.g., updateUser, createUserInPublicTable (if not handled by trigger)
};
