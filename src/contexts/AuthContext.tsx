
import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { walletService } from '@/services/walletService';

// Define the AuthUser type
export interface AuthUser extends User {
  name?: string;
  username?: string;
  email: string;
  balance?: number;
  isAdmin?: boolean;
  avatarUrl?: string;
  vipLevel?: number;
  isVerified?: boolean;
}

// Define types for our context
interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  walletBalance: number;
  vipLevel: number;
  session: Session | null;
  login: (email: string, password: string) => Promise<{ error: any }>;
  register: (email: string, password: string, username: string) => Promise<{ error: any }>;
  adminLogin: (username: string, password: string) => Promise<void>;
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
  adminLogin: async () => {},
  logout: async () => {},
  refreshWalletBalance: async () => {},
});

// Create a provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [vipLevel, setVipLevel] = useState<number>(0);

  useEffect(() => {
    // Set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser: AuthUser = {
            ...session.user,
            isAdmin: session.user.email?.endsWith('@admin.com') || 
                    session.user.user_metadata?.isAdmin || false
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        
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
      if (session?.user) {
        const authUser: AuthUser = {
          ...session.user,
          isAdmin: session.user.email?.endsWith('@admin.com') || 
                  session.user.user_metadata?.isAdmin || false
        };
        setUser(authUser);
      } else {
        setUser(null);
      }
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

  const adminLogin = async (username: string, password: string) => {
    // For demo purposes, we're using a hardcoded admin credential
    if (username === 'admin' && password === 'admin') {
      // Create a custom session for admin
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: 'admin@admin.com',
          password: 'admin123' // This should be a real password in your DB
        });
        
        if (error) {
          throw error;
        }
        
        if (data.user) {
          // Force admin flag regardless of what came back
          const adminUser: AuthUser = {
            ...data.user,
            isAdmin: true,
            username: 'Administrator',
            name: 'System Administrator',
          };
          setUser(adminUser);
          await refreshWalletBalance();
        }
      } catch (error) {
        // Fallback for demo purposes if the admin@admin.com account doesn't exist
        // In production, you should remove this and just throw the error
        console.warn("Using demo admin mode since admin@admin.com account doesn't exist");
        const demoAdminUser: AuthUser = {
          id: 'admin-demo-id',
          email: 'admin@admin.com',
          isAdmin: true,
          username: 'Administrator',
          name: 'System Administrator',
          app_metadata: {},
          user_metadata: { isAdmin: true },
          aud: 'authenticated',
          created_at: new Date().toISOString(),
          role: 'admin',
          confirmed_at: new Date().toISOString(),
          last_sign_in_at: new Date().toISOString(),
        };
        setUser(demoAdminUser);
        // Create fake session
        const fakeSession = {
          access_token: 'demo-token',
          refresh_token: 'demo-refresh',
          expires_in: 3600,
          expires_at: Date.now() + 3600000,
          token_type: 'bearer',
          user: demoAdminUser
        };
        setSession(fakeSession as any);
      }
    } else {
      throw new Error("Invalid admin credentials");
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setWalletBalance(0);
    setVipLevel(0);
  };

  const refreshWalletBalance = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await walletService.getWalletByUserId(user.id);
      
      if (error) {
        console.error('Error refreshing wallet balance:', error);
        return;
      }
      
      if (data) {
        setWalletBalance(data.balance || 0);
        setVipLevel(data.vip_level || 0);
        
        // Update user with wallet information
        if (user) {
          setUser({
            ...user,
            balance: data.balance || 0,
            vipLevel: data.vip_level || 0
          });
        }
      }
    } catch (error) {
      console.error('Error refreshing wallet balance:', error);
    }
  };

  // Check if user is admin
  const isAdmin = user?.isAdmin || false;

  const value = {
    user,
    isAuthenticated: !!user,
    isAdmin,
    walletBalance,
    vipLevel,
    session,
    login,
    register,
    adminLogin,
    logout,
    refreshWalletBalance,
  };

  return (
    <AuthContext.Provider value={value}>
      {!isLoading && children}
    </AuthContext.Provider>
  );
};

// Create a custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Export types
export type { AuthContextType };
