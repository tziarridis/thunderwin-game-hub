
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
  isAdmin: boolean; // Changed from optional
  signIn: (credentials: { email: string; password?: string; provider?: 'google' | 'discord' }) => Promise<any>;
  signUp: (credentials: { email: string; password?: string; data?:object }) => Promise<any>;
  signOut: () => Promise<void>; 
  refreshUser: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>; 
  wallet: Wallet | null; 
  deposit: () => void; // Kept as non-optional based on previous fixes
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
        // Pass supabaseUser.id directly
        const userProfilePromise = userService.getUserProfile(supabaseUser.id);
        const userWalletPromise = walletService.getWalletByUserId(supabaseUser.id);

        const [userProfileResult, userWalletResult] = await Promise.all([userProfilePromise, userWalletPromise]);
        
        const userProfile = userProfileResult; // Assuming userService.getUserProfile directly returns User profile or null

        if (userProfile) {
          const appUser: User = {
            ...supabaseUser, 
            ...userProfile, 
            username: userProfile.username || supabaseUser.email?.split('@')[0],
            vip_level: userProfile.vip_level || 0,
            role: userProfile.role || supabaseUser.role || 'user', // Prioritize profile role
            // Ensure user_metadata is merged correctly if profile has its own metadata
            user_metadata: {
                ...supabaseUser.user_metadata,
                ...userProfile.user_metadata, // Profile metadata takes precedence
                name: userProfile.user_metadata?.name || userProfile.first_name || supabaseUser.user_metadata?.full_name,
                first_name: userProfile.first_name || userProfile.user_metadata?.first_name,
                last_name: userProfile.last_name || userProfile.user_metadata?.last_name,
                avatar_url: userProfile.user_metadata?.avatar_url || supabaseUser.user_metadata?.avatar_url,
            },
            // Add other direct fields from profile if they exist
            status: userProfile.status,
            banned: userProfile.banned,
            // role_id: userProfile.role_id, // If you store role_id
          };
          setUser(appUser);
          setIsAdmin(appUser.role === 'admin'); 
        } else {
           const basicUser: User = {
            ...supabaseUser,
            user_metadata: supabaseUser.user_metadata || {},
            username: supabaseUser.email?.split('@')[0],
            vip_level: 0,
            role: supabaseUser.role || 'user',
          };
          setUser(basicUser);
          setIsAdmin(basicUser.role === 'admin');
        }

        if(userWalletResult.success && userWalletResult.data){
            setWallet(userWalletResult.data as Wallet);
        } else {
            setWallet(null);
            // console.warn("Failed to fetch wallet or no wallet found:", userWalletResult.error);
        }

      } catch (error) {
        console.error("Error fetching user profile/wallet:", error);
        // Fallback to Supabase user object, ensure it conforms to User type
        const fallbackUser: User = {
            ...supabaseUser,
            user_metadata: supabaseUser.user_metadata || {},
            username: supabaseUser.email?.split('@')[0],
            vip_level: 0,
            role: supabaseUser.role || 'user',
        };
        setUser(fallbackUser);
        setIsAdmin(fallbackUser.role === 'admin');
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
      setLoading(false); // Ensure loading is set to false in case of error
      toast.error("Password or provider must be provided for sign in.");
      throw new Error("Password or provider must be provided for sign in.");
    }
    
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user && response.data.session) {
      // User profile and wallet are fetched by onAuthStateChange listener
      // await fetchUserProfileAndWallet(response.data.user); // Can be redundant if onAuthStateChange handles it
      toast.success("Signed in successfully!");
    } else if (!response.data.session && !credentials.provider) {
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
        emailRedirectTo: `${window.location.origin}/auth/welcome` 
      }
    });
    if (response.error) {
      toast.error(response.error.message);
    } else if (response.data.user) {
      if (response.data.session) {
        // await fetchUserProfileAndWallet(response.data.user); // Redundant if onAuthStateChange handles it
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
      // State clearing is handled by onAuthStateChange listener
      toast.success("Signed out successfully!");
    }
    setLoading(false);
  };
  
  const refreshUser = async () => {
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    if (currentSession?.user) {
        setLoading(true);
        await fetchUserProfileAndWallet(currentSession.user);
        setLoading(false);
    }
  };

  const refreshWalletBalance = async () => {
    if (user) { // Check if user object exists
        const userWalletResult = await walletService.getWalletByUserId(user.id);
        if(userWalletResult.success && userWalletResult.data){
            setWallet(userWalletResult.data as Wallet);
        } else {
            // console.warn("Failed to refresh wallet balance:", userWalletResult.error);
        }
    }
  };

  const deposit = () => {
    toast.info("Deposit functionality placeholder. Navigate or open modal here.");
    // Example: navigate('/wallet/deposit');
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

