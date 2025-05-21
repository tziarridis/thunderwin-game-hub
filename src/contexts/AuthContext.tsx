
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User as SupabaseUser } from '@supabase/supabase-js';
import { User } from '@/types/user'; // Your custom User type
import { Wallet } from '@/types/wallet'; // Your custom Wallet type
import { walletService } from '@/services/walletService'; // Assuming this service exists
import { toast } from 'sonner';
import { Profile } from '@/types/user'; // Assuming Profile type for profiles table data

export interface AuthContextType {
  session: Session | null;
  user: User | null; // Your custom User type
  profile: Profile | null; // Data from your public.profiles table
  wallet: Wallet | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string,password: string) => Promise<any>;
  logout: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
  fetchUserProfile: (userId: string) => Promise<void>;
  updateUserMetadata: (metadata: Partial<User['user_metadata']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null); // Your app's User object
  const [profile, setProfile] = useState<Profile | null>(null); // From profiles table
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfileAndWallet = async (supabaseUser: SupabaseUser | null) => {
    if (supabaseUser) {
      try {
        // Fetch from public.profiles table
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', supabaseUser.id) // Assuming public.profiles.id maps to auth.users.id
          .single();

        if (profileError && profileError.code !== 'PGRST116') { // PGRST116: 0 rows
            throw profileError;
        }
        setProfile(profileData as Profile || null);
        
        // Combine Supabase auth user data with your profile data into your app's User type
        const appUser: User = {
          ...supabaseUser, // Spread all properties from SupabaseUser
                           // This includes id, email, app_meta_data, user_metadata, role, etc.
          // If profileData has specific fields you want directly on User type (not just user_metadata)
          // ensure your User type definition allows them. For now, assume they are in user_metadata or profile object.
        };
        setUser(appUser);

        // Fetch wallet
        const walletResponse = await walletService.getWalletByUserId(supabaseUser.id);
        if (walletResponse.data) {
          setWallet(walletResponse.data as Wallet); // Assuming data is Wallet type
        } else if (walletResponse.error) {
          console.warn('Failed to fetch wallet:', walletResponse.error);
          // Potentially create a wallet if one doesn't exist
          // const newWallet = await walletService.createWallet(supabaseUser.id, 'USD'); // Example currency
          // if (newWallet.data) setWallet(newWallet.data);
        }
      } catch (error) {
        console.error('Error fetching user profile or wallet:', error);
        toast.error('Failed to load user data.');
      }
    } else {
      setUser(null);
      setProfile(null);
      setWallet(null);
    }
  };


  useEffect(() => {
    setIsLoading(true);
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      await fetchUserProfileAndWallet(session?.user || null);
      setIsLoading(false);
    });

    const { data: authListener } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      await fetchUserProfileAndWallet(session?.user || null);
      if (_event === 'USER_UPDATED') {
        // If Supabase user object is updated, re-fetch profile too.
        if(session?.user) await fetchUserProfileAndWallet(session.user);
      }
      setIsLoading(false);
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string,password: string) => {
    setIsLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setIsLoading(false);
    if (error) throw error;
    return data;
  };

  const logout = async () => {
    setIsLoading(true);
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setWallet(null);
    setSession(null);
    setIsLoading(false);
  };

  const fetchUserProfile = async (userId: string) => { // Renamed from loadUser for clarity
    // This function might be redundant if onAuthStateChange handles it,
    // but useful for manual refresh or if profile updates outside auth events.
    const { data: { user: supabaseUser } } = await supabase.auth.getUser();
    if (supabaseUser && supabaseUser.id === userId) {
        await fetchUserProfileAndWallet(supabaseUser);
    }
  };

  const updateUserMetadata = async (metadataUpdate: Partial<User['user_metadata']>) => {
    if (!user) {
        toast.error("User not found for update.");
        return;
    }
    setIsLoading(true);
    try {
        const { data, error } = await supabase.auth.updateUser({
            data: metadataUpdate // user_metadata is updated via 'data' field
        });
        if (error) throw error;
        if (data.user) {
            // Update local user state. Supabase onAuthStateChange for USER_UPDATED should also trigger.
             setUser(prevUser => prevUser ? ({ ...prevUser, ...data.user }) : null); // Merge with existing local user state
             toast.success("Profile updated!");
        }
    } catch (error: any) {
        toast.error(error.message || "Failed to update profile.");
    } finally {
        setIsLoading(false);
    }
  };


  const isAuthenticated = !!user && !!session;

  return (
    <AuthContext.Provider value={{ 
        session, 
        user, 
        profile,
        wallet, 
        isLoading, 
        isAuthenticated, 
        login, 
        logout, 
        setUser, 
        setProfile,
        fetchUserProfile,
        updateUserMetadata
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
