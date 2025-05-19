import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User, Wallet, AuthContextType, DbWallet } from '@/types'; // Ensure Wallet and DbWallet are imported
import { walletService } from '@/services/walletService'; // Assuming you have a walletService
import { toast } from 'sonner';
import { userService } from '@/services/userService'; // For fetching full user profile

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [wallet, setWallet] = useState<Wallet | null>(null);


  const fetchUserProfileAndWallet = useCallback(async (supabaseUser: SupabaseUser | null) => {
    if (!supabaseUser) {
      setUser(null);
      setWallet(null);
      return;
    }

    try {
      // 1. Fetch full user profile from your 'users' table
      const { data: userProfile, error: profileError } = await userService.getUserById(supabaseUser.id);
      
      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        // Fallback to Supabase user data if profile fetch fails for some reason
        setUser(supabaseUser as User); // This might lack custom fields
      } else if (userProfile) {
         // Merge Supabase auth data with your custom profile data
        const fullUser: User = {
          ...supabaseUser, // Supabase auth data (id, email, etc.)
          ...userProfile,  // Custom fields from your 'users' table
          // Ensure Supabase id overrides any id from userProfile if they conflict
          id: supabaseUser.id, 
        };
        setUser(fullUser);
      } else {
         // If no profile found, still set the Supabase user
         console.warn("No custom user profile found for user:", supabaseUser.id);
         setUser(supabaseUser as User);
      }

      // 2. Fetch wallet data
      const { data: walletData, error: walletError } = await walletService.getWalletByUserId(supabaseUser.id);
      if (walletError) {
        console.error("Error fetching wallet:", walletError);
        toast.error("Could not load wallet information.");
        setWallet(null);
      } else if (walletData) {
         // If walletData is an array, take the first one or find the active one
        const activeWallet = Array.isArray(walletData) 
          ? walletData.find(w => w.active) || walletData[0] 
          : walletData; // Assuming single wallet object
        
        if (activeWallet) {
          setWallet(activeWallet as Wallet); // Cast DbWallet to Wallet
        } else {
          console.warn("No active wallet found for user:", supabaseUser.id);
          setWallet(null);
        }
      } else {
        setWallet(null);
      }
    } catch (error) {
      console.error("Error in fetchUserProfileAndWallet:", error);
      setUser(supabaseUser as User); // Fallback
      setWallet(null); // Fallback
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      fetchUserProfileAndWallet(currentSession?.user ?? null).finally(() => {
        setLoading(false);
      });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setLoading(true);
        setSession(newSession);
        await fetchUserProfileAndWallet(newSession?.user ?? null);
        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchUserProfileAndWallet]);

  const login = async (credentials: { email?: string; password?: string; provider?: 'google' | 'discord' | 'github' }) => {
    setLoading(true);
    let errorResult: Error | null = null;
    try {
      if (credentials.provider) {
        const { error } = await supabase.auth.signInWithOAuth({ provider: credentials.provider });
        if (error) throw error;
      } else if (credentials.email && credentials.password) {
        const { error } = await supabase.auth.signInWithPassword({
          email: credentials.email,
          password: credentials.password,
        });
        if (error) throw error;
      } else {
        throw new Error("Email/password or provider is required for login.");
      }
    } catch (e: any) {
      console.error("Login error:", e);
      toast.error(e.message || "Login failed. Please check your credentials.");
      errorResult = e;
    } finally {
      setLoading(false);
    }
    return { error: errorResult };
  };

  const register = async (credentials: { email?: string; password?: string; username?: string; [key: string]: any }) => {
    setLoading(true);
    let errorResult: Error | null = null;
    try {
      if (!credentials.email || !credentials.password) {
        throw new Error("Email and password are required for registration.");
      }
      const { data, error } = await supabase.auth.signUp({
        email: credentials.email,
        password: credentials.password,
        options: {
          data: {
            username: credentials.username,
            full_name: credentials.full_name || credentials.username, 
            // Add any other metadata you want to store on Supabase auth user
            // This will also be available to the handle_new_user trigger
          }
        }
      });
      if (error) throw error;
      if (!data.session && data.user) {
        // This can happen if email confirmation is required
        toast.info("Registration successful! Please check your email to confirm your account.");
      } else if (data.session) {
         toast.success("Registration successful! You are now logged in.");
      }
    } catch (e: any) {
      console.error("Registration error:", e);
      toast.error(e.message || "Registration failed. Please try again.");
      errorResult = e;
    } finally {
      setLoading(false);
    }
    return { error: errorResult };
  };

  const logout = async () => {
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Logout error:", error);
      toast.error(error.message || "Logout failed.");
    } else {
      setUser(null);
      setSession(null);
      setWallet(null);
      toast.success("Logged out successfully.");
    }
    setLoading(false);
    return { error };
  };
  
  const refreshUser = useCallback(async () => {
    const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error("Error refreshing session:", sessionError);
      return;
    }
    setSession(currentSession);
    if (currentSession?.user) {
      await fetchUserProfileAndWallet(currentSession.user);
    } else {
      setUser(null);
      setWallet(null);
    }
  }, [fetchUserProfileAndWallet]);

  const refreshWalletBalance = useCallback(async () => {
    if (user && user.id) {
      try {
        const { data: walletData, error: walletError } = await walletService.getWalletByUserId(user.id);
        if (walletError) {
          toast.error("Failed to refresh wallet balance.");
          console.error("Wallet refresh error:", walletError);
        } else if (walletData) {
          const activeWallet = Array.isArray(walletData) 
            ? walletData.find(w => w.active) || walletData[0] 
            : walletData;
          setWallet(activeWallet as Wallet);
          // toast.success("Wallet balance updated!"); // Optional: can be too noisy
        }
      } catch (e) {
        toast.error("Error refreshing wallet.");
        console.error("Wallet refresh exception:", e);
      }
    }
  }, [user]);
  
  const updateUserMetadata = async (metadata: Partial<User['user_metadata']>) => {
    setLoading(true);
    const { data, error } = await supabase.auth.updateUser({ data: metadata });
    if (error) {
      toast.error(error.message || "Failed to update user metadata.");
    } else if (data.user) {
      // Re-fetch full profile to merge changes
      await fetchUserProfileAndWallet(data.user);
      toast.success("Profile updated successfully!");
    }
    setLoading(false);
    return { data, error };
  };
  
  const sendPasswordResetEmail = async (email: string) => {
    setLoading(true);
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Ensure this route exists for password update
    });
    if (error) {
      toast.error(error.message || "Failed to send password reset email.");
    } else {
      toast.success("Password reset email sent. Please check your inbox.");
    }
    setLoading(false);
    return { error };
  };

  const updatePassword = async (password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message || "Failed to update password.");
    } else {
      toast.success("Password updated successfully.");
    }
    setLoading(false);
    return { error };
  };


  const value = {
    isAuthenticated: !!session && !!user,
    user,
    session,
    loading,
    wallet,
    login,
    register,
    logout,
    refreshUser,
    updateUserMetadata,
    sendPasswordResetEmail,
    updatePassword,
    refreshWalletBalance,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
