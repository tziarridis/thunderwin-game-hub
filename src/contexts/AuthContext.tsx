
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AppUser, UserRole } from '@/types/user';
import { toast } from 'sonner';

export interface AuthContextType {
  user: AppUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  error?: string | null;
  login?: (credentials: any) => Promise<any>;
  register?: (credentials: any) => Promise<any>;
  logout?: () => Promise<void>;
  signOut?: () => Promise<void>;
  updateUserPassword?: (newPassword: string) => Promise<void>;
  fetchAndUpdateUser?: () => Promise<void>;
  wallet?: any;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mock demo admin user
  const demoAdminUser: AppUser = {
    id: 'demo-admin-id',
    username: 'admin',
    email: 'admin@demo.com',
    role: UserRole.ADMIN,
    status: 'active',
    created_at: new Date().toISOString(),
    is_active: true,
    balance: 1000,
    currency: 'USD',
    vipLevel: 5,
    vipPoints: 1000,
    kycStatus: 'verified',
    user_metadata: {
      username: 'admin',
      full_name: 'Demo Admin',
      currency: 'USD',
      language: 'en',
      vip_level: 5,
      kyc_status: 'verified',
      bonus_points: 500,
      name: 'Demo Admin'
    },
    app_metadata: {
      role: 'admin',
      provider: 'email'
    }
  };

  useEffect(() => {
    // Simulate loading and set demo user
    const timer = setTimeout(() => {
      try {
        setUser(demoAdminUser);
        setError(null);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
        toast.error('Authentication initialization failed');
      } finally {
        setIsLoading(false);
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signOut = async () => {
    try {
      setUser(null);
      setError(null);
    } catch (err) {
      console.error('Sign out error:', err);
      setError('Failed to sign out');
      throw err;
    }
  };

  const updateUserPassword = async (newPassword: string) => {
    try {
      // Mock password update
      console.log('Password updated for user:', user?.id);
      toast.success('Password updated successfully');
    } catch (err) {
      console.error('Password update error:', err);
      throw new Error('Failed to update password');
    }
  };

  const fetchAndUpdateUser = async () => {
    try {
      // Mock user refresh
      console.log('User data refreshed');
    } catch (err) {
      console.error('User refresh error:', err);
      throw new Error('Failed to refresh user data');
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === UserRole.ADMIN,
    error,
    signOut,
    updateUserPassword,
    fetchAndUpdateUser,
    wallet: user ? {
      balance: user.balance || 0,
      currency: user.currency || 'USD',
      symbol: '$',
      bonusBalance: 0
    } : null
  };

  console.log('AuthContext - Current context value:', {
    isAuthenticated: value.isAuthenticated,
    isAdmin: value.isAdmin,
    hasUser: !!value.user,
    isLoading: value.isLoading,
    error: value.error
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
