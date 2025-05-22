import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
// Use User type from user.d.ts for broader compatibility if it's more comprehensive
// For now, ensuring AppUser has camelCase date fields
// import { User as AppUserTypeDefinition } from '@/types/user.d.ts';


// Define a more specific User type for your application context if needed
// This might include fields from your public.users or public.profiles table
export interface AppUser extends SupabaseUser {
  // Custom fields from your public.users or public.profiles table
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string; // Example: 'admin', 'user', 'affiliate' (from app_metadata or custom table)
  isActive: boolean; // Added to match User type for components like UserMenu
  // Add other app-specific user properties here

  // Ensure camelCase versions for compatibility with other User types
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean; // Standardized to 'loading'
  isAdmin: boolean; // Derived from user's role
  isAuthenticated: boolean;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>; // Standardized to 'signOut'
  refreshUser: () => Promise<void>;
  refreshWalletBalance?: () => Promise<void>; // Added for wallet refresh
  // updateUserMetadata: (metadata: object) => Promise<{ data: { user: SupabaseUser | null }, error: any }>; // For app_metadata
  // updateProfile: (profileData: Partial<ProfileType>) => Promise<void>; // Example for profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Standardized variable name
  const [isAdmin, setIsAdmin] = useState(false);

  const enrichUser = async (supabaseUser: SupabaseUser | null): Promise<AppUser | null> => {
    if (!supabaseUser) return null;

    // Initialize AppUser with SupabaseUser fields and isActive
    let appUser: AppUser = { 
      ...supabaseUser, 
      isActive: true, // Default to true, can be refined with actual user status from DB
      createdAt: supabaseUser.created_at, // Map to camelCase
      updatedAt: supabaseUser.updated_at, // Map to camelCase
    };

    try {
      // 1. Fetch from public.users table
      const { data: publicUserData, error: publicUserError } = await supabase
        .from('users')
        .select('username, role_id, status, first_name, last_name, avatar_url') // Added more fields, assuming 'profiles' data might be here too
        .eq('id', supabaseUser.id) 
        .single();

      if (publicUserError) {
        if (publicUserError.code !== 'PGRST116') { // Not found error
          console.error("Error fetching public user data:", publicUserError);
        }
      } else if (publicUserData) {
        appUser.username = publicUserData.username || appUser.username;
        appUser.firstName = publicUserData.first_name || appUser.firstName;
        appUser.lastName = publicUserData.last_name || appUser.lastName;
        appUser.avatarUrl = publicUserData.avatar_url || appUser.avatarUrl;
        // Example: appUser.role = mapRoleIdToName(publicUserData.role_id); 
        // Set isActive based on database status if available
        if (publicUserData.status) {
            appUser.isActive = publicUserData.status.toLowerCase() === 'active';
        }
      }
      
      // 2. Fetch from public.profiles table (if separate and still needed)
      // This might be redundant if 'users' table now contains profile fields
      // const { data: profileData, error: profileError } = await supabase
      //   .from('profiles')
      //   .select('first_name, last_name, avatar_url')
      //   .eq('id', supabaseUser.id) // Assuming profiles.id links to auth.users.id
      //   .maybeSingle();

      // if (profileError) {
      //   if (profileError.code !== 'PGRST116') { // Not found error
      //     console.error("Error fetching profile data:", profileError);
      //   }
      // } else if (profileData) {
      //   appUser.firstName = profileData.first_name || appUser.firstName;
      //   appUser.lastName = profileData.last_name || appUser.lastName;
      //   appUser.avatarUrl = profileData.avatar_url || appUser.avatarUrl;
      // }
      
      // 3. Get role from app_metadata
      appUser.role = supabaseUser.app_metadata?.role || appUser.role; 

    } catch (error) {
      console.error("Error enriching user:", error);
    }
    
    return appUser;
  };


  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => { // Renamed to avoid conflict
      setSession(currentSession);
      const appUser = await enrichUser(currentSession?.user ?? null);
      setUser(appUser);
      setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin'); 
      setLoading(false);
    });

    // Setup auth state change listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, currentSession: Session | null) => { // Renamed to avoid conflict
        setLoading(true);
        setSession(currentSession);
        const appUser = await enrichUser(currentSession?.user ?? null);
        setUser(appUser);
        setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin');
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const updateUserPassword = async (password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success('Password updated successfully.');
    }
    setLoading(false);
    return { error };
  };

  const signOut = async () => { // Standardized function name
    setLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
    toast.success("Signed out successfully.");
  };
  
  const refreshUser = async () => {
    setLoading(true);
    // Corrected: refreshSession doesn't directly return user, need getUser after
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
        console.error("Error refreshing user session:", refreshError.message);
        if (refreshError.message.includes('Invalid refresh token')) { // More robust check
             await signOut();
        }
    } else {
        const { data: { user: currentSupabaseUserFromAuth }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
            console.error("Error getting user after session refresh:", getUserError.message);
        } else {
            const appUser = await enrichUser(currentSupabaseUserFromAuth);
            setUser(appUser);
            setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin');
        }
    }
    setLoading(false);
  };

  // New function to refresh wallet balance
  const refreshWalletBalance = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency, vip_level, vip_points')
        .eq('user_id', user.id) // Assuming wallets.user_id links to public.users.id, not auth.users.id directly
        .single();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        // Potentially toast.error("Could not refresh wallet balance.");
        return;
      }
      
      if (data) {
        // If using this to update a local state for wallet, do it here.
        // For now, just a success toast.
        toast.success("Wallet balance refreshed");
      }
    } catch (error) {
      console.error("Error in refreshWalletBalance:", error);
      // toast.error("An error occurred while refreshing wallet balance.");
    }
  };

  const value = {
    user,
    session,
    loading, // Standardized variable name
    isAdmin,
    isAuthenticated: !!user,
    updateUserPassword,
    signOut, // Standardized function name
    refreshUser,
    refreshWalletBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
