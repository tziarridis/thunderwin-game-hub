
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, AppUser, UserRole } from '@/types/user';

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
    user_metadata: {
      username: 'admin',
      full_name: 'Demo Admin',
      currency: 'USD',
      language: 'en',
      vip_level: 5,
      kyc_status: 'verified',
      bonus_points: 500
    },
    app_metadata: {
      role: 'admin',
      provider: 'email'
    }
  };

  useEffect(() => {
    // Simulate loading and set demo user
    const timer = setTimeout(() => {
      setUser(demoAdminUser);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const signOut = async () => {
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    isAdmin: user?.role === UserRole.ADMIN,
    error,
    signOut
  };

  console.log('AuthContext - Current context value:', {
    isAuthenticated: value.isAuthenticated,
    isAdmin: value.isAdmin,
    hasUser: !!value.user,
    isLoading: value.isLoading
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
