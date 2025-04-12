
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  balance: number;
  avatarUrl?: string;
  isVerified: boolean;
  vipLevel: number;
  role: 'user' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateBalance: (newBalance: number) => void;
  deposit: (amount: number) => Promise<void>;
  withdraw: (amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock user data - In a real implementation, this would come from a backend API
const mockUsers = [
  {
    id: "user1",
    username: "demo_user",
    email: "demo@example.com",
    password: "password123",
    balance: 1000,
    isVerified: true,
    vipLevel: 1,
    role: 'user' as const
  },
  {
    id: "admin1",
    username: "admin",
    email: "admin@example.com",
    password: "admin123",
    balance: 9999,
    isVerified: true,
    vipLevel: 10,
    role: 'admin' as const
  }
];

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check for saved session on mount
    const savedUser = localStorage.getItem("thunderwin_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const matchedUser = mockUsers.find(u => u.email === email && u.password === password);
      
      if (!matchedUser) {
        throw new Error("Invalid credentials");
      }
      
      const { password: _, ...userData } = matchedUser;
      setUser(userData);
      localStorage.setItem("thunderwin_user", JSON.stringify(userData));
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username}!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      if (mockUsers.some(u => u.email === email)) {
        throw new Error("Email already exists");
      }
      
      if (mockUsers.some(u => u.username === username)) {
        throw new Error("Username already taken");
      }
      
      const newUser: User = {
        id: `user${Math.floor(Math.random() * 10000)}`,
        username,
        email,
        balance: 100, // Welcome bonus
        isVerified: false,
        vipLevel: 0,
        role: 'user'
      };
      
      setUser(newUser);
      localStorage.setItem("thunderwin_user", JSON.stringify(newUser));
      
      toast({
        title: "Registration Successful",
        description: "Your account has been created with a $100 welcome bonus!",
      });
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An error occurred",
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("thunderwin_user");
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    });
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("thunderwin_user", JSON.stringify(updatedUser));
    }
  };
  
  const deposit = async (amount: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to deposit",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newBalance = user.balance + amount;
      updateBalance(newBalance);
      
      toast({
        title: "Deposit Successful",
        description: `$${amount} has been added to your account.`,
      });
    } catch (error) {
      toast({
        title: "Deposit Failed",
        description: "There was an error processing your deposit",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const withdraw = async (amount: number) => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to withdraw",
        variant: "destructive",
      });
      return;
    }

    if (user.balance < amount) {
      toast({
        title: "Insufficient Funds",
        description: "You don't have enough funds to withdraw this amount",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const newBalance = user.balance - amount;
      updateBalance(newBalance);
      
      toast({
        title: "Withdrawal Requested",
        description: `Your withdrawal of $${amount} is being processed.`,
      });
    } catch (error) {
      toast({
        title: "Withdrawal Failed",
        description: "There was an error processing your withdrawal",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        login,
        register,
        logout,
        updateBalance,
        deposit,
        withdraw
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
