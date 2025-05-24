
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { AdminRole } from '@/types/admin';
import { adminService } from '@/services/adminService';

interface AdminAuthContextType {
  user: User | null;
  session: Session | null;
  adminRoles: AdminRole[];
  isAdmin: boolean;
  hasRole: (role: string) => boolean;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch admin roles after authentication
          setTimeout(async () => {
            try {
              const roles = await adminService.getUserRoles(session.user.id);
              setAdminRoles(roles);
            } catch (error) {
              console.error('Error fetching admin roles:', error);
              setAdminRoles([]);
            }
          }, 0);
        } else {
          setAdminRoles([]);
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      if (session?.user) {
        setTimeout(async () => {
          try {
            const roles = await adminService.getUserRoles(session.user.id);
            setAdminRoles(roles);
          } catch (error) {
            console.error('Error fetching admin roles:', error);
            setAdminRoles([]);
          }
          setLoading(false);
        }, 0);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      throw error;
    }
  };

  const hasRole = (role: string): boolean => {
    return adminRoles.some(r => r.role === role && r.is_active);
  };

  const isAdmin = adminRoles.length > 0 && adminRoles.some(r => r.is_active);

  const value = {
    user,
    session,
    adminRoles,
    isAdmin,
    hasRole,
    loading,
    signIn,
    signOut,
  };

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
