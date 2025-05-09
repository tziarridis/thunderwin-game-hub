
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
    
    // Add delay before fetching user data from our custom users table
    // This ensures database triggers have time to complete
    await new Promise(resolve => setTimeout(resolve, 500));
    
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
      console.error("Error fetching user data after login:", userError);
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
    console.error("Error during sign in:", error);
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
    console.log("Starting signup process for:", email);
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: username,
        },
      }
    });
    
    if (error) {
      console.error("Signup error:", error);
      return { user: null, error: error.message };
    }
    
    if (!data.user) {
      console.error("No user data returned from signup");
      return { user: null, error: 'Failed to create user' };
    }
    
    console.log("User created with ID:", data.user.id);
    
    // Add a delay to ensure database triggers complete
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Check if the user record is properly created in users table
    const { data: newUserData, error: userCheckError } = await supabase
      .from('users')
      .select('id, username, email')
      .eq('id', data.user.id)
      .single();
    
    if (userCheckError || !newUserData) {
      console.error("User record not created in users table:", userCheckError);
      
      // Manually create the user record if it doesn't exist
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: data.user.id,
          username: username,
          email: email,
          role_id: 3, // Default to regular user role
          status: 'Active'
        });
        
      if (insertError) {
        console.error("Failed to manually create user record:", insertError);
      } else {
        console.log("Manually created user record");
        
        // Create wallet for user
        const { error: walletError } = await supabase
          .from('wallets')
          .insert({
            user_id: data.user.id,
            currency: 'USD',
            symbol: '$',
            active: true
          });
          
        if (walletError) {
          console.error("Failed to create wallet:", walletError);
        } else {
          console.log("Created wallet for user");
        }
      }
    } else {
      console.log("User record exists, checking for wallet");
      
      // Check if wallet exists, create if not
      const { data: walletData, error: walletCheckError } = await supabase
        .from('wallets')
        .select('id')
        .eq('user_id', data.user.id)
        .single();
        
      if (walletCheckError || !walletData) {
        console.log("Creating wallet for user");
        const { error: walletCreateError } = await supabase
          .from('wallets')
          .insert({
            user_id: data.user.id,
            currency: 'USD',
            symbol: '$',
            active: true
          });
          
        if (walletCreateError) {
          console.error("Failed to create wallet:", walletCreateError);
        }
      }
    }
    
    // Return basic user object even if we couldn't confirm creation,
    // since the database trigger might still be processing
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
    console.error("Exception during signup:", error);
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
    // Ensure that status is of the correct type
    const userStatus = updates.status as "Active" | "Pending" | "Inactive" || "Active";
      
    const { data, error } = await supabase
      .from('users')
      .update({
        username: updates.username,
        avatar: updates.avatar,
        phone: updates.phone,
        status: userStatus
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
      status: userStatus,
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
