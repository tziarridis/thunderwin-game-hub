
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

// Define types for our context
interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  walletBalance: number;
  vipLevel: number;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any }>;
  logout: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  walletBalance: 0,
  vipLevel: 0,
  session: null,
  login: async () => ({ error: null }),
  register: async () => ({ error: null }),
  logout: async () => {},
  refreshWalletBalance: async () => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [vipLevel, setVipLevel] = useState<number>(0);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        // Don't trigger wallet fetch in the listener to avoid deadlocks
        if (session?.user) {
          setTimeout(() => {
            refreshWalletBalance();
          }, 0);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
      
      // Fetch wallet data if user is logged in
      if (session?.user) {
        refreshWalletBalance();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        return { error };
      }
      
      await refreshWalletBalance();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const register = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        return { error };
      }
      
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setWalletBalance(0);
    setVipLevel(0);
  };

  const refreshWalletBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) {
        console.error('Error refreshing wallet balance:', error);
        return;
      }
      
      if (data) {
        setWalletBalance(data.balance || 0);
        setVipLevel(data.vip_level || 0);
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  };

  // Check if user is admin
  const isAdmin = user?.user_metadata?.isAdmin || user?.email?.endsWith('@admin.com') || false;

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    walletBalance,
    vipLevel,
    session,
    login,
    register,
    logout,
    refreshWalletBalance,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Export types
export type { AuthContextType };
