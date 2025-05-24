
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { AppUser, UserRole, LoginCredentials } from '@/types';

export interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loading: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<{ error?: { message: string } }>;
  signUp: (email: string, password: string, username?: string) => Promise<{ error?: { message: string } }>;
  signOut: () => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<{ error?: { message: string } }>;
  adminLogin: (credentials: LoginCredentials) => Promise<{ error?: { message: string } }>;
  refreshWalletBalance?: () => Promise<void>;
  updateUserPassword?: (newPassword: string) => Promise<{ error?: { message: string } }>;
  fetchAndUpdateUser?: (updates: Partial<AppUser>) => Promise<void>;
  wallet?: {
    balance: number;
    currency: string;
    symbol: string;
  };
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
  const [error, setError] = useState<string | null>(null);

  const isAdmin = user?.role === UserRole.ADMIN || user?.user_metadata?.name === 'admin';

  const signIn = async (email: string, password: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) return { error: { message: error.message } };
      return {};
    } catch (error: any) {
      setError(error.message);
      return { error: { message: error.message } };
    }
  };

  const signUp = async (email: string, password: string, username?: string) => {
    try {
      setError(null);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username || email.split('@')[0],
          }
        }
      });
      
      if (error) return { error: { message: error.message } };
      return {};
    } catch (error: any) {
      setError(error.message);
      return { error: { message: error.message } };
    }
  };

  const register = signUp; // Alias for signUp

  const adminLogin = async (credentials: LoginCredentials) => {
    return signIn(credentials.email, credentials.password);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setError(null);
  };

  const logout = signOut; // Alias for signOut

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

  const updateUserPassword = async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) return { error: { message: error.message } };
      return {};
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const fetchAndUpdateUser = async (updates: Partial<AppUser>) => {
    if (!user) return;
    
    try {
      const { error } = await supabase.auth.updateUser({
        data: updates
      });
      
      if (!error) {
        setUser(prev => prev ? { ...prev, ...updates } : null);
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const mapSupabaseUserToAppUser = (supabaseUser: SupabaseUser): AppUser => {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0] || '',
      name: supabaseUser.user_metadata?.username || supabaseUser.user_metadata?.full_name,
      role: UserRole.USER,
      status: 'active',
      created_at: supabaseUser.created_at || new Date().toISOString(),
      updated_at: supabaseUser.updated_at || new Date().toISOString(),
      first_name: supabaseUser.user_metadata?.first_name,
      last_name: supabaseUser.user_metadata?.last_name,
      avatar_url: supabaseUser.user_metadata?.avatar_url,
      is_active: true,
      last_sign_in_at: supabaseUser.last_sign_in_at,
      user_metadata: {
        ...supabaseUser.user_metadata,
        name: supabaseUser.user_metadata?.username || supabaseUser.user_metadata?.full_name,
      },
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
        setError('Failed to initialize authentication');
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
    loading: isLoading,
    isAdmin,
    error,
    signIn,
    signUp,
    signOut,
    logout,
    register,
    adminLogin,
    refreshWalletBalance,
    updateUserPassword,
    fetchAndUpdateUser,
    wallet: user?.wallet,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
