
import React, { createContext, useContext, useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { User } from "@/types";

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
  adminLogin: (username: string, password: string) => Promise<void>;
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
    role: 'user' as const,
    name: "Demo User",
    status: "Active" as const,
    joined: "2025-04-01",
    avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png"
  },
  {
    id: "admin1",
    username: "admin",
    email: "admin@example.com",
    password: "admin",
    balance: 9999,
    isVerified: true,
    vipLevel: 10,
    role: 'admin' as const,
    name: "Administrator",
    status: "Active" as const,
    joined: "2025-03-01",
    avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png"
  }
];

// Store mock users in localStorage for persistence
if (!localStorage.getItem("mockUsers")) {
  localStorage.setItem("mockUsers", JSON.stringify(mockUsers));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for saved session on mount
    const savedUser = localStorage.getItem("thunderwin_user");
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        
        // If admin logged in, redirect to admin panel if not already there
        if (parsedUser.role === 'admin' && window.location.pathname !== '/admin' && !window.location.pathname.startsWith('/admin/')) {
          navigate('/admin');
        }
      } catch (e) {
        console.error("Failed to parse saved user", e);
      }
    }
    setIsLoading(false);
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Get updated mock users from localStorage
      const storedMockUsers = JSON.parse(localStorage.getItem("mockUsers") || JSON.stringify(mockUsers));
      const matchedUser = storedMockUsers.find((u: any) => u.email === email && u.password === password);
      
      if (!matchedUser) {
        throw new Error("Invalid credentials");
      }
      
      const { password: _, ...userData } = matchedUser;
      setUser(userData);
      localStorage.setItem("thunderwin_user", JSON.stringify(userData));
      
      // Sync with users database
      const usersDb = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUserIndex = usersDb.findIndex((u: User) => u.id === userData.id);
      
      // If user doesn't exist in the admin database, add them
      if (existingUserIndex === -1) {
        const newUser = {
          id: userData.id,
          name: userData.name,
          username: userData.username,
          email: userData.email,
          status: "Active",
          balance: userData.balance,
          joined: new Date().toISOString().split('T')[0],
          favoriteGames: [],
          vipLevel: userData.vipLevel,
          isVerified: userData.isVerified,
          role: userData.role,
          avatarUrl: userData.avatarUrl
        };
        localStorage.setItem("users", JSON.stringify([...usersDb, newUser]));
      } else {
        // Update existing user data
        usersDb[existingUserIndex] = {
          ...usersDb[existingUserIndex],
          balance: userData.balance,
          status: "Active",
          vipLevel: userData.vipLevel,
          isVerified: userData.isVerified
        };
        localStorage.setItem("users", JSON.stringify(usersDb));
        console.log("User updated in admin database");
      }
      
      toast({
        title: "Login Successful",
        description: `Welcome back, ${userData.username || userData.name}!`,
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

  const adminLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check for admin credentials
      if (username !== "admin" || password !== "admin") {
        throw new Error("Invalid admin credentials");
      }
      
      const adminUser = mockUsers.find(u => u.username === "admin");
      
      if (!adminUser) {
        throw new Error("Admin user not found");
      }
      
      const { password: _, ...userData } = adminUser;
      setUser(userData);
      localStorage.setItem("thunderwin_user", JSON.stringify(userData));
      
      toast({
        title: "Admin Login Successful",
        description: "Welcome to the administration panel",
      });
      
      // Redirect to admin dashboard
      navigate('/admin');
    } catch (error) {
      toast({
        title: "Admin Login Failed",
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
      
      // Get updated mock users from localStorage
      const storedMockUsers = JSON.parse(localStorage.getItem("mockUsers") || JSON.stringify(mockUsers));
      
      if (storedMockUsers.some((u: any) => u.email === email)) {
        throw new Error("Email already exists");
      }
      
      if (storedMockUsers.some((u: any) => u.username === username)) {
        throw new Error("Username already taken");
      }
      
      const userId = `user${Math.floor(Math.random() * 10000)}`;
      const currentDate = new Date().toISOString().split('T')[0];
      
      const newUser = {
        id: userId,
        username,
        name: username,
        email,
        balance: 100, // Welcome bonus
        isVerified: false,
        vipLevel: 0,
        role: 'user' as const,
        status: "Active" as const,
        joined: currentDate,
        avatarUrl: "/placeholder.svg", // Default avatar
        password // Include password for the mock users array
      };
      
      // Add to mock users
      storedMockUsers.push(newUser);
      localStorage.setItem("mockUsers", JSON.stringify(storedMockUsers));
      
      // Add user to the admin panel database
      const usersDb = JSON.parse(localStorage.getItem("users") || "[]");
      const newUserForDb = {
        id: userId,
        name: username,
        username,
        email,
        status: "Active",
        balance: 100,
        joined: currentDate,
        favoriteGames: [],
        vipLevel: 0,
        isVerified: false,
        role: 'user',
        avatarUrl: "/placeholder.svg"
      };
      
      localStorage.setItem("users", JSON.stringify([...usersDb, newUserForDb]));
      
      const { password: _, ...userData } = newUser;
      setUser(userData);
      localStorage.setItem("thunderwin_user", JSON.stringify(userData));
      
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
    navigate('/login');
  };

  const updateBalance = (newBalance: number) => {
    if (user) {
      const updatedUser = { ...user, balance: newBalance };
      setUser(updatedUser);
      localStorage.setItem("thunderwin_user", JSON.stringify(updatedUser));
      
      // Update user in admin database too
      const usersDb = JSON.parse(localStorage.getItem("users") || "[]");
      const userIndex = usersDb.findIndex((u: User) => u.id === user.id);
      
      if (userIndex !== -1) {
        usersDb[userIndex].balance = newBalance;
        localStorage.setItem("users", JSON.stringify(usersDb));
      }
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
      
      // Add transaction record
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const newTransaction = {
        id: `TRX-${10000 + transactions.length + 1}`,
        userId: user.id,
        userName: user.name || user.username,
        type: "deposit",
        amount: amount,
        currency: "USD",
        status: "completed",
        method: "Credit Card",
        date: new Date().toISOString()
      };
      
      localStorage.setItem("transactions", JSON.stringify([newTransaction, ...transactions]));
      
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
      
      // Add transaction record
      const transactions = JSON.parse(localStorage.getItem("transactions") || "[]");
      const newTransaction = {
        id: `TRX-${10000 + transactions.length + 1}`,
        userId: user.id,
        userName: user.name || user.username,
        type: "withdraw",
        amount: amount,
        currency: "USD",
        status: "completed",
        method: "Bank Transfer",
        date: new Date().toISOString()
      };
      
      localStorage.setItem("transactions", JSON.stringify([newTransaction, ...transactions]));
      
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
        withdraw,
        adminLogin
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
