
import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface AuthContextType {
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean;
  user: any;
}

export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isAdmin: false,
  isLoading: true,
  user: null
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setIsAuthenticated(!!session);
        if (session?.user) {
          setTimeout(async () => {
            const { data } = await supabase
              .from('profiles')
              .select('is_admin')
              .eq('id', session.user.id)
              .single();
              
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
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
          .then(({ data }) => {
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
    <AuthContext.Provider value={{ isAuthenticated, isAdmin, isLoading, user }}>
      {children}
    </AuthContext.Provider>
  );
};
