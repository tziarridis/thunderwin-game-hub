
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AppUser, UserRole } from '@/types';

export interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshWalletBalance?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error: error.message };
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          }
        }
      });
      
      if (error) return { error: error.message };
      return {};
    } catch (error: any) {
      return { error: error.message };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const refreshWalletBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('wallets')
        .select('balance, currency, symbol')
        .eq('user_id', user.id)
        .eq('active', true)
        .single();

      if (!error && data) {
        setUser(prev => prev ? {
          ...prev,
          wallet: {
            balance: data.balance,
            currency: data.currency,
            symbol: data.symbol
          }
        } : null);
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  };

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): AppUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
      role: UserRole.USER,
      status: 'active',
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString(),
      user_metadata: supabaseUser.user_metadata,
    };
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const appUser = mapSupabaseUserToAppUser(session.user);
          setUser(appUser);
          await refreshWalletBalance();
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const appUser = mapSupabaseUserToAppUser(session.user);
          setUser(appUser);
          if (event === 'SIGNED_IN') {
            await refreshWalletBalance();
          }
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    signIn,
    signUp,
    signOut,
    refreshWalletBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
