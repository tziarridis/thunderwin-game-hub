import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, Wallet } from '@/types'; // Assuming your local User type aligns or extends SupabaseUser
import { userService } from '@/services/userService'; // To fetch user profile
import { walletService } from '@/services/walletService'; // To fetch wallet
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Use your extended User type
  session: Session | null;
  loading: boolean;
  isAdmin?: boolean; // Added for admin checks
  signIn: (credentials: { email: string; password?: string; provider?: 'google' | 'discord' }) => Promise<any>;
  signUp: (credentials: { email: string; password?: string; data?:object }) => Promise<any>;
  signOut: () => Promise<void>; // Added
  refreshUser: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>; // Added
  wallet: Wallet | null; // Added
  deposit?: () => void; // Added placeholder
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const fetchUserProfileAndWallet = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      try {
        const userProfile = await userService.getUserProfile(supabaseUser.id);
        const userWallet = await walletService.getWalletByUserId(supabaseUser.id);

        if (userProfile) {
          // Merge Supabase user data with your profile data
          const appUser: User = {
            ...supabaseUser, // Base Supabase user fields
            ...userProfile, // Custom profile fields
            // Ensure all fields from your User type are covered
            username: userProfile.username || supabaseUser.email?.split('@')[0],
            vip_level: userProfile.vip_level || 0,
            // ... other merged fields
          };
          setUser(appUser);
          // Example admin check (replace with your actual role logic)
          setIsAdmin(userProfile.role === 'admin'); // Assuming role is in your profile
        } else {
          // Profile might not exist yet, set basic user from Supabase
           const basicUser: User = {
            ...supabaseUser,
            user_metadata: supabaseUser.user_metadata || {},
            // Set defaults for missing profile fields
            username: supabaseUser.email?.split('@')[0],
            vip_level: 0,
          };
          setUser(basicUser);
          setIsAdmin(false);
        }
        if(userWallet.success && userWallet.data){
            setWallet(userWallet.data as Wallet);
        } else {
            setWallet(null);
        }

      } catch (error) {
        console.error("Error fetching user profile/wallet:", error);
        setUser(supabaseUser as User); // Fallback to Supabase user object
        setIsAdmin(false);
        setWallet(null);
      }
    } else {
      setUser(null);
      setIsAdmin(false);
      setWallet(null);
    }
  };

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      await fetchUserProfileAndWallet(currentSession?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, currentSession) => {
        setLoading(true);
        setSession(currentSession);
        await fetchUserProfileAndWallet(currentSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (credentials: { email: string; password?: string; provider?: 'google' | 'discord' }) => {
    setLoading(true);
    let response;
    if (credentials.provider) {
      response = await supabase.auth.signInWithOAuth({
        provider: credentials.provider,
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
    } else if (credentials.password) {
      response = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
    } else {
      throw new Error("Password or provider must be provided for sign in.");
    }
    
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user && response.data.session) {
      await fetchUserProfileAndWallet(response.data.user);
      toast.success("Signed in successfully!");
    } else if (!response.data.session && !credentials.provider) {
        // This case might indicate email confirmation pending for password sign-in
        toast.info("Please check your email to confirm your account.");
    }
    setLoading(false);
    return response;
  };

  const signUp = async (credentials: { email: string; password?: string; data?: object }) => {
    setLoading(true);
    const response = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password || '', // Supabase requires a password, even if it's to be overwritten or for OAuth later
      options: {
        data: credentials.data, // For additional user_metadata on signup
        emailRedirectTo: `${window.location.origin}/auth/welcome` // Or your desired welcome page
      }
    });
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user) {
       // User created, session might or might not be set depending on email confirmation settings
      if (response.data.session) {
        await fetchUserProfileAndWallet(response.data.user);
        toast.success("Account created and signed in!");
      } else {
        toast.success("Account created! Please check your email to confirm your registration.");
      }
    }
    setLoading(false);
    return response;
  };

  const signOut = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
    } else {
      setUser(null);
      setSession(null);
      setIsAdmin(false);
      setWallet(null);
      toast.success("Signed out successfully!");
    }
    setLoading(false);
  };
  
  const refreshUser = async () => {
    if (session?.user) {
        setLoading(true);
        await fetchUserProfileAndWallet(session.user);
        setLoading(false);
    }
  };

  const refreshWalletBalance = async () => {
    if (user) {
        const userWallet = await walletService.getWalletByUserId(user.id);
        if(userWallet.success && userWallet.data){
            setWallet(userWallet.data as Wallet);
        }
    }
  };

  const deposit = () => {
    // Placeholder for deposit functionality
    toast.info("Deposit functionality not yet implemented.");
    // Example: navigate('/deposit') or open a modal
  };


  return (
    <AuthContext.Provider value={{ isAuthenticated: !!user, user, session, loading, signIn, signUp, signOut, refreshUser, isAdmin, refreshWalletBalance, wallet, deposit }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
