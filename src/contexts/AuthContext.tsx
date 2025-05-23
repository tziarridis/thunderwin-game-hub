import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, AuthError, User as SupabaseAuthUser, SignInWithPasswordCredentials, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import { LoginCredentials, RegisterCredentials, UserProfile, UserRole, AppUser } from '@/types/user'; // Ensure AppUser is correctly defined

interface AuthProviderProps {
  children: React.ReactNode;
}

interface AuthContextType {
  user: AppUser | null;
  session: Session | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: AuthError | null;
  signIn: (credentials: LoginCredentials) => Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }>;
  signUp: (credentials: RegisterCredentials) => Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }>;
  signOut: () => Promise<void>;
  sendPasswordResetEmail: (email: string) => Promise<{ error: AuthError | null }>;
  updateUserPassword: (password: string) => Promise<{ user: AppUser | null, error: AuthError | null }>;
  fetchUserProfile: (supabaseUser: SupabaseAuthUser) => Promise<AppUser | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<AppUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchUserProfile = useCallback(async (supabaseUser: SupabaseAuthUser): Promise<AppUser | null> => {
    try {
      // Fetch user profile from profiles table or users table
      const { data: profile, error: profileError } = await supabase
        .from('profiles') // or 'users' depending on your schema
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (profileError) {
        console.error('Error fetching user profile:', profileError);
        return null;
      }

      // Combine Supabase auth user with profile data
      const appUser: AppUser = {
        ...supabaseUser,
        ...profile,
        // Add any additional transformations or defaults here
      };

      return appUser;
    } catch (err) {
      console.error('Error in fetchUserProfile:', err);
      return null;
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      setLoading(true);
      
      // Get current session
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Error getting session:', sessionError);
        setError(sessionError);
        setLoading(false);
        return;
      }
      
      setSession(currentSession);
      
      // If we have a session, fetch the user profile
      if (currentSession?.user) {
        const appUser = await fetchUserProfile(currentSession.user);
        setUser(appUser);
      }
      
      setLoading(false);
      
      // Set up auth state change listener
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
        console.log('Auth state changed:', event);
        setSession(newSession);
        
        if (event === 'SIGNED_IN' && newSession?.user) {
          setLoading(true);
          const appUser = await fetchUserProfile(newSession.user);
          setUser(appUser);
          setLoading(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'USER_UPDATED' && newSession?.user) {
          setLoading(true);
          const appUser = await fetchUserProfile(newSession.user);
          setUser(appUser);
          setLoading(false);
        }
      });
      
      // Clean up subscription on unmount
      return () => {
        subscription.unsubscribe();
      };
    };
    
    initAuth();
  }, [fetchUserProfile]);

  const signIn = async (credentials: LoginCredentials): Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }> => {
    setLoading(true);
    setError(null);
    
    let authCredentials: SignInWithPasswordCredentials;

    if (credentials.email) {
      authCredentials = {
        email: credentials.email,
        password: credentials.password,
      };
    } else if (credentials.phone) {
       if (!credentials.phone) { // Should not happen if logic is correct, but good for type safety
          setLoading(false);
          const err = { name: "CredentialsError", message: "Phone number is required for phone login." } as AuthError;
          setError(err);
          return { user: null, session: null, error: err };
        }
      authCredentials = {
        phone: credentials.phone,
        password: credentials.password,
      };
    } else {
      setLoading(false);
      const err = { name: "CredentialsError", message: "Email or phone is required." } as AuthError;
      setError(err);
      return { user: null, session: null, error: err };
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword(authCredentials);

    if (signInError) {
      setError(signInError);
      setLoading(false);
      setUser(null);
      setSession(null);
      return { user: null, session: null, error: signInError };
    }

    if (data.user && data.session) {
      const appUser = await fetchUserProfile(data.user);
      if (appUser) {
        setUser(appUser);
        setSession(data.session);
        setLoading(false);
        return { user: appUser, session: data.session, error: null };
      } else {
        // Handle case where profile fetch failed after successful login
        const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile." } as AuthError;
        setError(profileError);
        await supabase.auth.signOut(); // Sign out user if profile can't be fetched
        setUser(null);
        setSession(null);
        setLoading(false);
        return { user: null, session: null, error: profileError };
      }
    }
    
    setLoading(false);
    // Should not reach here if signInWithPassword returns data or error
    return { user: null, session: null, error: { name: "UnknownSignInError", message: "An unknown error occurred during sign in."} as AuthError };
  };

  const signUp = async (credentials: RegisterCredentials): Promise<{ user: AppUser | null, session: Session | null, error: AuthError | null }> => {
    setLoading(true);
    setError(null);

    const { email, password, phone, ...metaData } = credentials;
    
    let signupOptions: SignUpWithPasswordCredentials = { email, password };
    if (phone) signupOptions.phone = phone;
    if (Object.keys(metaData).length > 0) {
      signupOptions.options = { data: metaData };
    }

    const { data, error: signUpError } = await supabase.auth.signUp(signupOptions);

    if (signUpError) {
      setError(signUpError);
      setLoading(false);
      return { user: null, session: null, error: signUpError };
    }

    // For sign up, data.user might exist but session might be null if email confirmation is required
    if (data.user) {
        // if session is null, user needs to confirm email.
        // if session exists, user is logged in (e.g. auto-confirm is on)
        if (data.session) {
            const appUser = await fetchUserProfile(data.user);
             if (appUser) {
                setUser(appUser);
                setSession(data.session);
                setLoading(false);
                return { user: appUser, session: data.session, error: null };
            } else {
                const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile after sign up." } as AuthError;
                setError(profileError);
                // Don't sign out, user might still be created but profile fetch failed
                setLoading(false);
                return { user: null, session: data.session, error: profileError }; // return session if exists
            }
        } else {
            // Email confirmation likely required. Return Supabase user, no appUser yet.
            // The UI should inform the user to check their email.
            setLoading(false);
            // Create a temporary AppUser like object for the return if needed, or just indicate confirmation pending
            const partialAppUser: Partial<AppUser> = {
                id: data.user.id,
                email: data.user.email,
                // other fields will be null or undefined
            };
            return { user: partialAppUser as AppUser, session: null, error: null };
        }
    }
    
    setLoading(false);
    return { user: null, session: null, error: { name: "UnknownSignUpError", message: "An unknown error occurred during sign up."} as AuthError };
  };

  const signOut = async (): Promise<void> => {
    setLoading(true);
    const { error: signOutError } = await supabase.auth.signOut();
    if (signOutError) {
      setError(signOutError);
      console.error('Error signing out:', signOutError);
    }
    setUser(null);
    setSession(null);
    setLoading(false);
  };

  // Mock implementation for sendPasswordResetEmail
  const sendPasswordResetEmail = async (email: string): Promise<{ error: AuthError | null }> => {
    setLoading(true);
    setError(null);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`, // Adjust if your route is different
    });
    if (resetError) {
      setError(resetError);
      setLoading(false);
      return { error: resetError };
    }
    setLoading(false);
    return { error: null };
  };

  // Mock implementation for updateUserPassword
  const updateUserPassword = async (password: string): Promise<{ user: AppUser | null, error: AuthError | null }> => {
    setLoading(true);
    setError(null);
    const { data, error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      setError(updateError);
      setLoading(false);
      return { user: null, error: updateError };
    }
    if (data.user) {
      const appUser = await fetchUserProfile(data.user);
      if (appUser) {
        setUser(appUser);
        setLoading(false);
        return { user: appUser, error: null };
      } else {
         const profileError = { name: "ProfileFetchError", message: "Failed to fetch user profile after password update." } as AuthError;
         setError(profileError);
         setLoading(false);
         return { user: null, error: profileError };
      }
    }
    setLoading(false);
    return { user: null, error: { name: "UnknownPasswordUpdateError", message: "An unknown error occurred during password update."} as AuthError };
  };


  const value = {
    user,
    session,
    isAuthenticated: !!user && !!session,
    isLoading: loading,
    error,
    signIn,
    signUp,
    signOut,
    sendPasswordResetEmail,
    updateUserPassword,
    fetchUserProfile, // Expose if needed externally
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
