
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user'; // Your app's User type
import { userService } from '@/services/userService';
import { toast } from 'sonner';

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  session: Session | null;
  loading: boolean;
  isAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, metadata?: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>; // Renamed from signOut in some previous mental model
  updateUserMetadata: (metadata: Record<string, any>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        if (error) throw error;
        setSession(currentSession);
        if (currentSession?.user) {
          const appUser = await userService.getUserById(currentSession.user.id);
          setUser(appUser);
          setIsAdmin(appUser?.role === 'admin');
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
        setUser(null);
        setSession(null);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      setLoading(true);
      setSession(newSession);
      if (newSession?.user) {
        const appUser = await userService.getUserById(newSession.user.id);
        setUser(appUser);
        setIsAdmin(appUser?.role === 'admin');
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      setLoading(false);
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false); // Ensure loading is set to false on error
      throw error;
    }
    // Auth listener will handle setting user and session
    // setLoading(false); // Auth listener will set loading to false after user data is fetched
  };

  const register = async (email: string, password: string, metadata?: Record<string, any>) => {
    setLoading(true);
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    if (error) {
      toast.error(error.message);
      setLoading(false); // Ensure loading is set to false on error
      throw error;
    }
    if (data.user && !data.session) {
         toast.info("Registration successful! Please check your email to verify your account.");
    }
    setLoading(false); // Ensure loading is set to false
  };

  const logout = async () => { // This is the correct function name
    setLoading(true);
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast.error(error.message);
      setLoading(false); // Ensure loading is set to false on error
      throw error;
    }
    setUser(null);
    setSession(null);
    setIsAdmin(false);
    setLoading(false);
    toast.success("Logged out successfully.");
  };
  
  const updateUserMetadata = async (metadata: Record<string, any>) => {
    if (!user || !session) {
      toast.error("User not authenticated.");
      throw new Error("User not authenticated.");
    }
    setLoading(true);
    const { data: updatedSupabaseUser, error } = await supabase.auth.updateUser({ data: metadata });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      throw error;
    }
    if (updatedSupabaseUser?.user) {
      const appUser = await userService.getUserById(updatedSupabaseUser.user.id);
      setUser(appUser);
    }
    setLoading(false);
    toast.success("Profile updated!");
  };


  const value = {
    isAuthenticated: !!user && !!session,
    user,
    session,
    loading,
    isAdmin,
    login,
    register,
    logout, // Use logout
    updateUserMetadata,
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
