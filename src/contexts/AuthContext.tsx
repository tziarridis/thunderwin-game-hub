
import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { LoginCredentials, RegisterCredentials, AppUser } from '@/types';

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isLoading: boolean;
  loading: boolean; // Add backward compatibility
  isAuthenticated: boolean;
  isAdmin: boolean;
  error: string | null;
  signIn: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>;
  login: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>; // Add backward compatibility
  adminLogin: (credentials: LoginCredentials) => Promise<{ error?: AuthError }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ error?: AuthError }>;
  register: (credentials: RegisterCredentials) => Promise<{ error?: AuthError }>; // Add backward compatibility
  signOut: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
        });
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        setUser({
          id: session.user.id,
          email: session.user.email || '',
          user_metadata: session.user.user_metadata,
          app_metadata: session.user.app_metadata,
        });
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
      const { error } = await supabase.auth.signInWithPassword(credentials);
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

  const isAuthenticated = !!session;
  const isAdmin = user?.app_metadata?.role === 'admin' || false;

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
