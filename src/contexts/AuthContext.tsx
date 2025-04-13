
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  name?: string;
  avatarUrl?: string;
  vipLevel?: number;
  isVerified?: boolean;
  isAdmin?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin?: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (username: string, email: string, password: string) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  deposit?: (amount: number) => Promise<void>;
  adminLogin?: (email: string, password: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  register: async () => {},
  updateBalance: () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Check for user on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('casino_user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    } else {
      // Create a demo user for testing
      const demoUser = {
        id: 'guest',
        username: 'Demo User',
        email: 'demo@example.com',
        balance: 1000,
        name: 'Demo User',
        vipLevel: 1,
        isVerified: true,
        isAdmin: true
      };
      setUser(demoUser);
      setIsAuthenticated(true);
      localStorage.setItem('casino_user', JSON.stringify(demoUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Demo login function
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username: email.split('@')[0],
      email,
      balance: 1000,
      name: email.split('@')[0],
      vipLevel: 1,
      isVerified: true,
      isAdmin: email.includes('admin')
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('casino_user', JSON.stringify(mockUser));
  };

  const adminLogin = async (email: string, password: string) => {
    // Demo admin login function
    const mockAdminUser = {
      id: 'admin_' + Math.random().toString(36).substring(2, 9),
      username: email.split('@')[0],
      email,
      balance: 10000,
      name: 'Admin User',
      vipLevel: 10,
      isVerified: true,
      isAdmin: true
    };
    setUser(mockAdminUser);
    setIsAuthenticated(true);
    localStorage.setItem('casino_user', JSON.stringify(mockAdminUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('casino_user');
  };

  const register = async (username: string, email: string, password: string) => {
    // Demo register function
    const mockUser = {
      id: 'user_' + Math.random().toString(36).substring(2, 9),
      username,
      email,
      balance: 1000,
      name: username,
      vipLevel: 1,
      isVerified: false,
      isAdmin: false
    };
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('casino_user', JSON.stringify(mockUser));
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('casino_user', JSON.stringify(updatedUser));
    }
  };

  const deposit = async (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      updateBalance(newBalance);
    }
  };

  // Compute isAdmin from user property
  const isAdmin = user?.isAdmin || false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        register,
        updateBalance,
        deposit,
        adminLogin
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
