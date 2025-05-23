
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, AuthError, User as SupabaseAuthUser, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { LoginCredentials, RegisterCredentials, UserProfile, UserRole, User } from '@/types';

// Export AppUser type
export interface AppUser extends User {
  // Additional app-specific properties can be added here
}

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean; // Use isLoading consistently
  error: AuthError | null;
  signIn: (credentials: LoginCredentials) => Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }>;
  signOut: () => Promise<void>; // Use signOut instead of logout
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserPassword: (password: string) => Promise<{ user: AppUser | null, error: AuthError | null }>;
  fetchUserProfile: (supabaseUser: SupabaseAuthUser) => Promise<AppUser | null>;
  isAdmin: boolean;
  fetchAndUpdateUser: (updates: Partial<AppUser>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AppUser | null> => {
    try {
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.warn('Error fetching user profile details:', profileError.message);
        const partialUser: AppUser = {
          id: supabaseUser.id,
          email: supabaseUser.email,
          created_at: supabaseUser.created_at,
          updated_at: supabaseUser.updated_at,
          last_sign_in_at: supabaseUser.last_sign_in_at,
          app_metadata: supabaseUser.app_metadata,
          user_metadata: supabaseUser.user_metadata,
          phone: supabaseUser.phone,
          role: supabaseUser.app_metadata?.role as UserRole || 'user',
          username: null,
          is_active: true,
        };
        return partialUser;
      }
      
      const appUser: AppUser = {
        ...supabaseUser,
        ...profileData,
        role: (profileData as any)?.role || supabaseUser.app_metadata?.role as UserRole || 'user',
        is_active: true,
      };
      console.log("Fetched AppUser:", appUser);
      return appUser;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setIsLoading(true);
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(sessionError);
        setIsLoading(false);
        return;
      }
      
      setSession(currentSession);
      
      if (currentSession?.user) {
        const appUser = await fetchUserProfile(currentSession.user);
        setUser(appUser);
      }
      setIsLoading(false);
      
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          setIsLoading(true);
          const appUser = await fetchUserProfile(newSession.user);
          setUser(appUser);
          setIsLoading(false);
        } else {
          setUser(null);
        }
      });
      
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, [fetchUserProfile]);

  const signIn = async (credentials: LoginCredentials): Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }> => {
    setIsLoading(true);
    let authCredentials: SignInWithPasswordCredentials;

    if (credentials.email) {
      authCredentials = {
        email: credentials.email,
        password: credentials.password as string,
      };
    } else if (credentials.phone) {
       if (!credentials.phone) { 
          setIsLoading(false);
          const err = { name: "CredentialsError", message: "Phone number is required for phone login." } as AuthError;
          setError(err);
          return { user: null, session: null, error: err };
        }
      authCredentials = {
        phone: credentials.phone,
        password: credentials.password as string,
      };
    } else {
      setIsLoading(false);
      const err = { name: "CredentialsError", message: "Email or phone is required." } as AuthError;
      setError(err);
      return { user: null, session: null, error: err };
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword(authCredentials);

    if (signInError) {
      setError(signInError);
      setIsLoading(false);
      setUser(null);
      setSession(null);
      return { user: null, session: null, error: signInError };
    }

    if (data.user && data.session) {
      const appUser = await fetchUserProfile(data.user);
      if (appUser) {
        setUser(appUser);
        setSession(data.session);
        setIsLoading(false);
        return { user: appUser, session: data.session, error: null };
      } else {
        const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile." } as AuthError;
        setError(profileError);
        await supabase.auth.signOut();
        setUser(null);
        setSession(null);
        setIsLoading(false);
        return { user: null, session: null, error: profileError };
      }
    }
    
    setIsLoading(false);
    return { user: null, session: null, error: { name: "UnknownSignInError", message: "An unknown error occurred during sign in."} as AuthError };
  };

  const signUp = async (credentials: RegisterCredentials): Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }> => {
    setIsLoading(true);
    const { email, password, phone, ...metaData } = credentials;
    
    let signupOptions: SignUpWithPasswordCredentials = { 
      email: email as string, 
      password: password as string 
    };
    
    const dataForOptions: Record<string, any> = {};
    if (metaData.username) dataForOptions.username = metaData.username;
    if (metaData.first_name) dataForOptions.first_name = metaData.first_name;
    if (metaData.last_name) dataForOptions.last_name = metaData.last_name;
    
    if (Object.keys(dataForOptions).length > 0) {
      signupOptions.options = { data: dataForOptions };
    }

    const { data, error: signUpError } = await supabase.auth.signUp(signupOptions);

    if (signUpError) {
      setError(signUpError);
      setIsLoading(false);
      return { user: null, session: null, error: signUpError };
    }

    if (data.user) {
        if (data.session) {
            const appUser = await fetchUserProfile(data.user);
             if (appUser) {
                setUser(appUser);
                setSession(data.session);
                setIsLoading(false);
                return { user: appUser, session: data.session, error: null };
            } else {
                const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile after sign up." } as AuthError;
                setError(profileError);
                setIsLoading(false);
                return { user: null, session: data.session, error: profileError };
            }
        } else {
            setIsLoading(false);
            const partialAppUser: AppUser = {
                id: data.user.id,
                email: data.user.email,
                created_at: data.user.created_at,
                username: null,
                is_active: true,
            };
            return { user: partialAppUser, session: null, error: null };
        }
    }
    
    setIsLoading(false);
    return { user: null, session: null, error: { name: "UnknownSignUpError", message: "An unknown error occurred during sign up."} as AuthError };
  };

  const signOut = async (): Promise<void> => {
    setIsLoading(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError);
      console.error('Error signing out:', signOutError);
    }
    setUser(null);
    setSession(null);
    setIsLoading(false);
  };

  const sendPasswordResetEmail = async (email: string): Promise<{ error: AuthError | null }> => {
    setIsLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    });
    if (resetError) {
      setError(resetError);
      setIsLoading(false);
      return { error: resetError };
    }
    setIsLoading(false);
    return { error: null };
  };

  const updateUserPassword = async (password: string): Promise<{ user: AppUser | null, error: AuthError | null }> => {
    setIsLoading(true);
    setError(null);
    const { data, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError);
      setIsLoading(false);
      return { user: null, error: updateError };
    }
    if (data.user) {
      const appUser = await fetchUserProfile(data.user);
      if (appUser) {
        setUser(appUser);
        setIsLoading(false);
        return { user: appUser, error: null };
      } else {
         const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile after password update." } as AuthError;
         setError(profileError);
         setIsLoading(false);
         return { user: null, error: profileError };
      }
    }
    setIsLoading(false);
    return { user: null, error: { name: "UnknownPasswordUpdateError", message: "An unknown error occurred during password update."} as AuthError };
  };

  const fetchAndUpdateUser = async (updates: Partial<AppUser>) => {
    if (!user) return;
    setIsLoading(true);
    try {
      if (updates.user_metadata) {
        const { data: updatedAuthUser, error: updateAuthError } = await supabase.auth.updateUser({
          data: updates.user_metadata
        });
        if (updateAuthError) throw updateAuthError;
        if (updatedAuthUser.user) {
            const { error: profileUpdateError } = await supabase
              .from('profiles')
              .update({ 
                first_name: updates.first_name, 
                last_name: updates.last_name,
                avatar_url: updates.avatar_url,
               })
              .eq('id', updatedAuthUser.user.id);

            if (profileUpdateError) throw profileUpdateError;
          
          const refreshedUser = await fetchUserProfile(updatedAuthUser.user);
          setUser(refreshedUser);
        }
      } else {
         const { error: profileUpdateError } = await supabase
            .from('profiles')
            .update({ 
              first_name: updates.first_name, 
              last_name: updates.last_name,
              avatar_url: updates.avatar_url,
              })
            .eq('id', user.id);

          if (profileUpdateError) throw profileUpdateError;
          
          const {data: {user: currentSupabaseUser}} = await supabase.auth.getUser();
          if(currentSupabaseUser){
            const refreshedUser = await fetchUserProfile(currentSupabaseUser);
            setUser(refreshedUser);
          }
      }
    } catch (e: any) {
      setError(e);
      console.error("Failed to update user:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const isAdmin = !!user && (user.role === 'admin' || user.app_metadata?.role === 'admin');

  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    fetchUserProfile,
    isAdmin,
    fetchAndUpdateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
