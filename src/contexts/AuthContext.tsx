import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import {
  AuthError,
  Session as SupabaseSession,
  User as SupabaseUser,
} from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
// Corrected imports: these now come from index.d.ts which re-exports from user.d.ts and kyc.ts
import { LoginCredentials, RegisterCredentials, UserRole, UserStatus, KycStatus } from '@/types/index.d'; 
// AppSpecificUser is the User interface from src/types/user.ts (camelCase properties)
import { AppSpecificUser } from '@/types';


export interface AppUser extends AppSpecificUser { // Extends AppSpecificUser (User from user.ts)
  aud: string; 
  app_metadata: SupabaseUser['app_metadata'];
  user_metadata: SupabaseUser['user_metadata'];
  // Properties like isActive, createdAt, updatedAt are inherited from AppSpecificUser
}

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null; 
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>;
  register: (credentials: RegisterCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>;
  logout: () => Promise<void>;
  adminLogin?: (credentials: LoginCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>;
  updateUserPassword?: (password: string) => Promise<{ error: AuthError | null }>;
  fetchAndUpdateUser: () => Promise<void>;
  refreshWalletBalance?: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdminState, setIsAdminState] = useState(false);

  const enrichUserWithProfile = async (supabaseUser: SupabaseUser): Promise<AppUser> => {
    const { data: profileData, error: profileError } = await supabase
      .from('users') 
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { 
      console.error('Error fetching user profile from public.users:', profileError);
    }
    
    const baseCreatedAt = supabaseUser.created_at || new Date().toISOString();
    const baseUpdatedAt = supabaseUser.updated_at || baseCreatedAt;

    // Map to AppUser which expects camelCase for isActive, createdAt, updatedAt
    const enrichedUser: AppUser = {
      // Fields from SupabaseUser mapped to AppSpecificUser (camelCase)
      id: supabaseUser.id,
      email: supabaseUser.email || '', // Ensure email is not null if AppSpecificUser.email is non-nullable
      username: profileData?.username || supabaseUser.email?.split('@')[0] || undefined,
      
      // camelCase properties for AppSpecificUser
      isActive: profileData?.is_active ?? (profileData?.status === 'active') ?? (!!supabaseUser.email_confirmed_at),
      createdAt: profileData?.created_at || baseCreatedAt,
      updatedAt: profileData?.updated_at || baseUpdatedAt,
      lastLogin: supabaseUser.last_sign_in_at || undefined,
      
      // Supabase specific metadata
      aud: supabaseUser.aud,
      app_metadata: supabaseUser.app_metadata || {},
      user_metadata: supabaseUser.user_metadata || {},

      // Profile related (ensure these align with AppSpecificUser's Profile or are optional)
      profile: {
        firstName: profileData?.first_name || undefined,
        lastName: profileData?.last_name || undefined,
        avatarUrl: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url || undefined,
        dateOfBirth: profileData?.date_of_birth || undefined,
      },
      
      // Roles and status (ensure these align with AppSpecificUser or are optional)
      roles: profileData?.roles || (profileData?.role ? [profileData.role as UserRole] : undefined),
      isAdmin: (profileData?.role === 'admin' || (Array.isArray(profileData?.roles) && profileData.roles.includes('admin'))) ?? false,
      isStaff: profileData?.is_staff ?? false,
      kycStatus: (profileData?.kyc_status as KycStatus) || 'not_started',
      
      // Other fields from comprehensive User (index.d.ts) that might be useful to include if AppSpecificUser is expanded
      // For now, ensuring AppSpecificUser requirements are met.
      // Example: phone_number: profileData?.phone_number || supabaseUser.phone || undefined,
    };
    
    console.log("Enriched user in AuthContext:", enrichedUser);
    return enrichedUser;
  };
  
  const fetchAndUpdateUser = useCallback(async () => {
    console.log("AuthContext: fetchAndUpdateUser called");
    setLoading(true);
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error("AuthContext: Error getting session:", sessionError);
      setUser(null);
      setIsAdminState(false);
      setLoading(false);
      setError(sessionError.message);
      return;
    }
    
    if (session && session.user) {
      try {
        const enriched = await enrichUserWithProfile(session.user);
        setUser(enriched);
        setIsAdminState(enriched.isAdmin ?? (Array.isArray(enriched.roles) && enriched.roles.includes('admin')));
        setError(null);
      } catch (e: any) {
        console.error("AuthContext: Error enriching user profile:", e);
        const fallbackCreatedAt = session.user.created_at || new Date().toISOString();
        const fallbackUser: AppUser = { 
            id: session.user.id,
            email: session.user.email || '', // Ensure email is not null
            aud: session.user.aud,
            // camelCase for AppUser
            isActive: !!session.user.email_confirmed_at, 
            createdAt: fallbackCreatedAt,
            updatedAt: session.user.updated_at || fallbackCreatedAt,
            lastLogin: session.user.last_sign_in_at || undefined,

            app_metadata: session.user.app_metadata || {},
            user_metadata: session.user.user_metadata || {},
            username: session.user.email?.split('@')[0] || undefined,
            isAdmin: false,
            kycStatus: 'not_started',
         };
        setUser(fallbackUser); 
        setIsAdminState(false);
        setError("Failed to load full user profile.");
      }
    } else {
      setUser(null);
      setIsAdminState(false);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchAndUpdateUser(); 

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("AuthContext: Auth state changed", _event, session);
      if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'TOKEN_REFRESHED') {
        if (session && session.user) {
          // Use setTimeout to avoid potential deadlocks with Supabase calls within onAuthStateChange
          setTimeout(() => {
            fetchAndUpdateUser();
          }, 0);
        } else {
           setUser(null);
           setIsAdminState(false);
        }
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdminState(false);
      }
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchAndUpdateUser]);

  const login = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);
    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return { error: signInError, data: null };
    }
    // onAuthStateChange listener will call fetchAndUpdateUser
    setLoading(false);
    return { error: null, data: {} }; // Placeholder if data is not used, ensure to return signIn data
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: credentials.email,
      password: credentials.password,
      options: {
        data: {
          username: credentials.username || credentials.email?.split('@')[0],
          first_name: credentials.firstName,
          last_name: credentials.lastName,
        }
      }
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return { error: signUpError, data: null };
    }
    if (data.user) {
      try {
        const nowISO = new Date().toISOString();
        const { error: profileInsertError } = await supabase
          .from('users') 
          .insert({
            id: data.user.id, 
            email: data.user.email,
            username: credentials.username || data.user.email?.split('@')[0],
            first_name: credentials.firstName, // These should map to your DB columns
            last_name: credentials.lastName,  // e.g. first_name, last_name
            role: 'user', 
            status: 'pending_verification', 
            created_at: nowISO,
            updated_at: nowISO,
            is_active: false, // Or true, depending on verification flow
          });

        if (profileInsertError) {
          console.error("Error creating user profile in public.users:", profileInsertError);
        }
      } catch (e: any) {
         console.error("Error in post-registration profile creation:", e);
         setError("Registration process encountered an issue creating profile details.");
      }
    }
    setLoading(false);
    return { error: null, data: {} }; // Placeholder
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
    // user and isAdminState will be reset by onAuthStateChange listener
    setLoading(false);
  };
  
  const adminLogin = async (credentials: LoginCredentials) => {
    setLoading(true);
    setError(null);
    const { data, error: signInError } = await supabase.auth.signInWithPassword(credentials);

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
      return { error: signInError, data: null };
    }

    if (data.user) {
      const tempEnrichedUser = await enrichUserWithProfile(data.user);

      if (tempEnrichedUser && (tempEnrichedUser.isAdmin || (Array.isArray(tempEnrichedUser.roles) && tempEnrichedUser.roles.includes('admin')))) {
        // User is admin, state will be set by onAuthStateChange listener -> fetchAndUpdateUser
        // To be sure, call fetchAndUpdateUser explicitly after successful admin check
        await fetchAndUpdateUser(); 
        setLoading(false);
        return { error: null, data };
      } else {
        await supabase.auth.signOut(); 
        const notAdminError = { name: "AuthError", message: "User is not an administrator." } as AuthError;
        setError(notAdminError.message);
        setUser(null); 
        setIsAdminState(false); 
        setLoading(false);
        return { error: notAdminError, data: null };
      }
    }
    setLoading(false); 
    return { error: {name: "AuthError", message: "Admin login failed or user data unavailable."} as AuthError, data: null };
  };

  const updateUserPassword = async (newPassword: string) => {
    setLoading(true);
    setError(null);
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) {
      setError(error.message);
      setLoading(false);
      return { error };
    }
    setLoading(false);
    return { error: null };
  };

  const refreshWalletBalance = async () => {
    console.warn("AuthContext: refreshWalletBalance called, but not implemented here. Should be in WalletContext/Service.");
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      appUser: user, 
      isAdmin: isAdminState, 
      isAuthenticated: !!user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      adminLogin, 
      updateUserPassword, 
      fetchAndUpdateUser,
      refreshWalletBalance
    }}>
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

export { AuthProvider };
