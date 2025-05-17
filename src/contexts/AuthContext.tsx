
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { userService } from '@/services/userService'; // Assuming userService is correctly exported now
import { AuthUser, Profile, AuthContextType, Wallet, DbWallet } from '@/types';
import { walletService, mapDbWalletToWallet } from '@/services/walletService';
import { toast } from 'sonner';
import * as authUtils from '@/utils/authUtils'; // Import all from authUtils

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);


  const fetchAndSetUser = useCallback(async (supabaseUser: SupabaseUser) => {
    try {
      // Fetch detailed user profile from your 'users' table or 'profiles' table
      const { data: profileData, error: profileError } = await supabase
        .from('users') // Or 'profiles' table, ensure it links to auth.users.id
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error("Error fetching user profile:", profileError);
        // Potentially set a minimal AuthUser from supabaseUser if profile fetch fails
        setUser({
          id: supabaseUser.id,
          email: supabaseUser.email || '',
          username: supabaseUser.user_metadata?.username || supabaseUser.email?.split('@')[0],
          displayName: supabaseUser.user_metadata?.displayName || supabaseUser.user_metadata?.username,
          avatar: supabaseUser.user_metadata?.avatar_url,
          role: (supabaseUser.user_metadata?.role as AuthUser['role']) || 'user',
          // Wallet-related fields will be fetched by refreshWalletBalance
        });
        return;
      }

      if (profileData) {
        const authUserObj: AuthUser = {
          id: profileData.id,
          email: profileData.email,
          username: profileData.username,
          displayName: profileData.displayName || profileData.username,
          avatar: profileData.avatar,
          role: profileData.role || 'user', // Ensure 'role' exists on your profileData
          kycStatus: profileData.kycStatus,
          // Wallet-related fields (balance, currency, vipLevel) will be populated by refreshWalletBalance
        };
        setUser(authUserObj);
        await refreshWalletBalance(authUserObj.id); // Refresh wallet for this user
      }
    } catch (e: any) {
      console.error("Error in fetchAndSetUser:", e);
      setError(e);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      if (currentSession?.user) {
        fetchAndSetUser(currentSession.user);
      }
      setLoading(false);
    }).catch(e => {
        console.error("Error getting session:", e);
        setError(e);
        setLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await fetchAndSetUser(newSession.user);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => {
      authListener?.unsubscribe();
    };
  }, [fetchAndSetUser]);

  const login = async (email: string, password: string): Promise<AuthUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const { user: authedUser, error: signInError } = await authUtils.signIn(email, password);
      if (signInError) throw new Error(signInError);
      if (authedUser) {
         // The onAuthStateChange listener should handle setting the user state.
         // However, we can return the user data obtained from signIn directly as well.
        const fullUser = await authUtils.getCurrentUser(); // getCurrentUser now returns AuthUser | null
        setUser(fullUser); // Ensure this matches AuthUser type
        if(fullUser) await refreshWalletBalance(fullUser.id);
        return fullUser;
      }
      return null;
    } catch (e: any) {
      console.error("Login error:", e);
      setError(e);
      toast.error(e.message || "Login failed");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username?: string): Promise<AuthUser | null> => {
    setLoading(true);
    setError(null);
    try {
      const { user: newUser, error: signUpError } = await authUtils.signUp(email, password, username || '');
      if (signUpError) throw new Error(signUpError);
      // onAuthStateChange will handle setting the user state after email confirmation if enabled.
      // For immediate feedback or if email confirmation is off, you might set a temporary user state or rely on onAuthStateChange.
      toast.success("Registration successful! Please check your email to confirm.");
      return newUser; // This is a basic AuthUser from signUp
    } catch (e: any) {
      console.error("Registration error:", e);
      setError(e);
      toast.error(e.message || "Registration failed");
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
      toast.success("Logged out successfully");
    } catch (e: any) {
      console.error("Logout error:", e);
      setError(e);
      toast.error(e.message || "Logout failed");
    } finally {
      setLoading(false);
    }
  };
  
  const resetPassword = async (email: string): Promise<boolean> => {
    setLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // URL for password update page
      });
      if (resetError) throw resetError;
      toast.success("Password reset email sent. Please check your inbox.");
      return true;
    } catch (e: any) {
      console.error("Password reset error:", e);
      setError(e);
      toast.error(e.message || "Password reset failed");
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<Profile>): Promise<Profile | null> => {
    if (!user?.id) {
      toast.error("User not authenticated");
      return null;
    }
    setLoading(true);
    setError(null);
    try {
      // Assuming profileData matches the structure of your 'profiles' or 'users' table
      const { data: updatedProfile, error: updateError } = await supabase
        .from('profiles') // Or 'users' table
        .update(profileData)
        .eq('id', user.id) // Assuming 'id' in profiles table is the auth.users.id
        .select()
        .single();
      
      if (updateError) throw updateError;

      // Refetch or update local user state
      if (updatedProfile) {
        setUser(prevUser => ({
            ...prevUser!,
            displayName: updatedProfile.displayName || prevUser?.displayName,
            avatar: updatedProfile.avatar_url || prevUser?.avatar,
            // Update other relevant fields in AuthUser
        }));
        toast.success("Profile updated successfully");
        return updatedProfile as Profile;
      }
      return null;
    } catch (e: any) {
      console.error("Update profile error:", e);
      setError(e);
      toast.error(e.message || "Failed to update profile");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletBalance = useCallback(async (userIdToRefresh?: string) => {
    const currentUserId = userIdToRefresh || user?.id;
    if (!currentUserId) return null;

    try {
      const walletResponse = await walletService.getWalletByUserId(currentUserId);
      if (walletResponse.success && walletResponse.data) {
        const dbWalletData = walletResponse.data as DbWallet; // Should be single DbWallet
        const newWallet = mapDbWalletToWallet(dbWalletData);
        setUser(prevUser => {
          if (!prevUser || prevUser.id !== currentUserId) return prevUser; // ensure we are updating the correct user
          return {
            ...prevUser,
            balance: newWallet.balance,
            currency: newWallet.currency,
            vipLevel: newWallet.vipLevel,
          };
        });
        return newWallet.balance;
      } else {
        console.warn("Could not refresh wallet balance:", walletResponse.error || "No data");
        // If wallet doesn't exist, ensure local user state reflects that
         setUser(prevUser => {
          if (!prevUser || prevUser.id !== currentUserId) return prevUser;
          return { ...prevUser, balance: 0, currency: prevUser.currency || 'USD' }; // Default currency or keep existing
        });
      }
    } catch (e: any) {
      console.error("Error refreshing wallet balance:", e);
      // setError(e); // Optionally set context error
      toast.error("Failed to refresh wallet balance");
    }
    return null;
  }, [user?.id]);


  const deposit = async (userId: string, amount: number, currency: string, paymentMethod: string, transactionId?: string) => {
    try {
      const response = await walletService.handleDeposit({ userId, amount, currency, paymentMethod, transactionId });
      if (response.success) {
        toast.success("Deposit successful!");
        await refreshWalletBalance(userId);
        return true;
      } else {
        toast.error(response.message || "Deposit failed");
        return false;
      }
    } catch (e: any) {
      toast.error(e.message || "Deposit processing error");
      return false;
    }
  };


  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        register,
        logout,
        resetPassword,
        updateProfile,
        refreshWalletBalance,
        isAuthenticated,
        // deposit // Add if CardDeposit needs it from context
      }}
    >
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
