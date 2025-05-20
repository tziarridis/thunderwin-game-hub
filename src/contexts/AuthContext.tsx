import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet'; // Assuming this is the correct Wallet type
import { walletService } from '@/services/walletService'; // Assuming this service exists
import { User, Profile } from '@/types/user'; // Using combined User type

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Combined User type
  session: Session | null;
  profile: Profile | null; 
  wallet: Wallet | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAuthData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchAndSetUserData = async (supabaseUser: SupabaseUser | null, currentSession: Session | null) => {
    if (supabaseUser && currentSession) {
      try {
        // Fetch profile
        const { data: userProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows
          console.error('Error fetching profile:', profileError);
        }
        
        const combinedUser: User = {
          ...supabaseUser,
          profile: userProfile || undefined,
          // Supabase User already has role if JWT is set up, otherwise check profile
          role: supabaseUser.user_metadata?.role || userProfile?.role || 'user', 
        };

        setUser(combinedUser);
        setProfile(userProfile || null);
        setIsAdmin(combinedUser.role === 'admin');

        // Fetch wallet
        const userWallet = await walletService.getWalletByUserId(supabaseUser.id);
        setWallet(userWallet); // This should be Wallet | null
        
      } catch (err) {
        console.error("Error fetching additional user data:", err);
        setUser({ ...supabaseUser, role: supabaseUser.user_metadata?.role || 'user' } as User); // Fallback with Supabase user
        setProfile(null);
        setWallet(null);
        setIsAdmin(supabaseUser.user_metadata?.role === 'admin');
      }
    } else {
      setUser(null);
      setProfile(null);
      setWallet(null);
      setIsAdmin(false);
    }
  };


  useEffect(() => {
    const setAuthData = async (currentSession: Session | null) => {
      setSession(currentSession);
      const supabaseUser = currentSession?.user ?? null;
      await fetchAndSetUserData(supabaseUser, currentSession);
      setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: initialSession } }) => {
      setAuthData(initialSession);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      // Potentially defer heavy operations if needed as per Supabase deadlock prevention
      // For now, direct call to keep logic simpler, monitor for issues
      setIsLoading(true); 
      await setAuthData(newSession);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // Auth state change will handle setting user, profile, wallet
  };

  const register = async (email: string, password: string, username?: string) => {
    setIsLoading(true);
    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username: username || email.split('@')[0], // Default username
          role: 'user', // Default role
        },
      },
    });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // If sign up is successful and a user is returned, create profile and wallet
    if (signUpData.user) {
        try {
            if (username) { // Only create profile if username is provided, or handle default
                 await supabase.from('profiles').insert({
                    id: signUpData.user.id,
                    username: username || email.split('@')[0],
                    email: email, // Store email in profiles for easier access if needed
                    role: 'user'
                 });
            }
            await walletService.createWallet(signUpData.user.id, 'USD'); // Default currency
        } catch(profileWalletError) {
            console.error("Error creating profile/wallet post-signup:", profileWalletError);
            // User is signed up, but profile/wallet creation failed. Might need manual fix or retry.
        }
    }
    // Auth state change will handle setting user, profile, wallet for the new session
  };

  const logout = async () => {
    setIsLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      setIsLoading(false);
      throw error;
    }
    // Auth state change will clear user, profile, wallet
  };

  const refreshAuthData = async () => {
    setIsLoading(true);
    const { data: { session: currentSession }, error } = await supabase.auth.refreshSession();
    if (error) console.error("Error refreshing session:", error);
    await fetchAndSetUserData(currentSession?.user ?? null, currentSession);
    setIsLoading(false);
  };


  const value = {
    isAuthenticated: !!user && !!session,
    user,
    session,
    profile,
    wallet,
    isLoading,
    isAdmin,
    login,
    register,
    logout,
    refreshAuthData,
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
