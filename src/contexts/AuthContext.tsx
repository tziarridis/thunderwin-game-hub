
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';

// Define types
type User = {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  balance: number;
  currency: string;
  avatarUrl?: string;
  name?: string;
  vipLevel?: number;
  isVerified?: boolean;
};

type AuthContextType = {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  isAdmin?: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateUserBalance: (amount: number) => void;
  adminLogin?: (email: string, password: string) => Promise<boolean>;
  deposit?: (amount: number) => void;
  updateBalance?: (amount: number) => void;
};

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Sample admin user for development
const adminUser: User = {
  id: '1',
  username: 'admin',
  email: 'admin@example.com',
  isAdmin: true,
  balance: 1000,
  currency: 'EUR',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
  name: 'Admin User',
  vipLevel: 5,
  isVerified: true
};

// Sample regular user for development
const regularUser: User = {
  id: '2',
  username: 'player1',
  email: 'player@example.com',
  isAdmin: false,
  balance: 500,
  currency: 'EUR',
  avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=player',
  name: 'Player One',
  vipLevel: 2,
  isVerified: false
};

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Check if user is already logged in (from localStorage)
  useEffect(() => {
    const checkAuth = () => {
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
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Update user balance (for gameplay)
  const updateUserBalance = (amount: number) => {
    if (user) {
      const newBalance = user.balance + amount;
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      if (amount > 0) {
        toast.success(`+${amount} ${user.currency} added to your balance`);
      } else if (amount < 0) {
        toast.info(`${amount} ${user.currency} deducted from your balance`);
      }
    }
  };

  // Aliases for updateUserBalance for compatibility with different components
  const updateBalance = updateUserBalance;
  const deposit = (amount: number) => updateUserBalance(amount);

  // Login function
  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call with a 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Simple logic for demo: if email contains "admin", login as admin
      let userData: User;
      
      if (email.includes('admin')) {
        userData = { ...adminUser };
      } else {
        userData = { ...regularUser };
        
        // Set the username based on email (for demo)
        if (email) {
          userData.email = email;
          userData.username = email.split('@')[0];
          userData.name = email.split('@')[0];
          userData.avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`;
        }
      }
      
      setUser(userData);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast.success(`Welcome back, ${userData.username}!`);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check your credentials.');
      setLoading(false);
      return false;
    }
  };

  // Admin Login - same as login but specifically for admin panel
  const adminLogin = login;

  // Register function
  const register = async (username: string, email: string, password: string): Promise<boolean> => {
    setLoading(true);
    
    try {
      // Simulate API call with a 1 second delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a new user based on regularUser
      const newUser: User = {
        ...regularUser,
        id: `user_${Date.now()}`, // Generate a fake ID
        username,
        email,
        name: username,
        balance: 1000, // Start with 1000 in balance
        avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`,
        vipLevel: 1,
        isVerified: false
      };
      
      setUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast.success(`Account created successfully! Welcome, ${username}!`);
      setLoading(false);
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      setLoading(false);
      return false;
    }
  };

  // Logout function
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
    toast.success(`You have been logged out`);
  };

  // Compute isAdmin for easy access
  const isAdmin = user?.isAdmin || false;

  // Provide the context
  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      user,
      loading,
      isAdmin,
      login,
      register,
      logout,
      updateUserBalance,
      adminLogin,
      deposit,
      updateBalance
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook for using the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
