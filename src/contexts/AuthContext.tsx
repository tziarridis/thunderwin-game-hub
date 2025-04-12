
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
  name?: string;
  avatarUrl?: string;
  balance: number;
  vipLevel: number;
  isVerified: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  deposit: (amount: number) => Promise<void>;
  updateBalance: (newBalance: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  
  useEffect(() => {
    // Check for existing session on load
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string) => {
    // This would be an API call in a real app
    if (email === "user@example.com" && password === "password") {
      const userData: User = {
        id: "user1",
        username: "user1",
        name: "Regular User",
        email: email,
        isAdmin: false,
        avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
        balance: 500,
        vipLevel: 2,
        isVerified: true
      };
      
      localStorage.setItem("user", JSON.stringify(userData));
      setUser(userData);
    } else {
      throw new Error("Invalid credentials");
    }
  };
  
  const adminLogin = async (username: string, password: string) => {
    // This would verify with an API in a real app
    if (username === "admin" && password === "admin") {
      const adminUser: User = {
        id: "admin1",
        username: username,
        name: "Admin User",
        email: "admin@example.com",
        isAdmin: true,
        avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
        balance: 1000,
        vipLevel: 5,
        isVerified: true
      };
      
      localStorage.setItem("user", JSON.stringify(adminUser));
      setUser(adminUser);
    } else {
      throw new Error("Invalid admin credentials");
    }
  };
  
  const register = async (email: string, username: string, password: string) => {
    // This would be an API call in a real app
    const newUser: User = {
      id: `user-${Date.now()}`,
      username,
      name: username,
      email,
      isAdmin: false,
      avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
      balance: 100, // Starting bonus
      vipLevel: 1,
      isVerified: false
    };
    
    // Store in local storage (would be a database in real app)
    localStorage.setItem("user", JSON.stringify(newUser));
    setUser(newUser);
    
    toast({
      title: "Registration Successful",
      description: "Your account has been created with a $100 welcome bonus!",
    });
  };
  
  const deposit = async (amount: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      balance: user.balance + amount
    };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    
    toast({
      title: "Deposit Successful",
      description: `$${amount.toFixed(2)} has been added to your account.`,
    });
  };
  
  const updateBalance = (newBalance: number) => {
    if (!user) return;
    
    const updatedUser = {
      ...user,
      balance: newBalance
    };
    
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };
  
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        isAuthenticated: !!user, 
        isAdmin: !!user?.isAdmin,
        login, 
        adminLogin,
        register,
        logout,
        deposit,
        updateBalance
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
