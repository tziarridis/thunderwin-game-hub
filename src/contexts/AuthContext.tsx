
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";

interface User {
  id: string;
  username: string;
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  logout: () => void;
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
        email: email,
        isAdmin: false
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
        email: "admin@example.com",
        isAdmin: true
      };
      
      localStorage.setItem("user", JSON.stringify(adminUser));
      setUser(adminUser);
    } else {
      throw new Error("Invalid admin credentials");
    }
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
        logout 
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
