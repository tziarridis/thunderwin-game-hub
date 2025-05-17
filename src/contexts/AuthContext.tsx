// @ts-nocheck TODO: Remove ts-nocheck and fix all type errors
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser, Session, AuthError } from '@supabase/supabase-js';
import userService from '@/services/userService'; // Corrected import
import { walletService } from '@/services/walletService';
import { AuthUser, Profile, AuthContextType, User as AppUser, DbWallet } from '@/types'; // Ensure User is AppUser
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null); // Use AuthError for Supabase errors

  const fetchUserProfile = useCallback(async (userId: string): Promise<Partial<AppUser> | null> => {
    const { data, error: profileError } = await userService.getUserById(userId);
    if (profileError) {
      console.error('Error fetching user profile:', profileError);
      // toast.error(`Failed to fetch profile: ${profileError.message}`);
      return null;
    }
    return data as Partial<AppUser> | null; // Cast to AppUser
  }, []);

  const mapSupabaseUserToAuthUser = async (supabaseUser: SupabaseUser | null): Promise<AuthUser | null> => {
    if (!supabaseUser) return null;

    const profileData = await fetchUserProfile(supabaseUser.id);
    const walletData = await walletService.getWalletByUserId(supabaseUser.id);
    
    const primaryWallet = walletData.success && walletData.data ? walletData.data as DbWallet : null;


    return {
      id: supabaseUser.id,
      email: supabaseUser.email!,
      username: profileData?.username || supabaseUser.email?.split('@')[0],
      displayName: profileData?.displayName || profileData?.username || supabaseUser.email?.split('@')[0],
      avatar: profileData?.avatar || undefined,
      role: profileData?.role || 'user', // Default to 'user'
      kycStatus: profileData?.kycStatus || 'not_submitted',
      balance: primaryWallet?.balance,
      currency: primaryWallet?.currency,
      // Add other fields from AppUser if they are part of AuthUser
      firstName: profileData?.firstName,
      lastName: profileData?.lastName,
    };
  };
  
  useEffect(() => {
    const getInitialSession = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        if (initialSession?.user) {
          const authUser = await mapSupabaseUserToAuthUser(initialSession.user);
          setUser(authUser);
        }
      } catch (e: any) {
        console.error("Error getting initial session:", e);
        setError(e);
      } finally {
        setLoading(false);
      }
    };

    getInitialSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      setLoading(true);
      setError(null); // Clear previous errors on auth change
      setSession(newSession);
      if (newSession?.user) {
        const authUser = await mapSupabaseUserToAuthUser(newSession.user);
        setUser(authUser);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => {
      if (authListener && authListener.subscription) { // Check if subscription exists
        authListener.subscription.unsubscribe();
      }
    };
  }, [fetchUserProfile]);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({ email, password });
      if (loginError) throw loginError;
      if (data.user) {
        const authUser = await mapSupabaseUserToAuthUser(data.user);
        setUser(authUser);
        setSession(data.session);
        toast.success("Logged in successfully!");
        return authUser;
      }
      return null;
    } catch (e) {
      console.error("Login error:", e);
      setError(e);
      toast.error(e.message || "Failed to log in.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email, password, username) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { username: username || email.split('@')[0] } },
      });
      if (signUpError) throw signUpError;
      
      // Supabase typically sends a confirmation email.
      // For now, we'll assume auto-confirmation or handle it client-side if user exists.
      if (data.user) {
         // Create user profile in your 'users' table
        const newUserProfile = {
          id: data.user.id, // This should be auth.uid from supabase user
          auth_user_id: data.user.id, // if you have a separate column for auth user id
          email: data.user.email,
          username: username || data.user.email.split('@')[0],
          role: 'user',
          // other default fields
        };
        // await userService.createUser(newUserProfile); // Adapt to your userService.createUser

        const authUser = await mapSupabaseUserToAuthUser(data.user);
        setUser(authUser);
        setSession(data.session);
        toast.success("Registered successfully! Please check your email to confirm.");
        return authUser;
      }
      return null;
    } catch (e) {
      console.error("Registration error:", e);
      setError(e);
      toast.error(e.message || "Failed to register.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setSession(null);
      toast.success("Logged out successfully.");
    } catch (e) {
      console.error("Logout error:", e);
      setError(e);
      toast.error(e.message || "Failed to log out.");
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email) => {
    // ... (implementation)
    return false; // Placeholder
  };


  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user) {
      toast.error("You must be logged in to update your profile.");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming profileData contains fields for 'profiles' table
      // And user.id is the foreign key 'user_id' in 'profiles'
      // Or if user.id is the primary key 'id' in 'profiles' table linked to auth.users
      const { data: updatedProfileData, error: updateError } = await supabase
        .from('profiles') // Or your actual profiles table name
        .update(profileData) // profileData should match columns in 'profiles'
        .eq('user_id', user.id) // Ensure this condition matches your schema
        .select()
        .single();

      if (updateError) throw updateError;

      if (updatedProfileData) {
        // Re-fetch or merge updated user data
        const updatedAuthUser = await mapSupabaseUserToAuthUser(session?.user || null); // Re-map with fresh profile data
        setUser(updatedAuthUser);
        toast.success("Profile updated successfully!");
        // The 'Profile' type is for the data structure being passed and returned.
        // We are returning the data that was successfully updated.
        return updatedProfileData as Profile; // Cast to Profile, ensure it matches
      }
      return null;
    } catch (e: any) {
      console.error("Update profile error:", e);
      setError(e);
      toast.error(e.message || "Failed to update profile.");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletBalance = useCallback(async () => {
    if (!user) return null;
    try {
      const response = await walletService.getWalletByUserId(user.id);
      if (response.success && response.data) {
        const dbWallet = response.data as DbWallet;
        setUser(prevUser => prevUser ? ({ 
          ...prevUser, 
          balance: dbWallet.balance, 
          currency: dbWallet.currency 
        }) : null);
        return dbWallet.balance;
      }
      return null;
    } catch (e: any) {
      console.error("Error refreshing wallet balance:", e);
      // toast.error("Could not refresh wallet balance."); // Optional: can be noisy
      return null;
    }
  }, [user]);
  
  // Placeholder for deposit function if needed by CardDeposit
  const deposit = async (amount: number, currency: string, paymentMethod: string): Promise<boolean> => {
    console.log("Deposit function called in AuthContext (placeholder)", { amount, currency, paymentMethod });
    if (!user) {
      toast.error("Please log in to make a deposit.");
      return false;
    }
    // Implement actual deposit logic here, possibly calling a service
    // For now, simulate success and refresh balance
    // await walletService.handleDeposit({ userId: user.id, amount, currency, paymentMethodId: paymentMethod /* ... */ });
    await refreshWalletBalance();
    toast.success("Deposit successful (simulated).");
    return true;
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      session,
      loading, 
      error, 
      login, 
      register, 
      logout, 
      resetPassword, 
      updateProfile, 
      refreshWalletBalance, 
      isAuthenticated: !!user,
      fetchUserProfile,
      deposit // Provide the deposit function
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
