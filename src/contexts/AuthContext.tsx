
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from "@/components/ui/use-toast";

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: any;
  login?: (email: string, password: string) => Promise<void>;
  logout?: () => Promise<void>;
  register?: (email: string, password: string, username: string) => Promise<void>;
  adminLogin?: (email: string, password: string) => Promise<void>;
  updateBalance?: (amount: number) => Promise<void>;
  deposit?: (amount: number) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  user: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { toast } = useToast();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  // Login function
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error.message,
        });
        throw error;
      }
      
      // Explicitly returning void
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          variant: "destructive",
          title: "Logout failed",
          description: error.message,
        });
        throw error;
      }
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  // Register function
  const register = async (email: string, password: string, username: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Registration failed",
          description: error.message,
        });
        throw error;
      }
      
      // Explicitly returning void
    } catch (error) {
      console.error("Register error:", error);
      throw error;
    }
  };

  // Admin login function
  const adminLogin = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) {
        toast({
          variant: "destructive",
          title: "Admin login failed",
          description: error.message,
        });
        throw error;
      }
      
      // Check if user is admin after login
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user?.id)
        .single();
      
      if (!profileData?.is_admin) {
        toast({
          variant: "destructive",
          title: "Access denied",
          description: "You do not have admin privileges",
        });
        await logout();
        throw new Error("Not an admin");
      }
      
      // Explicitly returning void
    } catch (error) {
      console.error("Admin login error:", error);
      throw error;
    }
  };

  // Update wallet balance
  const updateBalance = async (amount: number) => {
    if (!user) return;
    
    try {
      // Implementation would depend on your wallet service
      console.log(`Balance updated for user ${user.id} by ${amount}`);
      toast({
        title: "Balance updated",
        description: `Your balance has been updated by ${amount}`,
      });
    } catch (error) {
      console.error("Update balance error:", error);
      throw error;
    }
  };

  // Deposit function
  const deposit = async (amount: number) => {
    if (!user) return;
    
    try {
      // Implementation would depend on your payment service
      console.log(`Deposit of ${amount} made for user ${user.id}`);
      toast({
        title: "Deposit successful",
        description: `You have deposited ${amount}`,
      });
      
      // Update balance after deposit
      await updateBalance(amount);
    } catch (error) {
      console.error("Deposit error:", error);
      throw error;
    }
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            // Add a fallback for is_admin property
            setIsAdmin(!!data?.is_admin);
            setUser(session.user);
            setIsLoading(false);
          }, 0);
        } else {
          setIsAdmin(false);
          setUser(null);
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setIsAuthenticated(!!session);
      if (session?.user) {
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
            // Add a fallback for is_admin property
            setIsAdmin(!!data?.is_admin);
            setUser(session.user);
            setIsLoading(false);
          });
      } else {
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      isAdmin, 
      isLoading, 
      user, 
      login, 
      logout, 
      register, 
      adminLogin,
      updateBalance,
      deposit
    }}>
      {children}
    </AuthContext.Provider>
  );
};
