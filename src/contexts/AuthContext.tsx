
import React, { createContext, useState, useContext, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { User } from "@/types";
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { walletService } from "@/services/walletService";
import { Wallet } from "@/types/wallet";

interface AuthUser extends User {
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  signup: (email: string, password: string, username: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshWalletBalance: () => Promise<void>;
  walletBalance?: number;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [walletBalance, setWalletBalance] = useState<number | undefined>(undefined);
  const navigate = useNavigate();

  // Convert Supabase user to our app's user format
  const convertSupabaseUser = (supabaseUser: SupabaseUser): AuthUser => {
    const isAdmin = supabaseUser.app_metadata?.role === 'admin';
    
    return {
      isAdmin,
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
      name: supabaseUser.user_metadata?.name,
      createdAt: supabaseUser.created_at,
      lastLogin: supabaseUser.last_sign_in_at,
      avatarUrl: supabaseUser.user_metadata?.avatar_url,
    };
  };

  // Fetch user wallet
  const fetchUserWallet = async (userId: string) => {
    try {
      const walletResponse = await walletService.getWalletByUserId(userId);
      if (walletResponse.data) {
        const walletData: Wallet = walletService.mapDatabaseWalletToWallet(walletResponse.data);
        setWalletBalance(walletData.balance);
      }
    } catch (error) {
      console.error("Error fetching wallet:", error);
    }
  };

  // Handle session changes
  useEffect(() => {
    const setupUser = async (session: Session | null) => {
      setIsLoading(true);
      
      if (session?.user) {
        const convertedUser = convertSupabaseUser(session.user);
        setUser(convertedUser);
        setIsAuthenticated(true);
        await fetchUserWallet(convertedUser.id);
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setWalletBalance(undefined);
      }
      
      setIsLoading(false);
    };

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setupUser(session);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setupUser(session);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      if (data.user) {
        const convertedUser: AuthUser = {
          ...convertSupabaseUser(data.user),
          email: email
        };
        setUser(convertedUser);
        setIsAuthenticated(true);
        await fetchUserWallet(convertedUser.id);
        toast.success("Login successful!");
        navigate("/");
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to log in");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Demo login function
  const loginWithDemo = async () => {
    try {
      setIsLoading(true);
      // Create a temporary demo user (usually you'd have a dedicated demo account)
      const demoEmail = `demo_${Math.floor(Math.random() * 100000)}@example.com`;
      const demoPassword = `Demo${Math.floor(Math.random() * 100000)}!`;
      
      // Mock auth for demo purposes
      const demoUser: AuthUser = {
        isAdmin: true,
        username: "demo_user",
        name: "Demo User",
        id: `demo-${Date.now()}`,
        email: demoEmail,
        balance: 1000,
        createdAt: new Date().toISOString()
      };
      
      setUser(demoUser);
      setIsAuthenticated(true);
      setWalletBalance(1000);
      
      toast.success("Demo login successful!");
      navigate("/casino");
    } catch (error: any) {
      toast.error("Failed to log in with demo account");
      console.error("Demo login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, username: string) => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) throw error;

      toast.success("Signup successful! Please check your email to verify your account.");
      navigate("/auth/verify-email");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign up");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      setIsAuthenticated(false);
      setWalletBalance(undefined);
      
      toast.success("Logout successful");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to log out");
      console.error("Logout error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to refresh wallet balance
  const refreshWalletBalance = async () => {
    if (user?.id) {
      await fetchUserWallet(user.id);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        loginWithDemo,
        signup,
        logout,
        refreshWalletBalance,
        walletBalance,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
