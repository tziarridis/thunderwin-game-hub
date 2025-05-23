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
// Importing User, LoginCredentials, RegisterCredentials, UserRole from @/types (index.d.ts which re-exports from user.d.ts)
import { User, LoginCredentials, RegisterCredentials, UserRole } from '@/types'; 

// AppUser now directly uses the structure of User from @/types,
// and adds Supabase specific metadata.
// It ensures all fields from the main User type (like created_at, updated_at, is_active) are present.
export interface AppUser extends User {
  aud: string; // Supabase specific
  app_metadata: SupabaseUser['app_metadata'];
  user_metadata: SupabaseUser['user_metadata'];
  // role, created_at, updated_at, is_active etc. are inherited from User type from @/types
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
  const [isAdminState, setIsAdminState] = useState(false); // Renamed to avoid conflict with isAdmin on user object

  const enrichUserWithProfile = async (supabaseUser: SupabaseUser): Promise<AppUser> => {
    const { data: profileData, error: profileError } = await supabase
      .from('users') // This is your public 'users' table, not auth.users
      .select('*')
      .eq('id', supabaseUser.id) // Assuming your public.users.id links to auth.users.id
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows
      console.error('Error fetching user profile from public.users:', profileError);
    }
    
    // Construct AppUser ensuring all fields from User (from @/types) are covered
    const enrichedUser: AppUser = {
      // Fields from SupabaseUser
      id: supabaseUser.id,
      aud: supabaseUser.aud,
      email: supabaseUser.email || null,
      created_at: supabaseUser.created_at || new Date().toISOString(), // Default if not present
      updated_at: supabaseUser.updated_at || supabaseUser.created_at || new Date().toISOString(), // Default
      last_sign_in_at: supabaseUser.last_sign_in_at || null,
      app_metadata: supabaseUser.app_metadata || {},
      user_metadata: supabaseUser.user_metadata || {},
      
      // Fields from your public 'users' table (profileData) or defaults
      // These should align with the 'User' type definition in src/types/index.d.ts
      username: profileData?.username || supabaseUser.email?.split('@')[0] || null,
      avatar_url: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url || null,
      first_name: profileData?.first_name || null,
      last_name: profileData?.last_name || null,
      role: profileData?.role as UserRole || undefined, // Cast to your UserRole type
      status: profileData?.status || 'active', // Default to 'active'
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
      // is_admin flag from User type, determined by role
      is_admin: (profileData?.role === 'admin' || (Array.isArray(profileData?.roles) && profileData.roles.includes('admin'))) ?? false,
      roles: profileData?.roles || (profileData?.role ? [profileData.role as UserRole] : []),
      kyc_status: profileData?.kyc_status || 'not_started',
      referral_code: profileData?.referral_code,
      referred_by: profileData?.referred_by, // Added if in User type
       // Ensure all other fields from User type (src/types/index.d.ts) are present
       // Example: if User has `settings: UserSettings`, provide it:
       // settings: profileData?.settings || {}, 
    };
    
    // Override with profileData specifics again if there were direct matches
    // This ensures profileData takes precedence for fields that exist on both.
    const finalUser = { ...enrichedUser, ...profileData } as AppUser;
    // Ensure critical fields like 'id', 'email', 'created_at', 'updated_at', 'is_active' are correctly set.
    finalUser.id = supabaseUser.id; // always from supabaseUser
    finalUser.email = supabaseUser.email || null; // always from supabaseUser
    finalUser.created_at = profileData?.created_at || supabaseUser.created_at || new Date().toISOString();
    finalUser.updated_at = profileData?.updated_at || supabaseUser.updated_at || finalUser.created_at;
    finalUser.is_active = profileData?.is_active ?? (profileData?.status === 'active') ?? !!supabaseUser.email_confirmed_at;


    console.log("Enriched user in AuthContext:", finalUser);
    return finalUser;
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
            is_active: true, // default active
            // Ensure all other required User fields are here with defaults
            is_admin: false,
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
          await fetchAndUpdateUser();
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
    if (data.user) {
      await fetchAndUpdateUser(); 
    }
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
          first_name: credentials.firstName, // Use consistent naming
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
        // Insert into your public 'users' table
        const { error: profileInsertError } = await supabase
          .from('users') 
          .insert({
            id: data.user.id, // Link to auth.users.id
            email: data.user.email,
            username: credentials.username || data.user.email?.split('@')[0],
            first_name: credentials.firstName,
            last_name: credentials.lastName,
            role: 'user', // Default role
            status: 'pending_verification', // Or 'active' if email confirmation is off
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true, // Or false if email verification is on
          });

        if (profileInsertError) {
          console.error("Error creating user profile in public.users:", profileInsertError);
          // Potentially sign out the user or mark for cleanup if profile creation is critical
          // setError("Registration partially failed (profile creation). Please contact support.");
          // For now, proceed, but log error. fetchAndUpdateUser will try to get what it can.
        }
        await fetchAndUpdateUser(); 
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
      // fetchAndUpdateUser will perform enrichment and set isAdminState
      await fetchAndUpdateUser(); 
      
      // After fetchAndUpdateUser, 'user' state should be updated. Check its admin status.
      // This relies on 'user' state being promptly updated by fetchAndUpdateUser.
      // A brief timeout or check might be needed if state update isn't immediate enough.
      const currentAuthUser = user; // Check the state 'user' after update
      if (currentAuthUser && (currentAuthUser.is_admin || currentAuthUser.role === 'admin' || (Array.isArray(currentAuthUser.roles) && currentAuthUser.roles.includes('admin')))) {
        setLoading(false);
        return { error: null, data };
      } else {
        await supabase.auth.signOut(); 
        const notAdminError = { name: "AuthError", message: "User is not an administrator." } as AuthError;
        setError(notAdminError.message);
        // user and isAdminState will be reset by listener
        setLoading(false);
        return { error: notAdminError, data: null };
      }
    }
    setLoading(false); // Should ideally not be reached if data.user is null after successful signIn
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
      isAdmin: isAdminState, // Use the local isAdminState
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
