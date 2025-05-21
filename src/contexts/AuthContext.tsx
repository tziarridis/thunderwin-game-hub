
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AuthChangeEvent, Session, User as SupabaseUser } from '@supabase/supabase-js';
import { toast } from 'sonner';

// Define a more specific User type for your application context if needed
// This might include fields from your public.users or public.profiles table
export interface AppUser extends SupabaseUser {
  // Custom fields from your public.users or public.profiles table
  username?: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  role?: string; // Example: 'admin', 'user', 'affiliate' (from app_metadata or custom table)
  // Add other app-specific user properties here
}

export interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean; // Derived from user's role
  isAuthenticated: boolean;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  // updateUserMetadata: (metadata: object) => Promise<{ data: { user: SupabaseUser | null }, error: any }>; // For app_metadata
  // updateProfile: (profileData: Partial<ProfileType>) => Promise<void>; // Example for profile updates
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const enrichUser = async (supabaseUser: SupabaseUser | null): Promise<AppUser | null> => {
    if (!supabaseUser) return null;

    let appUser: AppUser = { ...supabaseUser };

    try {
      // 1. Fetch from public.users table (assuming user.id from auth matches public.users.id OR use email)
      const { data: publicUserData, error: publicUserError } = await supabase
        .from('users')
        .select('username, role_id') // Add other fields like status, language etc.
        .eq('id', supabaseUser.id) // Assuming your public.users.id is FK to auth.users.id
        .single();

      if (publicUserError && publicUserError.code !== 'PGRST116') { // PGRST116: 0 rows, not an error if profile not created yet
        console.error("Error fetching public user data:", publicUserError);
      } else if (publicUserData) {
        appUser.username = publicUserData.username;
        // Map role_id to role name if you have a roles table or enum
        // appUser.role = mapRoleIdToName(publicUserData.role_id); 
      }
      
      // 2. Fetch from public.profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', supabaseUser.id) // Assuming profiles.id is FK to auth.users.id
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile data:", profileError);
      } else if (profileData) {
        appUser.firstName = profileData.first_name;
        appUser.lastName = profileData.last_name;
        appUser.avatarUrl = profileData.avatar_url;
      }
      
      // 3. Get role from app_metadata as a fallback or primary source
      // The user object from supabase.auth.onAuthStateChange already includes app_metadata
      appUser.role = supabaseUser.app_metadata?.role || appUser.role; // Prioritize app_metadata if exists

    } catch (error) {
      console.error("Error enriching user:", error);
    }
    
    return appUser;
  };


  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      const appUser = await enrichUser(session?.user ?? null);
      setUser(appUser);
      setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin'); // Check role from app_metadata
      setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        setLoading(true);
        setSession(session);
        const appUser = await enrichUser(session?.user ?? null);
        setUser(appUser);
        setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin');
        setLoading(false);
      }
    );

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

  const signOut = async () => {
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
    const { data: { user: refreshedSupabaseUser }, error } = await supabase.auth.refreshSession(); // This refreshes the JWT
    if (error) {
        console.error("Error refreshing user session:", error.message);
        // Potentially sign out if refresh fails critically
        if (error.message === 'Invalid refresh token') await signOut();
    } else {
        // After refreshing session, get the user again to ensure metadata is fresh
        const { data: { user: currentSupabaseUserFromAuth } } = await supabase.auth.getUser();
        const appUser = await enrichUser(currentSupabaseUserFromAuth);
        setUser(appUser);
        setIsAdmin(appUser?.app_metadata?.role === 'admin' || appUser?.role === 'admin');
    }
    setLoading(false);
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
