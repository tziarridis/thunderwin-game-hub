
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/user'; // Your app's User type
import { PostgrestSingleResponse } from '@supabase/supabase-js';

// This service interacts with your public 'users' or 'profiles' table,
// NOT with Supabase's 'auth.users' table directly for fetching extended user data.

export const userService = {
  // Get user by their Supabase Auth ID (which is typically user.id from useAuth)
  async getUserById(authUserId: string): Promise<User | null> {
    // Assuming your 'profiles' table has an 'id' column that is a foreign key to 'auth.users.id'
    // OR your 'users' table has an 'auth_user_id' column linked to 'auth.users.id'.
    // Adjust '.eq('id', authUserId)' based on your actual schema.
    // If your public.users.id is different from auth.users.id, you'll need a join or a lookup table.
    
    // This example assumes your 'profiles' table 'id' column IS the auth.users.id
    // AND you have a RLS policy: CREATE POLICY "Users can view their own profile." ON profiles FOR SELECT USING (auth.uid() = id);
    // OR if fetching any user (e.g. for admin): ensure service_role key is used or appropriate RLS.
    
    // Let's assume `profiles` table where `id` is the auth user's ID
    // and it contains `username`, `full_name`, `avatar_url`.
    // The `User` type merges SupabaseUser and this profile.
    
    // First, get the Supabase Auth User object
    const { data: { user: supabaseAuthUser }, error: authError } = await supabase.auth.getUser();
    if (authError || !supabaseAuthUser || supabaseAuthUser.id !== authUserId) {
        console.error('Error fetching supabase auth user or ID mismatch:', authError);
        // If called from auth context on initial load and user is not logged in, this might be expected.
        // Don't throw if it's just "no user".
        if (authError && authError.message !== "User not found" && authError.message !== "No active session") {
             // throw authError;
        }
       // return null;
    }
    
    // If we need to fetch from a 'users' table linked by 'id' (auth.users.id)
    // This is a common pattern if you have a public.users table mirroring auth.users with extra fields
    // Example with a 'users' table. Adjust fields as necessary.
    // This example assumes your 'users' table uses the auth user's ID as its primary key 'id'.
    // Or, if 'users' has its own UUID and a 'auth_id' FK to auth.users.id, query by that.
    // For this project, it seems `User` type is directly mapping Supabase `User` object,
    // and `user_metadata` is the primary source for custom fields.
    // So, we directly use the supabaseAuthUser and enrich it if needed.

    if (!supabaseAuthUser) return null; // No authenticated user found by Supabase

    // Construct the User type object from SupabaseUser
    // The `User` type in `types/user.ts` should align with `SupabaseUser` structure
    // plus any custom fields you expect (e.g. from a joined profiles table or denormalized).
    // For now, we map directly from SupabaseUser as our `User` type is designed for this.
    const appUser: User = {
        ...supabaseAuthUser, // Spreads properties like id, email, created_at, user_metadata etc.
        // role: supabaseAuthUser.role, // Supabase User object already has role
        // Ensure all properties of your User type are covered here.
        // If 'profiles' table is used for more data, you'd fetch and merge here.
    };

    // Example: if you had a separate `profiles` table with `username`
    /*
    const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url, vip_level') // select desired fields
        .eq('id', authUserId) // assuming profiles.id is FK to auth.users.id
        .single();

    if (profileError) {
        // console.warn('Could not fetch user profile details:', profileError.message);
        // Don't throw, user might exist in auth but not profile yet (e.g. due to trigger lag/failure)
    }

    if (profileData) {
        appUser.user_metadata = {
            ...appUser.user_metadata,
            username: profileData.username || appUser.user_metadata.username,
            full_name: profileData.full_name || appUser.user_metadata.full_name,
            avatar_url: profileData.avatar_url || appUser.user_metadata.avatar_url,
            vip_level: profileData.vip_level || appUser.user_metadata.vip_level,
        };
    }
    */
    // The current User type structure relies on user_metadata for most custom fields.

    return appUser;
  },

  async updateUser(userId: string, userData: Partial<User>): Promise<User | null> {
    // This would update your public 'users' or 'profiles' table.
    // Supabase auth user metadata is updated via supabase.auth.updateUser()
    // For user_metadata:
    if (userData.user_metadata) {
        const { data, error: metaError } = await supabase.auth.updateUser({
            data: userData.user_metadata
        });
        if (metaError) throw metaError;
        // Auth listener should pick this up, or re-fetch user.
    }
    
    // For other fields if they are in a separate public table:
    // const { data, error } = await supabase
    //   .from('users') // or 'profiles'
    //   .update({ /* fields from userData that are in this table */ })
    //   .eq('id', userId) // or your FK to auth.users.id
    //   .select()
    //   .single();
    // if (error) throw error;
    // return data ? (data as User) : null; 

    // For now, primarily handles metadata through auth.updateUser, then refetches.
    return this.getUserById(userId); 
  },

  async getAllUsers(limit: number = 20, offset: number = 0): Promise<{ users: User[], count: number | null }> {
    // This would typically be an admin function and requires appropriate RLS
    // or using the service_role key. For simplicity, let's assume RLS allows admin to read.
    // This needs to fetch from your public table that stores user info, not directly all auth.users.
    // Example: fetching from a 'profiles' table or a view.
    
    // This is a simplified version. A real admin panel would list users from a 'users' or 'profiles' table.
    // Supabase doesn't provide a direct client-side API to list all auth.users.
    // You usually sync auth.users to a public table using triggers.
    
    // For now, this is a placeholder. You'd query your 'users' or 'profiles' table.
    // const { data, error, count } = await supabase
    //   .from('users_view') // or 'profiles' or 'users'
    //   .select('*', { count: 'exact' })
    //   .range(offset, offset + limit - 1);

    // if (error) throw error;
    // return { users: data as User[], count };
    
    // Placeholder if no public user listing table exists:
    console.warn("userService.getAllUsers: Listing all auth users directly is not standard. Query your public user table.");
    return { users: [], count: 0 };
  },
  
  // Add other user-related service methods as needed
};

