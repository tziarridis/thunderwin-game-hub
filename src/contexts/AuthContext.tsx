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
import { LoginCredentials, RegisterCredentials, User, UserRole } from '@/types'; // Ensure UserRole is imported from @/types (index.d.ts or user.d.ts)

export interface AppUser extends User {
  aud: string;
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  // UserRole is your application-specific UserRole
  role?: UserRole; // This should be your application-specific UserRole
  // Ensure User type from index.d.ts is comprehensive
  created_at: string; // Ensure these are string
  updated_at: string; // Ensure these are string
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
  updateUserPassword?: (password: string) => Promise<{ error: AuthError | null }>; // Added
  fetchAndUpdateUser: () => Promise<void>;
  refreshWalletBalance?: () => Promise<void>; // Assuming this comes from a wallet context or service
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const enrichUserWithProfile = async (supabaseUser: SupabaseUser): Promise<AppUser> => {
    const { data: profileData, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Error fetching user profile:', profileError);
    }
    
    const baseAppUser: AppUser = {
      // Base properties from Supabase user, ensure all AppUser fields are covered
      id: supabaseUser.id,
      email: supabaseUser.email || null, // Ensure email can be null if User type allows
      aud: supabaseUser.aud,
      created_at: supabaseUser.created_at || new Date().toISOString(), // Ensure string format
      updated_at: supabaseUser.updated_at || supabaseUser.created_at || new Date().toISOString(), // Ensure string format
      last_sign_in_at: supabaseUser.last_sign_in_at || null,
      app_metadata: supabaseUser.app_metadata || {},
      user_metadata: supabaseUser.user_metadata || {},
      username: profileData?.username || supabaseUser.email?.split('@')[0] || null,
      avatar_url: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
      first_name: profileData?.first_name || null,
      last_name: profileData?.last_name || null,
      role: profileData?.role as UserRole || undefined,
      status: profileData?.status || 'active',
      is_verified: profileData?.is_verified ?? (!!supabaseUser.email_confirmed_at),
      is_banned: profileData?.is_banned ?? false,
      is_active: profileData?.is_active ?? true,
      balance: profileData?.balance ?? 0,
      currency: profileData?.currency ?? 'USD',
      vip_level_id: profileData?.vip_level_id,
      favorite_game_ids: profileData?.favorite_game_ids || [],
      phone_number: profileData?.phone_number || supabaseUser.phone || undefined,
      date_of_birth: profileData?.date_of_birth,
      address: profileData?.address,
      is_staff: profileData?.is_staff ?? false,
      is_admin: (profileData?.role === 'admin' || profileData?.roles?.includes('admin')) ?? false,
      roles: profileData?.roles || (profileData?.role ? [profileData.role as UserRole] : []),
      kyc_status: profileData?.kyc_status || 'not_started',
      referral_code: profileData?.referral_code,
      // Default values for any other User interface fields from user.d.ts if not in profile
      // Ensure all fields from `User` type in `index.d.ts` are covered here
    };
    
    const enrichedUser = {
      ...baseAppUser,
      ...(profileData || {}), // Spread profileData again to ensure it overrides defaults if names match
      // Explicitly map/cast if necessary
      role: profileData?.role as UserRole || baseAppUser.role,
      is_admin: (profileData?.role === 'admin' || (Array.isArray(profileData?.roles) && profileData.roles.includes('admin'))) ?? baseAppUser.is_admin,
      created_at: profileData?.created_at || baseAppUser.created_at, // Ensure string format from profile
      updated_at: profileData?.updated_at || baseAppUser.updated_at, // Ensure string format from profile
    } as AppUser;

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
      setIsAdmin(false);
      setLoading(false);
      setError(sessionError.message);
      return;
    }
    
    if (session && session.user) {
      try {
        const enriched = await enrichUserWithProfile(session.user);
        setUser(enriched);
        setIsAdmin(enriched.role === 'admin' || (Array.isArray(enriched.roles) && enriched.roles.includes('admin')));
        setError(null);
      } catch (e: any) {
        console.error("AuthContext: Error enriching user profile:", e);
        // Fallback to Supabase user data if enrichment fails, ensuring AppUser structure
        const fallbackUser: AppUser = { 
            id: session.user.id,
            email: session.user.email || null,
            aud: session.user.aud,
            created_at: session.user.created_at || new Date().toISOString(),
            updated_at: session.user.updated_at || session.user.created_at || new Date().toISOString(),
            last_sign_in_at: session.user.last_sign_in_at || null,
            app_metadata: session.user.app_metadata || {},
            user_metadata: session.user.user_metadata || {},
            role: undefined, 
            username: session.user.email?.split('@')[0] || null,
            status: 'active',
            is_active: true,
         };
        setUser(fallbackUser); 
        setIsAdmin(false);
        setError("Failed to load full user profile.");
      }
    } else {
      setUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    fetchAndUpdateUser(); 

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("AuthContext: Auth state changed", _event, session);
      if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'TOKEN_REFRESHED') {
        if (session && session.user) {
          // fetchAndUpdateUser will handle enrichment and state setting
          await fetchAndUpdateUser();
        } else {
           setUser(null);
           setIsAdmin(false);
        }
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        setIsAdmin(false);
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
    if (data.user) {
      await fetchAndUpdateUser(); 
    }
    setLoading(false);
    return { error: null, data };
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true);
    setError(null);
    const { data, error: signUpError } = await supabase.auth.signUp(credentials);
    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return { error: signUpError, data: null };
    }
    if (data.user) {
      try {
        const { error: profileInsertError } = await supabase
          .from('users') 
          .insert({
            id: data.user.id,
            email: data.user.email,
            username: credentials.username || data.user.email?.split('@')[0],
            role: 'user', 
            status: 'pending_verification',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true, 
            // Add any other default fields
          });

        if (profileInsertError) {
          console.error("Error creating user profile:", profileInsertError);
          setError("Registration partially failed (profile creation). Please contact support.");
        }
        await fetchAndUpdateUser(); 
      } catch (e: any) {
         console.error("Error in post-registration profile creation:", e);
         setError("Registration process encountered an issue.");
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
    // setUser and setIsAdmin are handled by the onAuthStateChange listener
    // No need to explicitly call setUser(null) here as listener handles it
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
      // fetchAndUpdateUser will perform enrichment and set isAdmin state
      await fetchAndUpdateUser(); 
      // Re-check isAdmin status from the potentially updated user state
      // This relies on fetchAndUpdateUser correctly setting the user state that enrichUserWithProfile uses
      const checkUser = supabase.auth.getUser(); // Or get user from state after fetchAndUpdateUser
      const tempSession = await supabase.auth.getSession(); // to get fresh user
      if (tempSession.data.session?.user) {
        const enriched = await enrichUserWithProfile(tempSession.data.session.user);
        if (enriched.role === 'admin' || (Array.isArray(enriched.roles) && enriched.roles.includes('admin'))) {
          // State already set by fetchAndUpdateUser triggered by listener or call
          setLoading(false);
          return { error: null, data };
        } else {
          await supabase.auth.signOut(); 
          const notAdminError = { name: "AuthError", message: "User is not an administrator." } as AuthError;
          setError(notAdminError.message);
          // setUser(null); // Listener will handle
          // setIsAdmin(false); // Listener will handle
          setLoading(false);
          return { error: notAdminError, data: null };
        }
      }
    }
    setLoading(false);
    return { error: {name: "AuthError", message: "Admin login failed."} as AuthError, data: null };
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
    // Optionally re-fetch user data if needed, though password change might not alter profile data
    // await fetchAndUpdateUser(); 
    setLoading(false);
    return { error: null };
  };

  // Placeholder for refreshWalletBalance if it's meant to be here
  const refreshWalletBalance = async () => {
    console.warn("AuthContext: refreshWalletBalance called, but not implemented here. Should be in WalletContext/Service.");
    // Implement actual balance refresh logic if this is the correct place
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      appUser: user, 
      isAdmin, 
      isAuthenticated: !!user, 
      loading, 
      error, 
      login, 
      register, 
      logout, 
      adminLogin, 
      updateUserPassword, 
      fetchAndUpdateUser,
      refreshWalletBalance // Added if needed
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
