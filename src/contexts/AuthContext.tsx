import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Session, User } from "@supabase/supabase-js";
import { walletService } from "@/services/walletService";

interface UserProfile {
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
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  adminLogin: (username: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  deposit: (amount: number) => Promise<void>;
  updateBalance: (newBalance: number) => void;
  session: Session | null;
  refreshWalletBalance: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  
  // Initialize user session from Supabase
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchUserProfile(session.user);
      }
    });

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          fetchUserProfile(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfile = async (authUser: User) => {
    try {
      // First get the profile that links auth.users to our custom users table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('id', authUser.id)
        .single();
      
      if (profileError) throw profileError;
      
      if (profileData?.user_id) {
        // Now get the actual user data
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*, wallets(*)')
          .eq('id', profileData.user_id)
          .single();
          
        if (userError) throw userError;
        
        // Get wallet data for the user
        const wallet = userData.wallets?.[0] || { balance: 0, vip_level: 0 };
        
        // Transform database user to our app's user profile structure
        const userProfile: UserProfile = {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          isAdmin: userData.role_id === 1, // Assuming role_id 1 is admin
          name: userData.username,
          avatarUrl: userData.avatar || "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
          balance: wallet.balance || 0,
          vipLevel: wallet.vip_level || 0,
          isVerified: userData.status === 'active'
        };
        
        setUser(userProfile);
        toast.success(`Welcome back, ${userProfile.username}! Balance: $${userProfile.balance.toFixed(2)}`);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      
      // Fall back to demo user data for development
      if (process.env.NODE_ENV === 'development') {
        setUser({
          id: authUser.id,
          username: authUser.email?.split('@')[0] || "demouser",
          name: "Demo User",
          email: authUser.email || "demo@example.com",
          isAdmin: false,
          avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
          balance: 1000,
          vipLevel: 1,
          isVerified: true
        });
        toast.success(`Welcome back, Demo User! Balance: $1000.00`);
      }
    }
  };

  const refreshWalletBalance = async () => {
    if (!user?.id) return;
    
    try {
      const walletData = await walletService.getWalletByUserId(user.id);
      
      if (walletData) {
        setUser(prev => prev ? {
          ...prev,
          balance: walletData.balance,
          vipLevel: walletData.vip_level || 0
        } : null);
      }
    } catch (error) {
      console.error("Error refreshing wallet balance:", error);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      // fetchUserProfile will be called by the auth state change listener
      return;
    } catch (error: any) {
      console.error("Login error:", error);
      
      // For development purposes and demo accounts
      if (email === "demo@example.com" && password === "password123") {
        // Create a temporary sign-up and login for the demo user
        try {
          // Try to sign up the demo user (will fail if already exists, which is fine)
          await supabase.auth.signUp({ email, password });
          // Now try to sign in
          const { error } = await supabase.auth.signInWithPassword({ email, password });
          if (!error) {
            toast.success("Demo login successful");
            return;
          }
        } catch (demoError) {
          console.log("Demo account login failed with Supabase, using fallback", demoError);
        }
        
        // Fallback to mock user if Supabase fails
        setUser({
          id: "demo1",
          username: "demouser",
          name: "Demo User",
          email: email,
          isAdmin: false,
          avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
          balance: 1000,
          vipLevel: 3,
          isVerified: true
        });
        
        toast.success("Demo login successful (local mode). Balance: $1000.00");
        return;
      }
      
      throw new Error(error.message || "Invalid credentials");
    }
  };
  
  const adminLogin = async (username: string, password: string) => {
    try {
      // In a real app, we'd verify admin credentials differently
      // For now, we'll just use email login as normal but check role afterwards
      const email = username.includes('@') ? username : `${username}@admin.com`;
      
      const { data, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      
      if (error) throw error;
      
      // Admin check will happen in fetchUserProfile
      toast.success("Admin login successful");
      
      // Just for demo purposes (fallback for admin)
      if (username === "admin" && password === "admin") {
        setUser({
          id: "admin1",
          username: username,
          name: "Admin User",
          email: "admin@example.com",
          isAdmin: true,
          avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
          balance: 1000,
          vipLevel: 5,
          isVerified: true
        });
      }
      
      return;
    } catch (error: any) {
      console.error("Admin login error:", error);
      
      // Fallback for demo admin user
      if (username === "admin" && password === "admin") {
        setUser({
          id: "admin1",
          username: username,
          name: "Admin User",
          email: "admin@example.com",
          isAdmin: true,
          avatarUrl: "/lovable-uploads/2dc5015b-5024-411b-8ee9-4b422be630fa.png",
          balance: 1000,
          vipLevel: 5,
          isVerified: true
        });
        
        toast.success("Admin login successful (local mode)");
        return;
      }
      
      throw new Error(error.message || "Invalid admin credentials");
    }
  };
  
  const register = async (email: string, username: string, password: string) => {
    try {
      // Sign up the user with Supabase
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: {
            username: username,
          }
        }
      });
      
      if (error) throw error;
      
      toast.success("Registration successful! Please check your email for verification.");
      
      return;
    } catch (error: any) {
      console.error("Registration error:", error);
      throw new Error(error.message || "Registration failed");
    }
  };
  
  const deposit = async (amount: number) => {
    if (!user) return;
    
    try {
      // Update wallet balance in Supabase
      const { data, error } = await supabase
        .from('wallets')
        .update({ balance: user.balance + amount })
        .eq('user_id', user.id);
        
      if (error) throw error;
      
      // Update local user state
      setUser({
        ...user,
        balance: user.balance + amount
      });
      
      toast.success(`$${amount.toFixed(2)} has been added to your account.`);
    } catch (error: any) {
      console.error("Deposit error:", error);
      toast.error("Failed to process deposit.");
      
      // Fallback to local update for demo
      setUser({
        ...user,
        balance: user.balance + amount
      });
    }
  };
  
  const updateBalance = (newBalance: number) => {
    if (!user) return;
    
    try {
      // Update wallet balance in Supabase
      supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id)
        .then(({ error }) => {
          if (error) console.error("Balance update error:", error);
        });
      
      // Update local user state
      setUser({
        ...user,
        balance: newBalance
      });
    } catch (error: any) {
      console.error("Balance update error:", error);
      
      // Fallback to local update
      setUser({
        ...user,
        balance: newBalance
      });
    }
  };
  
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      toast.success("You have been successfully logged out");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to log out");
      
      // Force logout on frontend anyway
      setUser(null);
    }
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
        updateBalance,
        session,
        refreshWalletBalance
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
