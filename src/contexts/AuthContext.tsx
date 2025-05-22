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
import {
  LoginCredentials,
  RegisterCredentials,
  User,
  UserRole,
} from '@/types'; // Ensure UserRole is imported from @/types (index.d.ts)

// ... keep existing code (AppUser interface, AuthContextType interface, AuthContext creation)
export interface AppUser extends User {
  // Supabase User properties that are part of Supabase's User object
  aud: string;
  // role?: string; // This 'role' is from Supabase token, might differ from app-specific UserRole
  app_metadata: {
    provider?: string;
    providers?: string[];
    [key: string]: any;
  };
  user_metadata: {
    [key: string]: any;
  };
  // Custom fields from your 'users' or 'profiles' table, merged into AppUser
  // Ensure these are correctly populated in enrichUserWithProfile
  // UserRole is your application-specific role
  role?: UserRole; // This should be your application-specific UserRole
  // Add other fields from your 'users' table that you want in AppUser
  // For example, if your 'users' table has 'display_name', 'phone_number', etc.
  // is_banned?: boolean; // Already in User type from user.d.ts
  // status?: UserStatus; // Already in User type from user.d.ts
  // isActive: boolean; // Added this to AppUser previously, ensure it's populated
}

interface AuthContextType {
  user: AppUser | null;
  appUser: AppUser | null; // Maintaining for compatibility if used elsewhere
  isAdmin: boolean;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>;
  register: (credentials: RegisterCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>;
  logout: () => Promise<void>;
  adminLogin?: (credentials: LoginCredentials) => Promise<{ error: AuthError | null; data: any } | undefined>; // Optional adminLogin
  // Add other auth methods as needed
  fetchAndUpdateUser: () => Promise<void>; // To refresh user data
}


const AuthContext = createContext<AuthContextType | undefined>(undefined);
// ... keep existing code (AuthProvider component up to enrichUserWithProfile)

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  // const [appUser, setAppUser] = useState<AppUser | null>(null); // consider removing if 'user' serves same purpose
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);


  const enrichUserWithProfile = async (supabaseUser: SupabaseUser): Promise<AppUser> => {
    // Fetch user profile from your 'users' table (or 'profiles')
    const { data: profileData, error: profileError } = await supabase
      .from('users') // Assuming your table is named 'users'
      .select('*') // Select all columns or specific ones you need
      .eq('id', supabaseUser.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows
      console.error('Error fetching user profile:', profileError);
      // Fallback to Supabase user data only if profile fetch fails critically
    }
    
    // Base properties from Supabase user
    const baseAppUser: Partial<AppUser> = {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      aud: supabaseUser.aud,
      // supabaseTokenRole: supabaseUser.role, // Store Supabase's token role if needed separately
      created_at: supabaseUser.created_at,
      updated_at: supabaseUser.updated_at || supabaseUser.created_at, // Ensure updated_at is set
      last_sign_in_at: supabaseUser.last_sign_in_at,
      app_metadata: supabaseUser.app_metadata || {},
      user_metadata: supabaseUser.user_metadata || {},
      // Default values for User interface fields from user.d.ts if not in profile
      username: null,
      avatar_url: null,
      first_name: null,
      last_name: null,
      role: undefined, // This will be overridden by profileData if present
      status: 'active', // Default status
      is_verified: supabaseUser.email_confirmed_at ? true : false,
      is_banned: false, // Default, override from profileData
      balance: 0,
      currency: 'USD',
      vipLevel: 0,
      isActive: true, // Default, override from profileData
      // Fields from the extended User type in user.d.ts
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
      avatar: supabaseUser.user_metadata?.avatar_url,
      joined: supabaseUser.created_at,
      phone: supabaseUser.phone,
      lastLogin: supabaseUser.last_sign_in_at,
      favoriteGames: [],
      profile: {}, // Default, override from profileData
      isStaff: false, // Default, override from profileData
      isAdmin: false, // Default, override from profileData and role check
      roles: [], // Default, override from profileData
      kycStatus: 'not_started', // Default, override from profileData
      referralCode: undefined,
      referralLink: undefined,
    };

    // Merge profile data if available
    const enrichedUser = {
      ...baseAppUser,
      ...(profileData || {}), // Spread profileData, ensure its fields match AppUser/User
      // Ensure crucial fields like `role` from profileData are correctly mapped if names differ
      role: profileData?.role as UserRole || baseAppUser.role, // Explicitly cast profileData.role
      isActive: profileData?.is_active ?? baseAppUser.isActive,
      username: profileData?.username || supabaseUser.email, // Prefer profile username
      avatar_url: profileData?.avatar_url || supabaseUser.user_metadata?.avatar_url,
      first_name: profileData?.first_name,
      last_name: profileData?.last_name,
      status: profileData?.status || baseAppUser.status,
      is_banned: profileData?.is_banned ?? baseAppUser.is_banned,
      isAdmin: (profileData?.role === 'admin' || profileData?.roles?.includes('admin')) ?? false,
    } as AppUser; // Cast to AppUser

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
      // setAppUser(null);
      setIsAdmin(false);
      setLoading(false);
      setError(sessionError.message);
      return;
    }
    
    if (session && session.user) {
      try {
        const enriched = await enrichUserWithProfile(session.user);
        setUser(enriched);
        // setAppUser(enriched);
        setIsAdmin(enriched.role === 'admin' || (Array.isArray(enriched.roles) && enriched.roles.includes('admin')));
        setError(null);
      } catch (e: any) {
        console.error("AuthContext: Error enriching user profile:", e);
        // Fallback to Supabase user data if enrichment fails
        const fallbackUser = { 
            ...session.user, 
            id: session.user.id, // ensure id is there
            email: session.user.email || '',
            role: undefined, // No app role if profile fails
            isActive: true, // Default
            // ... other necessary defaults from AppUser/User
         } as AppUser; // This cast might be risky without all fields
        setUser(fallbackUser); 
        // setAppUser(fallbackUser);
        setIsAdmin(false); // Cannot determine admin status if profile fails
        setError("Failed to load full user profile.");
      }
    } else {
      setUser(null);
      // setAppUser(null);
      setIsAdmin(false);
    }
    setLoading(false);
  }, []);


  useEffect(() => {
    fetchAndUpdateUser(); // Initial fetch

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log("AuthContext: Auth state changed", _event, session);
      if (_event === 'SIGNED_IN' || _event === 'USER_UPDATED' || _event === 'TOKEN_REFRESHED') {
        if (session && session.user) {
          const enriched = await enrichUserWithProfile(session.user);
          setUser(enriched);
          // setAppUser(enriched);
          setIsAdmin(enriched.role === 'admin' || (Array.isArray(enriched.roles) && enriched.roles.includes('admin')));
        } else {
           // This case might happen if session becomes null after an event
           setUser(null);
          // setAppUser(null);
           setIsAdmin(false);
        }
      } else if (_event === 'SIGNED_OUT') {
        setUser(null);
        // setAppUser(null);
        setIsAdmin(false);
      }
      // setLoading(false); // Moved loading(false) to fetchAndUpdateUser
    });

    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, [fetchAndUpdateUser]);
  // ... keep existing code (login, register, logout, adminLogin functions)

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
      // enrichUserWithProfile is called by onAuthStateChange listener or fetchAndUpdateUser
      await fetchAndUpdateUser(); // Explicitly refresh after login
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
    // After successful Supabase sign-up, you might need to create a corresponding
    // record in your public 'users' (or 'profiles') table.
    if (data.user) {
      try {
        const { error: profileInsertError } = await supabase
          .from('users') // Your public users table
          .insert({
            id: data.user.id,
            email: data.user.email,
            username: credentials.username || data.user.email?.split('@')[0], // Or from form
            role: 'user', // Default role
            status: 'pending_verification', // Or 'active' if email verification is not strict initially
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true, // Or based on email verification
            // Add any other default fields for your 'users' table
          });

        if (profileInsertError) {
          console.error("Error creating user profile:", profileInsertError);
          // Potentially roll back Supabase auth user or notify admin,
          // for now, we proceed, but auth state listener will fetch this partial profile.
          setError("Registration partially failed (profile creation). Please contact support.");
          // User is still signed up in Supabase auth, listener will handle enrichment
        }
        // enrichUserWithProfile will be called by onAuthStateChange or fetchAndUpdateUser
        await fetchAndUpdateUser(); // Explicitly refresh after registration
      } catch (e: any) {
         console.error("Error in post-registration profile creation:", e);
         setError("Registration process encountered an issue.");
      }
    }
    setLoading(false);
    return { error: null, data }; // Return Supabase response
  };

  const logout = async () => {
    setLoading(true);
    setError(null);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError.message);
    }
    // setUser and setIsAdmin are handled by the onAuthStateChange listener
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
      const enrichedUser = await enrichUserWithProfile(data.user);
      if (enrichedUser.role === 'admin' || (Array.isArray(enrichedUser.roles) && enrichedUser.roles.includes('admin'))) {
        // setUser(enrichedUser); // Listener will do this
        // setIsAdmin(true);
        await fetchAndUpdateUser(); // Ensure state is updated by listener or explicitly
        setLoading(false);
        return { error: null, data };
      } else {
        await supabase.auth.signOut(); // Sign out if not an admin
        const notAdminError = { name: "AuthError", message: "User is not an administrator." } as AuthError;
        setError(notAdminError.message);
        setUser(null);
        setIsAdmin(false);
        setLoading(false);
        return { error: notAdminError, data: null };
      }
    }
    setLoading(false);
    // Should not reach here if data.user is null and no error, but as a fallback:
    return { error: {name: "AuthError", message: "Admin login failed."} as AuthError, data: null };
  };


  return (
    <AuthContext.Provider value={{ user, appUser: user, isAdmin, isAuthenticated: !!user, loading, error, login, register, logout, adminLogin, fetchAndUpdateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
// ... keep existing code (useAuth hook, export AuthProvider)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider };
