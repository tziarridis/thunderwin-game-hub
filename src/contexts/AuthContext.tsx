
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Wallet } from '@/types/wallet'; // Assuming Wallet type exists
import { userService } from '@/services/userService'; // Assuming userService exists
import { User } from '@/types'; // Assuming your app's User type

export interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null; // Your app's User type
  supabaseUser: SupabaseUser | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<any>;
  register: (email: string, password: string, username: string) => Promise<any>;
  logout: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>; // Added this
  wallet: Wallet | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);

  const fetchWallet = async (appUserId: string) => {
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('id, user_id, balance, currency, symbol, vip_level, vip_points, active, balance_bonus, balance_cryptocurrency, balance_demo, last_transaction_date')
        .eq('user_id', appUserId)
        .single();

      if (error) {
        console.error("Error fetching wallet in AuthContext:", error.message);
        setWallet(null);
      } else if (data) {
        setWallet({
          id: data.id,
          userId: data.user_id,
          balance: data.balance ?? 0,
          currency: data.currency || 'USD',
          symbol: data.symbol || '$',
          vipLevel: data.vip_level ?? 0,
          vipPoints: data.vip_points ?? 0,
          bonusBalance: data.balance_bonus ?? 0,
          cryptoBalance: data.balance_cryptocurrency ?? 0,
          demoBalance: data.balance_demo ?? 0,
          isActive: data.active ?? false,
          lastTransactionDate: data.last_transaction_date ? new Date(data.last_transaction_date) : null,
        });
      } else {
        setWallet(null);
      }
    } catch (err: any) {
      console.error("Error in AuthContext wallet fetch:", err.message);
      setWallet(null);
    }
  };
  
  const refreshWalletBalance = async () => {
    if (user?.id) {
      await fetchWallet(user.id);
    }
  };

  const fetchCurrentUser = async (currentSession?: Session | null) => {
    setIsLoading(true);
    const sessionToUse = currentSession !== undefined ? currentSession : session;

    if (sessionToUse?.user) {
      setSupabaseUser(sessionToUse.user);
      try {
        // Fetch your application-specific user data
        const appUser = await userService.getUserByAuthId(sessionToUse.user.id);
        if (appUser) {
          setUser(appUser);
          await fetchWallet(appUser.id); // Fetch wallet after app user is set
        } else {
          // This case might happen if the user exists in auth.users but not your public.users table
          // Or if there's a delay in the handle_new_user trigger.
          // For now, log it. Consider creating the app user profile here if appropriate.
          console.warn("App user not found for authenticated Supabase user:", sessionToUse.user.id);
          setUser(null);
          setWallet(null);
        }
      } catch (error) {
        console.error("Error fetching current user data:", error);
        setUser(null);
        setWallet(null);
      }
    } else {
      setSupabaseUser(null);
      setUser(null);
      setWallet(null);
    }
    setIsLoading(false);
  };
  
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("Auth state changed:", _event, session);
      setSession(session);
      await fetchCurrentUser(session);
    });

    // Initial check
    supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        fetchCurrentUser(session);
    });
    
    return () => {
      authListener?.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setIsLoading(false);
      throw error;
    }
    if (data.session) {
      setSession(data.session);
      await fetchCurrentUser(data.session);
    }
    setIsLoading(false);
    return data;
  };

  const register = async (email: string, password: string, username: string) => {
    setIsLoading(true);
    // Supabase auth sign up, the trigger will handle creating the public.users record
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { // This data is passed to the handle_new_user trigger if needed or stored in auth.users.raw_user_meta_data
          username: username,
        }
      }
    });

    if (error) {
      setIsLoading(false);
      throw error;
    }
    // After successful Supabase auth sign-up, fetch user details.
    // The onAuthStateChange listener should also pick this up, but an explicit call can be faster.
    if (data.session) {
        setSession(data.session);
        await fetchCurrentUser(data.session);
    } else if (data.user && !data.session) {
        // User created but session might not be active yet (e.g. email confirmation required)
        // For now, we will proceed as if fetchCurrentUser will handle it.
        // Depending on your flow (e.g. auto-login after confirm), this might need adjustment.
        await fetchCurrentUser(null); // fetch with null session if user exists but no session
    }
    setIsLoading(false);
    return data;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setSupabaseUser(null);
    setSession(null);
    setWallet(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated: !!user && !!session, 
      user, 
      supabaseUser,
      session, 
      isLoading, 
      login, 
      register, 
      logout,
      fetchCurrentUser,
      refreshWalletBalance, // Provide the function
      wallet
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
