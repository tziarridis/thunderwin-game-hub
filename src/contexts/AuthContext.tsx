import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

// AuthUser represents the authenticated user
export interface AuthUser {
  id: string;
  email: string;
  username?: string;
  name?: string;
  avatar?: string;  // Keep the original property name
  role?: string;
  isDemo?: boolean;
  currency?: string;
  isAdmin?: boolean;
}

// AuthContextType represents the shape of the auth context
export interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  updateUser: (data: Partial<AuthUser>) => void;
  refreshWalletBalance: () => Promise<void>;
  isAdmin: boolean; // Added the isAdmin property
}

// Create the auth context with a default value
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  login: async () => {},
  register: async () => {},
  logout: () => {},
  loading: false,
  error: null,
  updateUser: async () => {},
  refreshWalletBalance: async () => Promise.resolve(),
  isAdmin: false,
});

// AuthProvider component that wraps the app and provides the auth context
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const session = supabase.auth.getSession();

    supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.session) {
        setIsAuthenticated(true);
        await fetchUser(session.session.user.id);
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    })

    if (session) {
      setLoading(true);
      if (session.data?.session?.user) {
        setIsAuthenticated(true);
        fetchUser(session.data.session.user.id).then(() => setLoading(false));
      } else {
        setIsAuthenticated(false);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
      }
    } else {
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      setLoading(false);
    }
  }, [navigate]);

  const fetchUser = async (userId: string) => {
    try {
      setLoading(true);
      const { data: userDetails, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) {
        throw new Error(userError.message);
      }

      if (userDetails) {
        const authUser: AuthUser = {
          id: userId,
          email: userDetails.email,
          username: userDetails.username || userDetails.email.split('@')[0],
          name: userDetails.full_name || userDetails.username || userDetails.email.split('@')[0],
          avatar: userDetails.avatar_url,
          role: userDetails.role,
          isDemo: userDetails.is_demo,
          currency: userDetails.currency,
          isAdmin: userDetails.is_admin || false,
        };
        setUser(authUser);
        setIsAdmin(authUser.isAdmin || false);
      } else {
        // Handle the case where user details are not found
        console.warn("User details not found for ID:", userId);
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

  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setIsAuthenticated(true);
        await fetchUser(data.user.id);
        navigate('/casino');
        toast.success('Login successful!');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, username: string) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            username: username,
            full_name: username,
          },
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      if (data.user) {
        setIsAuthenticated(true);
        await fetchUser(data.user.id);
        navigate('/casino');
        toast.success('Registration successful!');
      }
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
      setIsAuthenticated(false);
      setUser(null);
      setIsAdmin(false);
      navigate('/');
      toast.success('Logout successful!');
    } catch (err: any) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (data: Partial<AuthUser>) => {
    if (!user) {
      console.error("No user is currently logged in.");
      toast.error("No user is currently logged in.");
      return;
    }

    try {
      setLoading(true);

      // Prepare the update object based on the data passed in
      const updates: { [key: string]: any } = {};
      if (data.username) updates.username = data.username;
      if (data.name) updates.full_name = data.name;
      if (data.avatar) updates.avatar_url = data.avatar; // Map 'avatar' to 'avatar_url'

      const { error } = await supabase
        .from('users')
        .update(updates)
        .eq('id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      // Fetch the updated user data
      await fetchUser(user.id);
      toast.success('Profile updated successfully!');
    } catch (err: any) {
      console.error("Error updating user:", err.message);
      setError(err.message);
      toast.error(err.message);
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

      // Mock fetching wallet balance (replace with actual API call)
      const mockBalance = Math.floor(Math.random() * 1000);

      // Update user object with the new balance
      const updatedUser = { ...user, balance: mockBalance };
      setUser(updatedUser);

      toast.success('Wallet balance refreshed!');
    } catch (err: any) {
      console.error("Error refreshing wallet balance:", err.message);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    isAuthenticated,
    user,
    login,
    register,
    logout,
    loading,
    error,
    updateUser,
    refreshWalletBalance,
    isAdmin,
  };

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
