import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { userService } from '@/services/userService';
import { AuthUser, AuthContextType } from '@/types'; // Ensure AuthContextType is imported
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
        // Fetch user details from your 'users' table (or 'profiles')
        const { data: userDetails, error: profileError } = await supabase
          .from('users') // Assuming your custom user table is 'users'
          .select('*')
          .eq('id', supabaseUser.id) // Assuming 'id' in your users table matches auth.users.id
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: "Searched for a single row, but found no rows"
          console.error('Error fetching user profile:', profileError);
          // Don't throw, proceed with basic data
        }
        profileData = userDetails;
      } catch (e) {
        console.error('Exception fetching user profile:', e);
      }
    }
    
    // Fetch wallet details
    let walletDetails = null;
    if (profileData?.id) { // Use the ID from your custom users table
        const walletResponse = await walletService.getWalletByUserId(profileData.id);
        if (walletResponse.data) {
            walletDetails = walletResponse.data;
        } else {
            console.warn('Wallet not found for user:', profileData.id);
        }
    }


    return {
      id: profileData?.id || supabaseUser.id, // Use your custom user table ID if available
      username: profileData?.username || supabaseUser.email?.split('@')[0] || 'User',
      email: supabaseUser.email || 'No email',
      firstName: profileData?.first_name || profileData?.firstName || '', // Handle both snake_case and camelCase
      lastName: profileData?.last_name || profileData?.lastName || '',   // Handle both snake_case and camelCase
      avatar: profileData?.avatar || undefined,
      avatarUrl: profileData?.avatar_url || profileData?.avatar || undefined,
      role: profileData?.role || 'user',
      isAdmin: profileData?.is_admin || profileData?.role === 'admin', // Example admin logic
      isVerified: supabaseUser.email_confirmed_at ? true : false,
      vipLevel: walletDetails?.vipLevel ?? profileData?.vip_level ?? 0,
      balance: walletDetails?.balance ?? profileData?.balance ?? 0,
      currency: walletDetails?.currency ?? profileData?.currency ?? 'USD',
    };
  }, []);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        if (session?.user) {
          const authUser = await mapSupabaseUserToAuthUser(session.user);
          setUser(authUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Initial session check
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const authUser = await mapSupabaseUserToAuthUser(session.user);
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
        // Check if user is admin
        if (authUser?.isAdmin) {
          setUser(authUser);
          setSession(data.session);
          toast.success("Admin logged in successfully!");
          return { success: true };
        } else {
          await supabase.auth.signOut(); // Sign out non-admin user
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
          },
        },
      });

      if (signUpError) throw signUpError;

      if (signUpData.user) {
        // User is created in auth.users. Now create a corresponding entry in your public 'users' table.
        const { error: createUserError } = await userService.createUserProfile({
            id: signUpData.user.id, // This should be the auth.user.id
            email: signUpData.user.email!,
            username: username,
            // Add other default fields for your 'users' table here if needed
        });

        if (createUserError) {
          // Potentially roll back Supabase auth user or handle cleanup
          console.error("Failed to create user profile entry:", createUserError);
          throw new Error(`Registration partially failed: ${createUserError.message}`);
        }
        
        // Attempt to sign in the user immediately after successful registration and profile creation
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

        if (signInError) {
            console.warn("Auto-login after registration failed:", signInError);
            toast.success("Registration successful! Please log in.");
            // Don't set user/session here, let them log in manually
        } else if (signInData.user && signInData.session) {
            setSession(signInData.session);
            const authUser = await mapSupabaseUserToAuthUser(signInData.user);
            setUser(authUser);
            toast.success("Registration successful and logged in!");
        } else {
             toast.success("Registration successful! Please log in.");
        }
        return { success: true };

      }
      return { success: false, error: "Registration failed: No user data returned" };
    } catch (err: any) {
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
        redirectTo: `${window.location.origin}/update-password`,
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
    setIsLoading(true);
    setError(null);
    try {
      // Prepare data for your 'users' table
      const profileUpdates: any = {};
      if (data.username) profileUpdates.username = data.username;
      if (data.firstName) profileUpdates.first_name = data.firstName; // Map to snake_case for Supabase
      if (data.lastName) profileUpdates.last_name = data.lastName;   // Map to snake_case for Supabase
      if (data.avatar) profileUpdates.avatar = data.avatar;       // Assuming 'avatar' is the column name

      if (Object.keys(profileUpdates).length > 0) {
          const { error: updateError } = await supabase
              .from('users') // Your custom user table
              .update(profileUpdates)
              .eq('id', user.id); // Match with the ID from your 'users' table

          if (updateError) throw updateError;
      }

      // If email needs to be updated, handle it separately via Supabase Auth
      if (data.email && data.email !== user.email) {
        const { data: emailUpdateData, error: emailUpdateError } = await supabase.auth.updateUser({ email: data.email });
        if (emailUpdateError) throw emailUpdateError;
        // Email update might require confirmation, user object might not reflect immediately
      }
      
      // Re-fetch user data to reflect changes
      if (session?.user) {
          const updatedSupabaseUser = (await supabase.auth.getUser()).data.user;
          if (updatedSupabaseUser) {
            const { data: userDetails } = await supabase.from('users').select('*').eq('id', updatedSupabaseUser.id).single();
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

    try {
      const walletResponse = await walletService.getWalletByUserId(user.id);
      if (walletResponse.data) {
        setUser(prevUser => prevUser ? {
          ...prevUser,
          balance: walletResponse.data!.balance,
          currency: walletResponse.data!.currency, // Update currency from wallet
          vipLevel: walletResponse.data!.vipLevel,
        } : null);
      } else {
        console.warn("Could not refresh wallet balance:", walletResponse.error);
      }
    } catch (err) {
      console.error("Error refreshing wallet balance:", err);
      toast.error("Failed to refresh wallet balance.");
    }
  }, [user?.id]);

  const deposit = async (amount: number, method: string): Promise<{ success: boolean; error?: string }> => {
     if (!user?.id) return { success: false, error: "User not authenticated" };
    setIsLoading(true);
    try {
      // This is a placeholder. Actual deposit logic would involve payment gateways.
      // For now, let's assume the deposit updates a 'transactions' table and then the wallet.
      console.log(`Attempting deposit of ${amount} via ${method} for user ${user.id}`);

      // Example: Call walletService to handle the deposit logic which might interact with Supabase
      const depositResult = await walletService.handleDeposit({
        userId: user.id,
        amount,
        currency: user.currency || 'USD', // Use user's currency
        method, // e.g., 'credit_card', 'paypal'
      });

      if (depositResult.success) {
        await refreshWalletBalance();
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
    return user?.isAdmin || user?.role === 'admin' || false;
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
