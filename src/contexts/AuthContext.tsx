
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface User {
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

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin?: boolean; // Added isAdmin property
  login: (username: string, password: string) => Promise<User>;
  register: (username: string, email: string, password: string) => Promise<User>;
  logout: () => void;
  adminLogin: (username: string, password: string) => Promise<User>;
  deposit: (amount: number) => Promise<number>;
  updateBalance: (newBalance: number) => void; // Added updateBalance method
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isAdmin: false, // Default value for isAdmin
  login: async () => { throw new Error('Not implemented'); },
  register: async () => { throw new Error('Not implemented'); },
  logout: () => {},
  adminLogin: async () => { throw new Error('Not implemented'); },
  deposit: async () => { throw new Error('Not implemented'); },
  updateBalance: () => {} // Default implementation for updateBalance
});

export const useAuth = () => useContext(AuthContext);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Attempt to restore user session from localStorage on initial load
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Failed to parse stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }, []);

  // Added new updateBalance method
  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const login = async (username: string, password: string): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // For demo purposes, allow any username/password with some constraints
    if (password.length < 4) {
      throw new Error('Password must be at least 4 characters');
    }

    // Create a demo user
    const user: User = {
      id: '1',
      username,
      email: `${username}@example.com`,
      balance: 1000,
      name: username,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username,
      vipLevel: 1,
      isVerified: false,
      isAdmin: username === 'admin'
    };

    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  };

  const register = async (username: string, email: string, password: string): Promise<User> => {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Validation
    if (username.length < 3) {
      throw new Error('Username must be at least 3 characters');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters');
    }
    
    if (!email.includes('@')) {
      throw new Error('Please enter a valid email address');
    }
    
    // Create a new user
    const user: User = {
      id: Math.random().toString(36).substring(2, 11),
      username,
      email,
      balance: 1000, // Starting balance for new users
      name: username,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + username,
      vipLevel: 1,
      isVerified: false,
      isAdmin: false
    };
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  };

  const adminLogin = async (username: string, password: string): Promise<User> => {
    // For demo, only 'admin' with password 'adminpass' can log in as admin
    if (username !== 'admin' || password !== 'adminpass') {
      throw new Error('Invalid admin credentials');
    }
    
    const user: User = {
      id: 'admin-1',
      username: 'admin',
      email: 'admin@thunderwin.com',
      balance: 10000,
      name: 'Admin User',
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      vipLevel: 10,
      isVerified: true,
      isAdmin: true
    };
    
    setUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(user));
    
    return user;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const deposit = async (amount: number): Promise<number> => {
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    if (amount <= 0) {
      throw new Error('Deposit amount must be greater than 0');
    }
    
    // Update user's balance
    const newBalance = user.balance + amount;
    const updatedUser = { ...user, balance: newBalance };
    
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    return newBalance;
  };

  const value = {
    user,
    isAuthenticated,
    isAdmin: user?.isAdmin || false, // Add isAdmin property to context value
    login,
    register,
    logout,
    adminLogin,
    deposit,
    updateBalance // Add updateBalance to context value
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
