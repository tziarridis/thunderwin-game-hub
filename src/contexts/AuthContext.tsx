import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import userService from '@/services/userService'; // Corrected import
import { AuthUser, AuthContextType } from '@/types'; // Will use consolidated types
import { walletService } from '@/services/walletService';
import { toast } from 'sonner';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mapSupabaseUserToAuthUser = useCallback(async (supabaseUser: SupabaseUser | null, existingProfileData?: any): Promise<AuthUser | null> => {
    if (!supabaseUser) return null;

    let profileData = existingProfileData;
    if (!profileData) {
      try {
        const { data: userDetails, error: profileError } = await supabase
          .from('users') 
          .select('*')
          .eq('id', supabaseUser.id) // This assumes users.id is the supabaseUser.id (auth.users.id)
          .single();

        if (profileError && profileError.code !== 'PGRST116') { 
          console.error('Error fetching user profile:', profileError);
        }
        profileData = userDetails; // profileData can be null here if no user record found
      } catch (e) {
        console.error('Exception fetching user profile:', e);
      }
    }
    
    let walletDetails = null;
    // Ensure profileData and profileData.id exist before fetching wallet
    // The 'users' table in Supabase has its own UUID 'id', not directly linked to auth.users.id in profiles.
    // The 'profiles' table links auth.users.id to users.id. We need to be careful here.
    // For now, assuming profileData.id refers to the ID in your custom 'users' table which walletService expects.
    // If profileData is from 'users' table, its 'id' column is the one for walletService.
    const userIdForWallet = profileData?.id || supabaseUser.id; // Prefer custom users table ID if available and correct

    if (userIdForWallet) {
        const walletResponse = await walletService.getWalletByUserId(userIdForWallet);
        if (walletResponse.data) {
            walletDetails = walletResponse.data;
        } else {
            // It's possible a user exists in auth but not yet in local 'users' table or 'wallets'
            console.warn('Wallet not found for user ID:', userIdForWallet, walletResponse.error);
        }
    }

    // Fallback for username if not in profileData
    const username = profileData?.username || supabaseUser.email?.split('@')[0] || 'User';
    const userEmail = supabaseUser.email || 'No email';
    
    return {
      id: profileData?.id || supabaseUser.id, 
      username: username,
      email: userEmail,
      firstName: profileData?.first_name || profileData?.firstName || '',
      lastName: profileData?.last_name || profileData?.lastName || '',
      avatar: profileData?.avatar_url || profileData?.avatar || undefined, // Use avatar_url from profiles or avatar from users
      avatarUrl: profileData?.avatar_url || profileData?.avatar || undefined, // Duplicate for safety, prefer avatarUrl
      role: profileData?.role || (profileData?.is_admin ? 'admin' : 'user'), // Infer role
      isAdmin: profileData?.is_admin || profileData?.role === 'admin' || false,
      isVerified: supabaseUser.email_confirmed_at ? true : false,
      vipLevel: walletDetails?.vipLevel ?? profileData?.vip_level ?? 0,
      balance: walletDetails?.balance ?? profileData?.balance ?? 0,
      currency: walletDetails?.currency ?? profileData?.currency ?? 'USD',
      name: `${profileData?.first_name || ''} ${profileData?.last_name || ''}`.trim() || username,
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setIsLoading(true); // Set loading true while mapping
        if (session?.user) {
          const authUser = await mapSupabaseUserToAuthUser(session.user);
          setUser(authUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    supabase.auth.getSession().then(async ({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setIsLoading(true); // Set loading true while mapping
      if (currentSession?.user) {
        const authUser = await mapSupabaseUserToAuthUser(currentSession.user);
        setUser(authUser);
      }
      setIsLoading(false);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [mapSupabaseUserToAuthUser]);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data.user && data.session) {
        setSession(data.session);
        const authUser = await mapSupabaseUserToAuthUser(data.user);
        setUser(authUser);
        toast.success("Logged in successfully!");
        return { success: true };
      }
      return { success: false, error: "Login failed: No user data returned" };
    } catch (err: any) {
      console.error("Login error:", err);
      const errorMessage = err.message || "An unexpected error occurred during login.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) throw signInError;
      if (data.user && data.session) {
        const authUser = await mapSupabaseUserToAuthUser(data.user);
        if (authUser?.isAdmin) {
          setUser(authUser);
          setSession(data.session);
          toast.success("Admin logged in successfully!");
          return { success: true };
        } else {
          await supabase.auth.signOut(); 
          setUser(null);
          setSession(null);
          const adminError = "Access Denied: User is not an administrator.";
          setError(adminError);
          toast.error(adminError);
          return { success: false, error: adminError };
        }
      }
      return { success: false, error: "Admin login failed: No user data returned" };
    } catch (err: any) {
      console.error("Admin login error:", err);
      const errorMessage = err.message || "An unexpected error occurred during admin login.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username: username, 
            // raw_user_meta_data for profiles trigger:
            // first_name: username, // Example: use username as first name initially
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // The handle_new_user trigger should create the 'users' and 'profiles' entries.
        // We might need to ensure the trigger passes username to the 'users' table.
        // For now, assume the trigger handles it.
        // If userService.createUserProfile is still needed, ensure its logic aligns with triggers.
        // The Supabase 'users' table has a `username` column. The trigger might need an update
        // if it's not correctly setting username from auth.users.raw_user_meta_data or email.

        // Attempt to sign in the user immediately
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            console.warn("Auto-login after registration failed:", signInError);
            toast.info("Registration successful! Please confirm your email and log in.");
        } else if (signInData.user && signInData.session) {
            setSession(signInData.session);
            // Pass the newly created user profile data if available, or let mapSupabaseUserToAuthUser fetch it
            const authUser = await mapSupabaseUserToAuthUser(signInData.user);
            setUser(authUser);
            toast.success("Registration successful and logged in!");
        } else {
             toast.info("Registration successful! Please confirm your email and log in.");
        }
        return { success: true };

      }
      return { success: false, error: "Registration failed: No user data returned" };
    } catch (err: any)
     {
      console.error("Registration error:", err);
      const errorMessage = err.message || "An unexpected error occurred during registration.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: signOutError } = await supabase.auth.signOut();
      if (signOutError) throw signOutError;
      setUser(null);
      setSession(null);
      toast.success("Logged out successfully!");
    } catch (err: any) {
      console.error("Logout error:", err);
      const errorMessage = err.message || "An unexpected error occurred during logout.";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const reset = async (email: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`, // Ensure this route exists
      });
      if (resetError) throw resetError;
      toast.success("Password reset email sent! Check your inbox.");
      return { success: true };
    } catch (err: any) {
      console.error("Password reset error:", err);
      const errorMessage = err.message || "An unexpected error occurred during password reset.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };


  const updateProfile = async (data: Partial<AuthUser>): Promise<{ success: boolean; error?: string }> => {
    if (!user?.id) return { success: false, error: "User not authenticated" };
    // The user.id here could be from auth.users (if no profile found) or public.users.
    // Updates should target the correct table.
    // 'profiles' table uses auth.users.id as its PK. 'users' table has its own UUID.
    // Let's assume user.id is the ID for the 'users' table for profile field updates.
    const userIdForProfileTable = user.id; // This should be the ID from your custom 'users' table.

    setIsLoading(true);
    setError(null);
    try {
      const profileUpdates: any = {};
      if (data.username) profileUpdates.username = data.username;
      // Supabase 'users' table columns from context: first_name, last_name, avatar
      if (data.firstName) profileUpdates.first_name = data.firstName;
      if (data.lastName) profileUpdates.last_name = data.lastName;
      if (data.avatar) profileUpdates.avatar = data.avatar; // This could be avatar URL
      // if (data.avatarUrl) profileUpdates.avatar_url = data.avatarUrl; // if 'profiles' table is updated directly

      if (Object.keys(profileUpdates).length > 0) {
          const { error: updateError } = await supabase
              .from('users') 
              .update(profileUpdates)
              .eq('id', userIdForProfileTable); 

          if (updateError) throw updateError;
      }

      // If email needs to be updated, handle it separately via Supabase Auth
      // This uses session.user.id which is auth.users.id
      if (data.email && data.email !== user.email && session?.user?.id) {
        const { error: emailUpdateError } = await supabase.auth.updateUser({ email: data.email });
        if (emailUpdateError) throw emailUpdateError;
      }
      
      // Re-fetch user data to reflect changes
      if (session?.user) {
          const updatedSupabaseUser = (await supabase.auth.getUser()).data.user;
          if (updatedSupabaseUser) {
            // Fetch from 'users' table again using the correct ID
            const { data: userDetails } = await supabase.from('users').select('*').eq('id', userIdForProfileTable).single();
            const authUser = await mapSupabaseUserToAuthUser(updatedSupabaseUser, userDetails);
            setUser(authUser);
          }
      }

      toast.success("Profile updated successfully!");
      return { success: true };
    } catch (err: any) {
      console.error("Profile update error:", err);
      const errorMessage = err.message || "An unexpected error occurred during profile update.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshWalletBalance = useCallback(async () => {
    if (!user?.id) return;
    // user.id here should be the ID used by walletService (likely from your 'users' table)
    const userIdForWallet = user.id; 

    try {
      const walletResponse = await walletService.getWalletByUserId(userIdForWallet);
      if (walletResponse.data) {
        setUser(prevUser => prevUser ? {
          ...prevUser,
          balance: walletResponse.data!.balance,
          currency: walletResponse.data!.currency,
          vipLevel: walletResponse.data!.vipLevel,
        } : null);
      } else {
        console.warn("Could not refresh wallet balance:", walletResponse.error);
         // If wallet not found, but user exists, maybe set balance to 0 or based on user context
        setUser(prevUser => prevUser ? { ...prevUser, balance: 0 } : null);
      }
    } catch (err) {
      console.error("Error refreshing wallet balance:", err);
      toast.error("Failed to refresh wallet balance.");
    }
  }, [user?.id]);

  const deposit = async (amount: number, method: string): Promise<{ success: boolean; error?: string }> => {
     if (!user?.id) return { success: false, error: "User not authenticated" };
     // user.id here should be the ID used by walletService
     const userIdForWallet = user.id;
    setIsLoading(true);
    try {
      const depositResult = await walletService.handleDeposit({
        userId: userIdForWallet,
        amount,
        currency: user.currency || 'USD', 
        method,
      });

      if (depositResult.success) {
        await refreshWalletBalance(); // This will update user state
        toast.success(`Successfully deposited ${amount} ${user.currency || 'USD'}`);
        return { success: true };
      } else {
        throw new Error(depositResult.error || "Deposit processing failed");
      }
    } catch (err: any) {
      const errorMessage = err.message || "Deposit failed.";
      console.error("Deposit error:", errorMessage);
      toast.error(errorMessage);
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = (): boolean => {
    // Check role from AuthUser, and isAdmin flag
    return user?.isAdmin || user?.role?.toLowerCase() === 'admin' || false;
  };

  const contextValue: AuthContextType = {
    isAuthenticated: !!user,
    user,
    isLoading,
    error,
    login,
    adminLogin,
    register,
    logout,
    reset,
    updateProfile,
    refreshWalletBalance,
    deposit,
    isAdmin,
  };

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
