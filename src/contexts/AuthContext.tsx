
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User, Wallet } from '@/types'; // Ensure Wallet type is correctly defined
import { userService } from '@/services/userService'; // Assuming userService exists
import { walletService } from '@/services/walletService'; // Assuming walletService exists
import { toast } from 'sonner';

interface AuthContextType {
  session: Session | null;
  user: SupabaseUser | null; // Supabase auth user
  appUser: User | null; // Your custom application user from 'users' table
  wallet: Wallet | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: { email?: string; password?: string; data?: Record<string, any> }) => Promise<void>;
  refreshAuthData: () => Promise<void>; // To manually refresh user/wallet
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [appUser, setAppUser] = useState<User | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAndSetUserData = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      try {
        // Fetch from your public 'users' table
        const fetchedAppUser = await userService.getUserById(supabaseUser.id); // Use supabaseUser.id as it links to profiles.id
        setAppUser(fetchedAppUser || null);

        if (fetchedAppUser) { // Ensure appUser exists before fetching wallet
            const fetchedWallet = await walletService.getWalletByUserId(fetchedAppUser.id); // Use appUser.id
            setWallet(fetchedWallet || null);
        } else {
            setWallet(null); // No app user, no wallet
            console.warn("No application user found for Supabase user:", supabaseUser.id);
        }

      } catch (error) {
        console.error("Error fetching user data or wallet:", error);
        toast.error("Failed to load user profile or wallet.");
        setAppUser(null);
        setWallet(null);
      }
    } else {
      setAppUser(null);
      setWallet(null);
    }
  };
  
  useEffect(() => {
    const setAuthData = async (currentSession: Session | null) => {
        setSession(currentSession);
        const supabaseAuthUser = currentSession?.user ?? null;
        setUser(supabaseAuthUser);
        await fetchAndSetUserData(supabaseAuthUser);
        setIsLoading(false);
    };

    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
        setAuthData(currentSession);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, currentSession) => {
        setAuthData(currentSession);
    });

    return () => {
      // Check if subscription exists before trying to unsubscribe
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []);


  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      // User data will be set by onAuthStateChange
    } catch (error: any) {
      toast.error(error.message || "Login failed.");
      throw error;
    } finally {
      // setIsLoading(false); // onAuthStateChange will handle loading state
    }
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          data: metadata, // This is where user_metadata is set on sign up
        }
      });
      if (error) throw error;
      toast.success("Registration successful! Please check your email to verify your account.");
      // User data will be set by onAuthStateChange after verification for some setups
    } catch (error: any) {
      toast.error(error.message || "Registration failed.");
      throw error;
    } finally {
      // setIsLoading(false); // onAuthStateChange might handle this
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setSession(null);
      setUser(null);
      setAppUser(null);
      setWallet(null);
      toast.success("Logged out successfully.");
    } catch (error: any) {
      toast.error(error.message || "Logout failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: { email?: string; password?: string; data?: Record<string, any> }) => {
    // setIsLoading(true); // Consider if loading state is needed here
    try {
      const { data: { user: updatedUser }, error } = await supabase.auth.updateUser(userData);
      if (error) throw error;
      if (updatedUser) {
        setUser(updatedUser); // Update Supabase auth user state
        await fetchAndSetUserData(updatedUser); // Refresh appUser and wallet
      }
      toast.success("User updated successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to update user.");
      throw error;
    } finally {
      // setIsLoading(false);
    }
  };

  const refreshAuthData = async () => {
    setIsLoading(true);
    const { data: { session: currentSession } } = await supabase.auth.getSession();
    setSession(currentSession);
    const supabaseAuthUser = currentSession?.user ?? null;
    setUser(supabaseAuthUser);
    await fetchAndSetUserData(supabaseAuthUser);
    setIsLoading(false);
  }

  return (
    <AuthContext.Provider value={{ session, user, appUser, wallet, isAuthenticated: !!user, isLoading, login, register, logout, updateUser, refreshAuthData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
