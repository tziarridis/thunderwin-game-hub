
import { supabase } from "@/integrations/supabase/client";
import { User, AuthUser } from "@/types";

// Check if user is authenticated
export const isAuthenticated = async (): Promise<boolean> => {
  const { data } = await supabase.auth.getSession();
  return !!data.session;
};

// Get current user information
export const getCurrentUser = async (): Promise<AuthUser | null> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    
    // Get user data from custom users table
    const { data: userData, error } = await supabase
      .from('users')
      .select(`
        *,
        wallets (*)
      `)
      .eq('id', session.user.id)
      .single();
      
    if (error || !userData) {
      console.error('Error fetching user data:', error);
      return null;
    }
    
    // Return formatted user data
    return {
      id: userData.id,
      name: userData.username,
      username: userData.username,
      email: userData.email,
      balance: userData.wallets?.[0]?.balance || 0,
      isAdmin: userData.role_id === 1,
      avatarUrl: userData.avatar,
      vipLevel: userData.wallets?.[0]?.vip_level || 0,
      isVerified: true // Default to true until we implement verification
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

// Sign in with email and password
export const signIn = async (
  email: string, 
  password: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      return { user: null, error: 'User not found' };
    }
    
    // Get user details from our custom users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        wallets (*)
      `)
      .eq('id', data.user.id)
      .single();
      
    if (userError || !userData) {
      return { user: null, error: userError?.message || 'User data not found' };
    }
    
    const authUser: AuthUser = {
      id: userData.id,
      name: userData.username,
      username: userData.username,
      email: userData.email,
      balance: userData.wallets?.[0]?.balance || 0,
      isAdmin: userData.role_id === 1,
      avatarUrl: userData.avatar,
      vipLevel: userData.wallets?.[0]?.vip_level || 0,
      isVerified: true
    };
    
    return { user: authUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'An error occurred during sign in' };
  }
};

// Sign up with email and password
export const signUp = async (
  email: string,
  password: string,
  username: string
): Promise<{ user: AuthUser | null; error: string | null }> => {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username
        }
      }
    });
    
    if (error) {
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      return { user: null, error: 'Failed to create user' };
    }
    
    // User will be created via database trigger
    // Get the user data - it might not be available immediately
    // so we'll return a basic user object
    
    const authUser: AuthUser = {
      id: data.user.id,
      name: username,
      username: username,
      email: email,
      balance: 0,
      isAdmin: false,
      vipLevel: 0,
      isVerified: false
    };
    
    return { user: authUser, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'An error occurred during sign up' };
  }
};

// Sign out
export const signOut = async (): Promise<{ error: string | null }> => {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error: error.message };
    }
    
    return { error: null };
  } catch (error: any) {
    return { error: error.message || 'An error occurred during sign out' };
  }
};

// Update user profile
export const updateUserProfile = async (
  userId: string,
  updates: Partial<User>
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        avatar: updates.avatar,
        phone: updates.phone,
        status: updates.status
      })
      .eq('id', userId)
      .select()
      .single();
      
    if (error) {
      return { user: null, error: error.message };
    }
    
    // If we're updating the balance, update the wallet
    if (updates.balance !== undefined) {
      const { error: walletError } = await supabase
        .from('wallets')
        .update({ balance: updates.balance })
        .eq('user_id', userId);
        
      if (walletError) {
        return { user: null, error: walletError.message };
      }
    }
    
    // Get full updated user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        wallets (*)
      `)
      .eq('id', userId)
      .single();
      
    if (userError || !userData) {
      return { user: null, error: userError?.message || 'User data not found' };
    }
    
    const user: User = {
      id: userData.id,
      name: userData.username,
      username: userData.username,
      email: userData.email,
      balance: userData.wallets?.[0]?.balance || 0,
      isAdmin: userData.role_id === 1,
      avatar: userData.avatar,
      vipLevel: userData.wallets?.[0]?.vip_level || 0,
      isVerified: true,
      status: userData.status,
      joined: userData.created_at,
      role: userData.role_id === 1 ? "admin" : "user",
      favoriteGames: [],
      phone: userData.phone,
      lastLogin: userData.updated_at,
      createdAt: userData.created_at
    };
    
    return { user, error: null };
  } catch (error: any) {
    return { user: null, error: error.message || 'An error occurred while updating profile' };
  }
};
