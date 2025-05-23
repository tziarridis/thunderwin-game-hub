
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { LoginCredentials, RegisterCredentials, AppUser, User as AppUserType } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // Backward compatibility
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>;
  login: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>; // Backward compatibility
  adminLogin: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ error?: AuthError }>;
  register: (credentials: RegisterCredentials) => Promise<{ error?: AuthError }>; // Backward compatibility
  signOut: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;
  updateUserPassword: (newPassword: string) => Promise<{ error?: AuthError }>;
  fetchAndUpdateUser: (userData: Partial<AppUserType>) => Promise<void>;
  wallet?: any; // Added for backward compatibility
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [wallet, setWallet] = useState<any>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const userData: AppUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
          created_at: new Date().toISOString(), // Default value to satisfy type requirement
        };
        setUser(userData);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        const userData: AppUser = {
          id: session.user.id,
          email: session.user.email || '',
          username: session.user.user_metadata?.username || session.user.email?.split('@')[0],
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
          created_at: new Date().toISOString(), // Default value to satisfy type requirement
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (credentials: LoginCredentials) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });
      if (error) {
        setError(error.message);
        return { error };
      }
      return {};
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const adminLogin = async (credentials: LoginCredentials) => {
    // For now, use the same sign in method
    // In a real app, you'd check admin roles after sign in
    return signIn(credentials);
  };

  const signUp = async (credentials: RegisterCredentials) => {
    try {
      setError(null);
      const { error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            confirmPassword: credentials.confirmPassword // Adding confirmPassword to user_metadata
          },
        },
      });
      if (error) {
        setError(error.message);
        return { error };
      }
      return {};
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      setError(null);
      await supabase.auth.signOut();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const refreshWalletBalance = async () => {
    // Mock implementation
    console.log('Refreshing wallet balance...');
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      setError(null);
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        setError(error.message);
        return { error };
      }
      return {};
    } catch (err: any) {
      setError(err.message);
      return { error: err };
    }
  };

  const fetchAndUpdateUser = async (userData: Partial<AppUserType>) => {
    try {
      setError(null);
      // For now, this is a mock implementation
      // In a real app, you'd update the user profile in the database
      console.log('Updating user data:', userData);
      setUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const isAuthenticated = !!session;
  const isAdmin = user?.app_metadata?.role === 'admin' || false;

  // Create context value object with all methods
  const value: AuthContextType = {
    user,
    session,
    isLoading,
    loading: isLoading, // Backward compatibility
    isAuthenticated,
    isAdmin,
    error,
    signIn,
    login: signIn, // Backward compatibility
    adminLogin,
    signUp,
    register: signUp, // Backward compatibility
    signOut,
    refreshWalletBalance,
    updateUserPassword,
    fetchAndUpdateUser,
    wallet, // Added for backward compatibility
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

// Export AppUser type for components that need it
export type { AppUser };
