
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';
// Use User type from user.d.ts for broader compatibility if it's more comprehensive
// For now, ensuring AppUser has camelCase date fields
import { User as AppUserTypeDefinition, UserRole } from '@/types/user'; // Added UserRole import


// Define a more specific User type for your application context if needed
// This might include fields from your public.users or public.profiles table
export interface AppUser extends SupabaseUser {
  // Custom fields from your public.users or public.profiles table
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: UserRole | string; // Example: 'admin', 'user', 'affiliate' (from app_metadata or custom table)
  isActive: boolean; // Added to match User type for components like UserMenu
  // Add other app-specific user properties here

  // Ensure camelCase versions for compatibility with other User types
  createdAt?: string;
  updatedAt?: string;

  // Added from User type for Profile.tsx needs
  first_name?: string;
  last_name?: string;
  phone?: string;
  referralCode?: string;
  referralLink?: string;
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
  
  // Added stubs for missing auth methods
  login?: (credentials: any) => Promise<{ error: any | null }>; // Define args as needed
  register?: (details: any) => Promise<{ error: any | null }>; // Define args as needed
  adminLogin?: (credentials: any) => Promise<{ error: any | null }>; // Define args as needed
  updateProfile?: (profileData: Partial<AppUser>) => Promise<{ error: any | null }>; // Define args as needed
  error?: string | null; // Added for AdminLogin.tsx
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true); // Standardized variable name
  const [isAdmin, setIsAdmin] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null); // For the 'error' field

  const enrichUser = async (supabaseUser: SupabaseUser | null): Promise<AppUser | null> => {
    if (!supabaseUser) return null;

    // Initialize AppUser with SupabaseUser fields and isActive
    let appUser: AppUser = { 
      ...supabaseUser, 
      isActive: true, // Default to true, can be refined with actual user status from DB
      createdAt: supabaseUser.created_at, // Map to camelCase
      updatedAt: supabaseUser.updated_at, // Map to camelCase
      // Ensure AppUser fields are initialized if not present on SupabaseUser
      firstName: supabaseUser.user_metadata?.first_name || undefined,
      lastName: supabaseUser.user_metadata?.last_name || undefined,
      avatarUrl: supabaseUser.user_metadata?.avatar_url || undefined,
    };

    try {
      // 1. Fetch from public.users table
      const { data: publicUserData, error: publicUserError } = await supabase
        .from('users')
        .select('username, role, status, first_name, last_name, avatar_url, phone, referralCode, referralLink') // Added more fields, assuming 'role' exists
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
        appUser.role = publicUserData.role || appUser.role; 
        appUser.phone = publicUserData.phone || appUser.phone;
        appUser.referralCode = (publicUserData as any).referralCode || appUser.referralCode;
        appUser.referralLink = (publicUserData as any).referralLink || appUser.referralLink;
        
        if (publicUserData.status) {
            appUser.isActive = publicUserData.status.toLowerCase() === 'active';
        }
      }
      
      // 2. Get role from app_metadata if not in users table or to override
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
      setAuthError(error.message);
    } else {
      toast.success('Password updated successfully.');
      setAuthError(null);
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
    setAuthError(null);
    toast.success("Signed out successfully.");
  };
  
  const refreshUser = async () => {
    setLoading(true);
    setAuthError(null);
    // Corrected: refreshSession doesn't directly return user, need getUser after
    const { error: refreshError } = await supabase.auth.refreshSession();
    
    if (refreshError) {
        console.error("Error refreshing user session:", refreshError.message);
        setAuthError(refreshError.message);
        if (refreshError.message.includes('Invalid refresh token')) { // More robust check
             await signOut();
        }
    } else {
        const { data: { user: currentSupabaseUserFromAuth }, error: getUserError } = await supabase.auth.getUser();
        if (getUserError) {
            console.error("Error getting user after session refresh:", getUserError.message);
            setAuthError(getUserError.message);
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
    setAuthError(null);
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency, vip_level, vip_points')
        .eq('user_id', user.id) 
        .single();
        
      if (error) {
        console.error("Error fetching wallet balance:", error);
        toast.error("Could not refresh wallet balance.");
        return;
      }
      
      if (data) {
        // TODO: Update user context or a dedicated wallet context if wallet data is stored there.
        // For now, just a success toast.
        // Example: setUser(prevUser => prevUser ? ({...prevUser, wallet: data }) : null);
        toast.success("Wallet balance refreshed");
      }
    } catch (error) {
      console.error("Error in refreshWalletBalance:", error);
      // toast.error("An error occurred while refreshing wallet balance.");
    }
  };

  // Stub implementations for missing auth functions
  const login = async (credentials: any) => { 
    console.warn("AuthContext: login function is a stub.", credentials);
    toast.info("Login functionality not fully implemented yet.");
    // Example: const { error } = await supabase.auth.signInWithPassword(credentials); setAuthError(error?.message || null); return { error };
    return { error: null };
  };
  const register = async (details: any) => {
    console.warn("AuthContext: register function is a stub.", details);
    toast.info("Registration functionality not fully implemented yet.");
    // Example: const { error } = await supabase.auth.signUp(details); setAuthError(error?.message || null); return { error };
    return { error: null };
  };
  const adminLogin = async (credentials: any) => {
    console.warn("AuthContext: adminLogin function is a stub.", credentials);
    toast.info("Admin login functionality not fully implemented yet.");
    // This would likely involve checking role after a normal login
    return { error: null };
  };
   const updateProfile = async (profileData: Partial<AppUser>) => {
    console.warn("AuthContext: updateProfile function is a stub.", profileData);
    if (!user?.id) return { error: { message: "User not authenticated" }};
    setLoading(true);
    setAuthError(null);
    try {
        const { data, error } = await supabase
            .from('users') // Or 'profiles' depending on your table
            .update(profileData)
            .eq('id', user.id)
            .select()
            .single();

        if (error) throw error;
        
        // Re-enrich user data after profile update
        const { data: { user: currentSupabaseUserFromAuth } } = await supabase.auth.getUser();
        const appUser = await enrichUser(currentSupabaseUserFromAuth);
        setUser(appUser);

        toast.success("Profile updated successfully.");
        setLoading(false);
        return { error: null };

    } catch (err: any) {
        toast.error(`Failed to update profile: ${err.message}`);
        setAuthError(err.message);
        setLoading(false);
        return { error: err };
    }
  };


  const value = {
    user,
    session,
    loading, 
    isAdmin,
    isAuthenticated: !!user,
    updateUserPassword,
    signOut, 
    refreshUser,
    refreshWalletBalance,
    login,
    register,
    adminLogin,
    updateProfile,
    error: authError,
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

