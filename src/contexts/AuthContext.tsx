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
import { User, LoginCredentials, RegisterCredentials, UserRole, UserStatus, KycStatus } from '@/types'; 

export interface AppUser extends User {
  aud: string; 
  app_metadata: SupabaseUser['app_metadata'];
  user_metadata: SupabaseUser['user_metadata'];
  // Ensure all non-optional fields from User are here or handled
  // isActive, createdAt, updatedAt are now part of User type from @/types
  // and User makes `is_active` non-optional, `created_at` and `updated_at` non-optional.
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

    const enrichedUser: AppUser = {
      // Fields from SupabaseUser
      id: supabaseUser.id,
      aud: supabaseUser.aud,
      email: supabaseUser.email || null,
      app_metadata: supabaseUser.app_metadata || {},
      user_metadata: supabaseUser.user_metadata || {},
      last_sign_in_at: supabaseUser.last_sign_in_at || null,
      
      // Fields from User type (src/types/index.d.ts), prioritizing profileData or defaults
      username: profileData?.username || supabaseUser.email?.split('@')[0] || null,
      avatar_url: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
      first_name: profileData?.first_name || null,
      last_name: profileData?.last_name || null,
      role: profileData?.role as UserRole || undefined,
      created_at: profileData?.created_at || baseCreatedAt,
      updated_at: profileData?.updated_at || baseUpdatedAt,
      
      status: (profileData?.status as UserStatus) || 'active',
      is_active: profileData?.is_active ?? (profileData?.status === 'active') ?? (!!supabaseUser.email_confirmed_at),
      is_banned: profileData?.is_banned ?? false,
      balance: profileData?.balance ?? 0,
      currency: profileData?.currency ?? 'USD',
      vip_level_id: profileData?.vip_level_id,
      favorite_game_ids: profileData?.favorite_game_ids || [],
      phone_number: profileData?.phone_number || supabaseUser.phone || undefined,
      date_of_birth: profileData?.date_of_birth,
      address: profileData?.address,
      is_staff: profileData?.is_staff ?? false,
      is_admin: (profileData?.role === 'admin' || (Array.isArray(profileData?.roles) && profileData.roles.includes('admin'))) ?? false,
      roles: profileData?.roles || (profileData?.role ? [profileData.role as UserRole] : []),
      kyc_status: (profileData?.kyc_status as KycStatus) || 'not_started',
      is_verified: profileData?.is_verified ?? !!supabaseUser.email_confirmed_at,
      referral_code: profileData?.referral_code,
      referred_by: profileData?.referred_by,
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
        setIsAdminState(enriched.is_admin ?? (enriched.role === 'admin' || (Array.isArray(enriched.roles) && enriched.roles.includes('admin'))));
        setError(null);
      } catch (e: any) {
        console.error("AuthContext: Error enriching user profile:", e);
        const fallbackCreatedAt = session.user.created_at || new Date().toISOString();
        const fallbackUser: AppUser = { 
            id: session.user.id,
            email: session.user.email || null,
            aud: session.user.aud,
            created_at: fallbackCreatedAt,
            updated_at: session.user.updated_at || fallbackCreatedAt,
            last_sign_in_at: session.user.last_sign_in_at || null,
            app_metadata: session.user.app_metadata || {},
            user_metadata: session.user.user_metadata || {},
            role: undefined, 
            username: session.user.email?.split('@')[0] || null,
            status: 'active',
            is_active: true, 
            is_admin: false,
            // Ensure all other required User fields are here with defaults
            avatar_url: null,
            first_name: null,
            last_name: null,
            kyc_status: 'not_started',
            is_verified: !!session.user.email_confirmed_at,
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
    return { error: null, data };
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
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            role: 'user', 
            status: 'pending_verification', 
            created_at: nowISO, // ensure this matches DB expectation
            updated_at: nowISO, // ensure this matches DB expectation
            is_active: true, 
          });

        if (profileInsertError) {
          console.error("Error creating user profile in public.users:", profileInsertError);
        }
        // onAuthStateChange listener will call fetchAndUpdateUser
      } catch (e: any) {
         console.error("Error in post-registration profile creation:", e);
         setError("Registration process encountered an issue creating profile details.");
      }
    }
    setLoading(false);
    return { error: null, data };
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
      // Fetch and update user, which will set user state and isAdminState
      await fetchAndUpdateUser();
      
      // Need to check the state *after* it has been updated by fetchAndUpdateUser.
      // This is tricky because state updates are asynchronous.
      // A more robust way is to re-fetch the user data here and check admin status directly.
      const tempEnrichedUser = await enrichUserWithProfile(data.user);

      if (tempEnrichedUser && (tempEnrichedUser.is_admin || tempEnrichedUser.role === 'admin' || (Array.isArray(tempEnrichedUser.roles) && tempEnrichedUser.roles.includes('admin')))) {
        // User is admin, state is already set by fetchAndUpdateUser via listener or direct call.
        setLoading(false);
        return { error: null, data };
      } else {
        // Not an admin, sign out immediately
        await supabase.auth.signOut(); 
        const notAdminError = { name: "AuthError", message: "User is not an administrator." } as AuthError;
        setError(notAdminError.message);
        setUser(null); // Explicitly clear user
        setIsAdminState(false); // Explicitly clear admin state
        setLoading(false);
        return { error: notAdminError, data: null };
      }
    }
    // This case should ideally not be reached if signInWithPassword was successful but data.user was null.
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
