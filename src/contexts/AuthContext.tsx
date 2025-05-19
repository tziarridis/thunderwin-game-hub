import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, Wallet } from '@/types'; 
import { userService } from '@/services/userService'; 
import { walletService } from '@/services/walletService'; 
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; 
  session: Session | null;
  loading: boolean;
  isAdmin: boolean; 
  signIn: (credentials: { email: string; password?: string; provider?: 'google' | 'discord' }) => Promise<any>;
  signUp: (credentials: { email: string; password?: string; data?:object }) => Promise<any>;
  signOut: () => Promise<void>; 
  refreshUser: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>; 
  wallet: Wallet | null; 
  deposit?: () => void; // Made optional as it might be a placeholder
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
        const userProfilePromise = userService.getUserProfile(supabaseUser.id);
        const userWalletPromise = walletService.getWalletByUserId(supabaseUser.id);

        const [userProfileResult, userWalletResult] = await Promise.allSettled([userProfilePromise, userWalletPromise]);
        
        let appUser: User | null = null;

        if (userProfileResult.status === 'fulfilled' && userProfileResult.value) {
          const profile = userProfileResult.value;
          appUser = {
            ...supabaseUser, 
            ...profile, 
            // Ensure properties from SupabaseUser and profile are correctly typed and merged into User
            id: supabaseUser.id, // Critical: ensure User type expects this from SupabaseUser
            email: supabaseUser.email,
            // Example of merging:
            username: profile.username || supabaseUser.email?.split('@')[0],
            role: profile.role || supabaseUser.role || 'user',
            vip_level: profile.vip_level || 0,
            user_metadata: {
                ...(supabaseUser.user_metadata || {}),
                ...(profile.user_metadata || {}),
                name: profile.user_metadata?.name || profile.first_name || supabaseUser.user_metadata?.full_name,
                first_name: profile.first_name || profile.user_metadata?.first_name,
                last_name: profile.last_name || profile.user_metadata?.last_name,
                avatar_url: profile.user_metadata?.avatar_url || supabaseUser.user_metadata?.avatar_url,
            },
            // other direct fields from profile if they exist
            status: profile.status,
            banned: profile.banned,
          };
        } else {
           // Fallback if profile fetch fails or returns null
           appUser = {
            ...supabaseUser,
            id: supabaseUser.id,
            email: supabaseUser.email,
            user_metadata: supabaseUser.user_metadata || {},
            username: supabaseUser.email?.split('@')[0],
            vip_level: 0,
            role: supabaseUser.role || 'user',
          };
        }
        setUser(appUser);
        setIsAdmin(appUser?.role === 'admin'); 

        if(userWalletResult.status === 'fulfilled' && userWalletResult.value?.success && userWalletResult.value.data){
            setWallet(userWalletResult.value.data as Wallet);
        } else {
            setWallet(null);
            if (userWalletResult.status === 'rejected') {
                 console.warn("Failed to fetch wallet:", userWalletResult.reason);
            } else if (userWalletResult.value && !userWalletResult.value.success) {
                 console.warn("Wallet service reported no success:", userWalletResult.value.error);
            }
        }

      } catch (error) { // Catch errors from Promise.allSettled if any other logic throws
        console.error("Error processing user profile/wallet results:", error);
        const fallbackUser: User = {
            ...supabaseUser,
            id: supabaseUser.id,
            email: supabaseUser.email,
            user_metadata: supabaseUser.user_metadata || {},
            username: supabaseUser.email?.split('@')[0],
            vip_level: 0,
            role: supabaseUser.role || 'user',
        };
        setUser(fallbackUser);
        setIsAdmin(fallbackUser?.role === 'admin');
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
      subscription?.unsubscribe();
    };
  }, []); // Ensure empty dependency array for mount/unmount logic

  const signIn = async (credentials: { email: string; password?: string; provider?: 'google' | 'discord' }) => {
    setLoading(true);
    let response;
    if (credentials.provider) {
      response = await supabase.auth.signInWithOAuth({
        provider: credentials.provider,
        options: { redirectTo: `${window.location.origin}/` } // Ensure redirect is to a valid app page
      });
    } else if (credentials.password) {
      response = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
    } else {
      setLoading(false); 
      toast.error("Password or provider must be provided for sign in.");
      throw new Error("Password or provider must be provided for sign in.");
    }
    
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user && response.data.session) {
      toast.success("Signed in successfully!");
    } else if (!response.data.session && !credentials.provider && response.data.user) { // User exists but no session (email confirmation pending)
        toast.info("Please check your email to confirm your account.");
    }
    setLoading(false);
    return response;
  };

  const signUp = async (credentials: { email: string; password?: string; data?: object }) => {
    setLoading(true);
    const response = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password || '', 
      options: {
        data: credentials.data, 
        emailRedirectTo: `${window.location.origin}/` // Ensure redirect is to a valid app page
      }
    });
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user) {
      if (response.data.session) {
        toast.success("Account created and signed in!");
      } else { // Email confirmation needed
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
      toast.success("Signed out successfully!");
      // State clearing (user, session, wallet, isAdmin) is handled by onAuthStateChange
    }
    setLoading(false);
  };
  
  const refreshUser = async () => {
    const { data: { user: currentSupabaseUser } } = await supabase.auth.getUser();
    if (currentSupabaseUser) {
        setLoading(true);
        await fetchUserProfileAndWallet(currentSupabaseUser);
        setLoading(false);
    }
  };

  const refreshWalletBalance = async () => {
    if (user?.id) { // Check if user object and user.id exists
        const userWalletResult = await walletService.getWalletByUserId(user.id);
        if(userWalletResult.success && userWalletResult.data){
            setWallet(userWalletResult.data as Wallet);
        } else {
            console.warn("Failed to refresh wallet balance:", userWalletResult.error);
        }
    }
  };

  const deposit = () => {
    toast.info("Deposit functionality placeholder.");
    // Example: navigate('/wallet/deposit');
  };


  return (
    <AuthContext.Provider value={{ 
        isAuthenticated: !!user, 
        user, 
        session, 
        loading, 
        signIn, 
        signUp, 
        signOut, 
        refreshUser, 
        isAdmin, 
        refreshWalletBalance, 
        wallet, 
        deposit 
    }}>
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
