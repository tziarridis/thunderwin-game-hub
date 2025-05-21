
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
  loading: boolean; // Standardized to 'loading'
  isAdmin: boolean; // Derived from user's role
  isAuthenticated: boolean;
  updateUserPassword: (password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>; // Standardized to 'signOut'
  refreshUser: () => Promise<void>;
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

    let appUser: AppUser = { ...supabaseUser };

    try {
      // 1. Fetch from public.users table
      const { data: publicUserData, error: publicUserError } = await supabase
        .from('users')
        .select('username, role_id') 
        .eq('id', supabaseUser.id) 
        .single();

      if (publicUserError && publicUserError.code !== 'PGRST116') { 
        console.error("Error fetching public user data:", publicUserError);
      } else if (publicUserData) {
        appUser.username = publicUserData.username;
        // Example: appUser.role = mapRoleIdToName(publicUserData.role_id); 
      }
      
      // 2. Fetch from public.profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, avatar_url')
        .eq('id', supabaseUser.id) 
        .single();

      if (profileError && profileError.code !== 'PGRST116') {
        console.error("Error fetching profile data:", profileError);
      } else if (profileData) {
        appUser.firstName = profileData.first_name;
        appUser.lastName = profileData.last_name;
        appUser.avatarUrl = profileData.avatar_url;
      }
      
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

  const value = {
    user,
    session,
    loading, // Standardized variable name
    isAdmin,
    isAuthenticated: !!user,
    updateUserPassword,
    signOut, // Standardized function name
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

