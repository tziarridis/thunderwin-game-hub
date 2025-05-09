
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@/types';
import { signIn, signOut, signUp, getCurrentUser, updateUserProfile } from '@/utils/authUtils';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  avatarUrl?: string;
  role?: string;
  isAdmin?: boolean;
  isVerified?: boolean;
  vipLevel?: number;
  balance?: number;
  currency?: string;
  name?: string;
}

export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  isLoading: boolean;
  error?: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  adminLogin: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; user?: AuthUser | null; error?: string }>;
  logout: () => Promise<void>;
  reset: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (data: Partial<AuthUser>) => Promise<{ success: boolean; error?: string }>;
  refreshWalletBalance: () => Promise<void>;
  deposit: (amount: number, method: string) => Promise<{ success: boolean; error?: string }>;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  isLoading: false,
  login: async () => ({ success: false }),
  adminLogin: async () => ({ success: false }),
  register: async () => ({ success: false }),
  logout: async () => {},
  reset: async () => ({ success: false }),
  updateProfile: async () => ({ success: false }),
  refreshWalletBalance: async () => {},
  deposit: async () => ({ success: false }),
  isAdmin: () => false
});

// AuthProvider component that wraps the app and provides the auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isAdminUser, setIsAdmin] = useState(false);

  // Check for demo admin in localStorage on initial load
  useEffect(() => {
    const isDemoAdmin = localStorage.getItem('demo-admin') === 'true';
    if (isDemoAdmin) {
      console.log("Restoring demo admin session from localStorage");
      const demoAdminUser: AuthUser = {
        id: "demo-admin-id",
        username: "admin",
        email: "admin@example.com",
        name: "Demo Admin",
        isAdmin: true,
        isVerified: true,
        balance: 10000,
        vipLevel: 10,
        currency: "USD",
        role: "admin",
        firstName: "Demo", 
        lastName: "Admin",
        avatar: "/placeholder.svg"
      };
      
      setUser(demoAdminUser);
      setIsAuthenticated(true);
      setIsAdmin(true);
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Skip Supabase session check if we already have a demo admin
    const isDemoAdmin = localStorage.getItem('demo-admin') === 'true';
    if (isDemoAdmin) {
      return;
    }
    
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        
        console.log("AuthContext - Checking session:", data?.session ? "Session exists" : "No session");
        
        if (data?.session) {
          setIsAuthenticated(true);
          await fetchUser(data.session.user.id);
        } else {
          setIsAuthenticated(false);
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error checking session:", error);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("AuthContext - Auth state changed:", event);
      
      if (session) {
        setIsAuthenticated(true);
        
        // Use setTimeout to avoid potential auth state deadlocks
        setTimeout(() => {
          fetchUser(session.user.id);
        }, 0);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [navigate]);

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Attempting to login user:", email);
      const { user, error } = await signIn(email, password);

      if (error) {
        throw new Error(error);
      }

      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        setIsAdmin(user.isAdmin || false);
        navigate('/casino');
        toast.success('Login successful!');
        return { success: true };
      }
      return { success: false, error: 'Login failed' };
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Modified admin login function to handle demo admin user better
  const adminLogin = async (username: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log("Admin login attempt:", username, password);
      
      // Special case for demo admin credentials
      if (username === "admin" && password === "admin") {
        console.log("Demo admin credentials detected");
        
        // Create a demo admin user with all required fields
        const demoAdminUser: AuthUser = {
          id: "demo-admin-id",
          username: "admin",
          email: "admin@example.com",
          name: "Demo Admin",
          isAdmin: true,
          isVerified: true,
          balance: 10000,
          vipLevel: 10,
          currency: "USD",
          role: "admin",
          firstName: "Demo", 
          lastName: "Admin",
          avatar: "/placeholder.svg"
        };
        
        // Set the user and authentication state immediately
        setUser(demoAdminUser);
        setIsAuthenticated(true);
        setIsAdmin(true);
        
        // Store demo admin status in localStorage for persistence
        localStorage.setItem('demo-admin', 'true');
        
        console.log("Auth state immediately after demo login:", {
          isAuthenticated: true,
          user: demoAdminUser,
          isAdmin: true
        });
        
        // Show success message
        toast.success('Admin login successful!');
        
        // Short timeout to ensure state updates are processed
        setTimeout(() => {
          console.log("Now navigating to /admin/dashboard");
          navigate('/admin/dashboard', { replace: true });
        }, 100);
        
        return { success: true };
      }
      
      // Regular authentication flow if not using demo credentials
      console.log("Using regular auth flow for admin");
      const { user, error } = await signIn(username, password);

      if (error) {
        throw new Error(error);
      }

      if (user) {
        setIsAuthenticated(true);
        setUser(user);
        setIsAdmin(user.isAdmin || false);
        
        if (user.isAdmin) {
          toast.success('Admin login successful!');
          
          // Use a longer timeout to ensure state is updated before navigation
          setTimeout(() => {
            console.log("Now navigating to /admin/dashboard");
            navigate('/admin/dashboard');
          }, 500); // Increased timeout for better stability
          
          return { success: true };
        } else {
          // User is not an admin
          toast.error('You do not have admin privileges');
          logout();
          return { success: false, error: 'Not authorized as admin' };
        }
      }
      
      return { success: false, error: 'Login failed' };
    } catch (error: any) {
      console.error("Admin login error:", error);
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      toast.error(error.message || "Login failed");
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (username: string, email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      console.log("Starting registration process for:", email);
      const { user, error } = await signUp(email, password, username);

      if (error) {
        throw new Error(error);
      }

      if (user) {
        // Don't set authenticated state here - we'll make the user log in first
        toast.success('Registration successful! Please login with your new account.');
        return { success: true, user };
      }
      
      return { success: false, error: 'Registration failed' };
    } catch (err: any) {
      console.error("Registration error:", err);
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear demo admin state if it exists
      if (localStorage.getItem('demo-admin') === 'true') {
        localStorage.removeItem('demo-admin');
      }
      
      const { error } = await signOut();
      if (error) {
        throw new Error(error);
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      navigate('/');
      toast.success('Logout successful!');
      return;
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: Partial<AuthUser>) => {
    if (!user) {
      console.error("No user is currently logged in.");
      toast.error("No user is currently logged in.");
      return { success: false, error: "No user logged in" };
    }

    try {
      setLoading(true);
      
      const updates: { [key: string]: any } = {};
      if (data.username) updates.username = data.username;
      if (data.firstName) updates.first_name = data.firstName;
      if (data.lastName) updates.last_name = data.lastName;
      if (data.avatar) updates.avatar = data.avatar;
      if (data.avatarUrl) updates.avatar = data.avatarUrl;
      
      const { user: updatedUser, error } = await updateUserProfile(user.id, updates);

      if (error) {
        throw new Error(error);
      }

      if (updatedUser) {
        setUser(prevUser => ({
          ...prevUser!,
          ...updatedUser
        }));
      }
      
      toast.success('Profile updated successfully!');
      return { success: true };
    } catch (err: any) {
      console.error("Error updating user:", err.message);
      setError(err.message);
      toast.error(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  const refreshWalletBalance = async () => {
    if (!user) {
      console.error("No user is currently logged in.");
      toast.error("No user is currently logged in.");
      return;
    }

    try {
      setLoading(true);

      // Fetch the latest wallet balance
      const { data: walletData, error } = await supabase
        .from('wallets')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (error) {
        throw new Error(error.message);
      }

      if (walletData) {
        // Update user object with the new balance
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            balance: walletData.balance,
            vipLevel: walletData.vip_level,
            currency: walletData.currency
          };
        });

        toast.success('Wallet balance refreshed!');
      }
    } catch (err: any) {
      console.error("Error refreshing wallet balance:", err.message);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };
  
  const deposit = async (amount: number, method: string) => {
    if (!user) {
      console.error("No user is currently logged in.");
      toast.error("No user is currently logged in.");
      return { success: false, error: "No user is logged in" };
    }

    try {
      setLoading(true);
      
      // Create deposit transaction
      const { data: txData, error: txError } = await supabase
        .from('transactions')
        .insert({
          player_id: user.id,
          amount: amount,
          type: 'deposit',
          currency: user.currency || 'USD',
          status: 'completed',
          provider: method
        })
        .select()
        .single();
      
      if (txError) throw new Error(txError.message);
      
      // Update wallet balance
      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('balance')
        .eq('user_id', user.id)
        .single();
        
      if (walletError) throw new Error(walletError.message);
      
      const newBalance = Number(walletData.balance) + Number(amount);
      
      const { error: updateError } = await supabase
        .from('wallets')
        .update({ balance: newBalance })
        .eq('user_id', user.id);
        
      if (updateError) throw new Error(updateError.message);
      
      // Refresh the user's balance
      await refreshWalletBalance();
      
      toast.success(`Successfully deposited ${amount} ${user.currency || 'USD'}`);
      return { success: true };
    } catch (err: any) {
      console.error("Error depositing funds:", err.message);
      toast.error(err.message || "Failed to process deposit");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const reset = async (email: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      
      if (error) throw new Error(error.message);
      
      toast.success("Password reset email sent. Please check your inbox.");
      return { success: true };
    } catch (err: any) {
      toast.error(err.message || "Failed to send reset email");
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      console.log("Fetching user data for ID:", userId);
      
      const currentUser = await getCurrentUser();
      
      if (currentUser) {
        console.log("User data fetched successfully:", currentUser);
        setUser(currentUser);
        setIsAdmin(currentUser.isAdmin || false);
      } else {
        console.warn("No user data found for ID:", userId);
        setUser(null);
        setIsAdmin(false);
      }
    } catch (err: any) {
      console.error("Error fetching user:", err.message);
      setError(err.message);
      setUser(null);
      setIsAdmin(false);
    } finally {
      setLoading(false);
    }
  };
  
  const isAdminCheck = () => {
    // Check both user.isAdmin and localStorage for demo admin
    const isDemoAdmin = localStorage.getItem('demo-admin') === 'true';
    return Boolean(user?.isAdmin) || isDemoAdmin;
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    isLoading: loading,
    error,
    updateProfile,
    refreshWalletBalance,
    deposit,
    adminLogin,
    reset,
    isAdmin: isAdminCheck
  };

  // Log auth context value for debugging
  console.log("AuthContext - Current context value:", {
    isAuthenticated,
    isAdmin: isAdminCheck(),
    hasUser: !!user,
    isLoading: loading
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  return useContext(AuthContext);
};
